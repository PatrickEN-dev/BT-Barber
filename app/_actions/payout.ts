"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";

import { UnauthorizedError } from "./_errors";

interface PayoutRow {
  id: string;
  amount: string;
  paidAt: Date;
  notes: string | null;
}

interface ShopBalance {
  /** Sum of subtotalAmount for all PAID payments. */
  totalEarnedBRL: string;
  /** Sum of platformFeeAmount across all PAID payments — what the platform retained. */
  totalPlatformFeeBRL: string;
  /** Sum of refunded amounts (returned to customers). */
  totalRefundedBRL: string;
  /** Sum of recorded payouts to this shop. */
  totalPaidOutBRL: string;
  /** What's still owed to the shop = earned - refunded - paidOut. */
  pendingBRL: string;
  paidPaymentsCount: number;
  payouts: PayoutRow[];
}

const ZERO = new Prisma.Decimal(0);

const requireOwnerOf = async (shopId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  const shop = await db.barbershop.findFirst({
    where: { id: shopId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!shop) throw new UnauthorizedError();
  return session.user.id;
};

/**
 * Owner-facing balance for a single shop. Aggregates all PAID payments,
 * subtracts refunds and recorded payouts. The "pending" number is what the
 * platform still owes the shop (single-account model — money sits in the
 * platform Stripe balance until manually transferred via PIX/TED).
 */
export const getShopBalance = async (shopId: string): Promise<ShopBalance> => {
  await requireOwnerOf(shopId);

  // Earnings: sum of subtotal across PAID payments. We sum subtotal, not
  // amount, because subtotal is what belongs to the shop (amount = subtotal +
  // platform fee).
  const earnings = await db.payment.aggregate({
    where: { barbershopId: shopId, status: "PAID" },
    _sum: { subtotalAmount: true, platformFeeAmount: true, refundedAmount: true },
    _count: true,
  });

  // Also count PARTIAL_REFUND and REFUNDED for the refunds total.
  const refunds = await db.payment.aggregate({
    where: {
      barbershopId: shopId,
      status: { in: ["REFUNDED", "PARTIAL_REFUND"] },
    },
    _sum: { refundedAmount: true, subtotalAmount: true, platformFeeAmount: true },
  });

  const payouts = await db.payout.findMany({
    where: { barbershopId: shopId },
    orderBy: { paidAt: "desc" },
    select: { id: true, amount: true, paidAt: true, notes: true },
  });

  // Refunded payments still contributed their subtotal to earnings before the
  // refund hit. Subtract just the refundedAmount, not the whole subtotal.
  // For PARTIAL_REFUND, the shop keeps (subtotal - refunded). For REFUNDED, 0.
  const earnedFromPaid = earnings._sum.subtotalAmount ?? ZERO;
  const earnedFromPartialOrRefunded = refunds._sum.subtotalAmount ?? ZERO;
  const totalRefunded =
    (earnings._sum.refundedAmount ?? ZERO).plus(refunds._sum.refundedAmount ?? ZERO);

  // The shop's gross earnings include everything that was once paid (PAID +
  // PARTIAL_REFUND + REFUNDED), then we subtract the refunded amount.
  const totalEarned = earnedFromPaid.plus(earnedFromPartialOrRefunded).minus(totalRefunded);
  const totalPlatformFee = (earnings._sum.platformFeeAmount ?? ZERO).plus(
    refunds._sum.platformFeeAmount ?? ZERO
  );

  const totalPaidOut = payouts.reduce(
    (acc, p) => acc.plus(p.amount),
    new Prisma.Decimal(0)
  );

  const pending = totalEarned.minus(totalPaidOut);

  return {
    totalEarnedBRL: totalEarned.toFixed(2),
    totalPlatformFeeBRL: totalPlatformFee.toFixed(2),
    totalRefundedBRL: totalRefunded.toFixed(2),
    totalPaidOutBRL: totalPaidOut.toFixed(2),
    pendingBRL: pending.toFixed(2),
    paidPaymentsCount: earnings._count,
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: p.amount.toString(),
      paidAt: p.paidAt,
      notes: p.notes,
    })),
  };
};

/**
 * Record a manual payout from the platform to a shop. The actual money
 * transfer happens out-of-band (PIX/TED initiated by the platform admin
 * from their own bank). This action just bookkeeps it.
 *
 * Restricted to platform admins. For now, "platform admin" = anyone who
 * owns shops. When we have a real platform-admin role, gate this further.
 *
 * Pragmatically: in dev/early production, this is called manually via Prisma
 * Studio. The action exists so a future admin UI can call it.
 */
export const recordPayout = async (input: {
  barbershopId: string;
  amountBRL: string;
  notes?: string;
}) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  // Until we have a true platform-admin role, only the shop owner can record
  // their own payout (essentially marking what they've received). This is a
  // weak check — replace with an admin role gate when we add one.
  await requireOwnerOf(input.barbershopId);

  const amount = Number(input.amountBRL);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Valor inválido.");
  if (amount > 1_000_000) throw new Error("Valor muito alto, verifica o input.");

  await rateLimit(`shop:${input.barbershopId}:payout`, { max: 5, windowMs: 60_000 });

  const payout = await db.payout.create({
    data: {
      barbershopId: input.barbershopId,
      amount: new Prisma.Decimal(amount.toFixed(2)),
      notes: input.notes?.trim() || null,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/admin/${input.barbershopId}/payouts`);

  await audit({
    userId: session.user.id,
    action: "SHOP_SETTINGS_UPDATE", // closest fit; could add PAYOUT_RECORD action later
    barbershopId: input.barbershopId,
    targetType: "Barbershop",
    targetId: input.barbershopId,
    metadata: { payoutId: payout.id, amount: amount.toFixed(2) },
  });

  return { id: payout.id };
};
