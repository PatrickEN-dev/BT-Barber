"use server";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { logError } from "@/app/_lib/log";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";
import { serializePayment, type SerializedPayment } from "@/app/_lib/serializers";
import { stripe, toStripeAmount } from "@/app/_lib/stripe";

import { UnauthorizedError } from "./_errors";

interface CreateOrderCheckoutInput {
  orderId: string;
  method: PaymentMethod;
}

interface CreateBookingCheckoutInput {
  bookingId: string;
  method: PaymentMethod;
}

interface CheckoutResult {
  payment: SerializedPayment;
  /** Stripe client_secret — used by Card flow with Stripe Elements/PaymentElement. */
  clientSecret?: string;
}

/**
 * Centralized fee math. The barbershop's `platformFeePercent` (default 5%)
 * is added on top of the subtotal — customer pays subtotal + fee, barbershop
 * earns subtotal, platform retains fee.
 *
 * Always operates in cents to avoid floating-point drift, then converts back
 * to Decimal-friendly BRL strings.
 */
interface FeeBreakdown {
  subtotalBRL: string;
  feeBRL: string;
  totalBRL: string;
  subtotalCents: number;
  feeCents: number;
  totalCents: number;
}

const computeFee = (subtotalBRL: number | string, feePercent: number | string): FeeBreakdown => {
  const subtotalCents = toStripeAmount(subtotalBRL);
  const percent = Number(feePercent);
  const feeCents = Math.round((subtotalCents * percent) / 100);
  const totalCents = subtotalCents + feeCents;
  return {
    subtotalCents,
    feeCents,
    totalCents,
    subtotalBRL: (subtotalCents / 100).toFixed(2),
    feeBRL: (feeCents / 100).toFixed(2),
    totalBRL: (totalCents / 100).toFixed(2),
  };
};

/**
 * Quote the breakdown without creating any DB row or Stripe intent. Useful
 * for the UI to show "subtotal + taxa = total" before the user clicks pay.
 */
export const quoteCheckoutFee = async (input: {
  kind: "order" | "booking";
  targetId: string;
}): Promise<FeeBreakdown> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  if (input.kind === "order") {
    const order = await db.order.findUnique({
      where: { id: input.targetId },
      include: { barbershop: { select: { platformFeePercent: true } } },
    });
    if (!order || order.userId !== userId) throw new UnauthorizedError();
    return computeFee(order.total.toString(), order.barbershop.platformFeePercent.toString());
  }

  const booking = await db.booking.findUnique({
    where: { id: input.targetId },
    include: {
      barbershop: { select: { platformFeePercent: true } },
      services: { include: { service: { select: { price: true } } } },
    },
  });
  if (!booking || booking.userId !== userId) throw new UnauthorizedError();
  const subtotal = booking.services.reduce((sum, bs) => sum + Number(bs.service.price), 0);
  return computeFee(subtotal, booking.barbershop.platformFeePercent.toString());
};

/**
 * Initiates a checkout for an existing Order. Creates a Stripe PaymentIntent
 * and persists a Payment row tracking the lifecycle. Returns the Payment plus
 * (for card payments) the client_secret needed to confirm on the frontend.
 *
 * For PIX: the QR code data lands in the webhook flow; we fetch the latest
 * intent state in the action so the caller can render the QR immediately.
 */
export const createOrderCheckout = async (
  input: CreateOrderCheckoutInput
): Promise<CheckoutResult> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  await rateLimit(`user:${userId}:checkout`, { max: 20, windowMs: 60_000 });

  const order = await db.order.findUnique({
    where: { id: input.orderId },
    include: {
      payment: true,
      items: { include: { product: true } },
      barbershop: { select: { platformFeePercent: true } },
    },
  });
  if (!order) throw new Error("Pedido não encontrado.");
  if (order.userId !== userId) throw new UnauthorizedError();

  // Re-use existing PENDING payment if there is one (avoids creating multiple
  // PaymentIntents if the user closes and reopens the checkout).
  if (order.payment && order.payment.status === "PENDING" && order.payment.method === input.method) {
    const intent = order.payment.externalId
      ? await stripe.paymentIntents.retrieve(order.payment.externalId)
      : null;
    return {
      payment: serializePayment(order.payment),
      clientSecret: intent?.client_secret ?? undefined,
    };
  }

  // Block paying for orders that are already past PENDING/CONFIRMED.
  if (order.status === "CANCELLED" || order.status === "COMPLETED") {
    throw new Error("Esse pedido não pode mais ser pago.");
  }

  const fee = computeFee(order.total.toString(), order.barbershop.platformFeePercent.toString());
  const description = `Pedido ${order.id.slice(0, 8)} — ${order.items.length} ${
    order.items.length === 1 ? "item" : "itens"
  }`;

  const intent = await stripe.paymentIntents.create({
    amount: fee.totalCents,
    currency: "brl",
    description,
    payment_method_types: input.method === "PIX" ? ["pix"] : ["card"],
    // Stripe sends an automatic email receipt to this address on success
    // (works for cards in BR; for PIX, customers also get the QR receipt
    // through us, but having Stripe's receipt as backup is harmless).
    ...(session.user.email ? { receipt_email: session.user.email } : {}),
    metadata: {
      orderId: order.id,
      barbershopId: order.barbershopId,
      userId,
      kind: "order",
    },
    ...(input.method === "PIX"
      ? {
          payment_method_data: { type: "pix" },
          confirm: true,
          payment_method_options: {
            pix: { expires_after_seconds: 30 * 60 }, // 30 min QR validity
          },
        }
      : {}),
  });

  // Pull QR fields from the next_action payload (PIX only).
  const nextAction = intent.next_action;
  const pixDisplay =
    nextAction?.type === "pix_display_qr_code" ? nextAction.pix_display_qr_code : null;

  const payment = await db.payment.upsert({
    where: { orderId: order.id },
    create: {
      externalId: intent.id,
      amount: fee.totalBRL,
      subtotalAmount: fee.subtotalBRL,
      platformFeeAmount: fee.feeBRL,
      currency: "BRL",
      method: input.method,
      status: "PENDING",
      orderId: order.id,
      userId,
      barbershopId: order.barbershopId,
      qrCodeImage: pixDisplay?.image_url_png ?? null,
      qrCodeText: pixDisplay?.data ?? null,
      expiresAt:
        pixDisplay?.expires_at != null ? new Date(pixDisplay.expires_at * 1000) : null,
      metadata: { intentClientSecret: intent.client_secret ?? null },
    },
    update: {
      externalId: intent.id,
      amount: fee.totalBRL,
      subtotalAmount: fee.subtotalBRL,
      platformFeeAmount: fee.feeBRL,
      method: input.method,
      status: "PENDING",
      qrCodeImage: pixDisplay?.image_url_png ?? null,
      qrCodeText: pixDisplay?.data ?? null,
      expiresAt:
        pixDisplay?.expires_at != null ? new Date(pixDisplay.expires_at * 1000) : null,
      paidAt: null,
      failedAt: null,
      failureReason: null,
    },
  });

  await audit({
    userId,
    action: "ORDER_CREATE",
    barbershopId: order.barbershopId,
    targetType: "Order",
    targetId: order.id,
    metadata: {
      paymentId: payment.id,
      method: input.method,
      subtotal: fee.subtotalBRL,
      fee: fee.feeBRL,
      total: fee.totalBRL,
    },
  });

  revalidatePath("/orders");
  revalidatePath(`/admin/${order.barbershopId}/orders`);

  return {
    payment: serializePayment(payment),
    clientSecret: intent.client_secret ?? undefined,
  };
};

/**
 * Polling fallback for clients that don't catch the webhook fast enough.
 * Returns the current Payment row (status may still be PENDING; the client
 * loops every few seconds until it sees PAID/FAILED/EXPIRED).
 */
export const getPaymentStatus = async (paymentId: string): Promise<SerializedPayment> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Pagamento não encontrado.");
  if (payment.userId !== session.user.id) throw new UnauthorizedError();

  // Hot path: if still PENDING after 30s, ask Stripe directly so we don't
  // wait on the webhook. Stripe is the source of truth.
  if (payment.status === "PENDING" && payment.externalId) {
    try {
      const intent = await stripe.paymentIntents.retrieve(payment.externalId);
      const nextStatus = mapIntentStatus(intent.status);
      if (nextStatus !== "PENDING") {
        const updated = await db.payment.update({
          where: { id: payment.id },
          data: {
            status: nextStatus,
            ...(nextStatus === "PAID" ? { paidAt: new Date() } : {}),
            ...(nextStatus === "FAILED" ? { failedAt: new Date() } : {}),
          },
        });
        // Side effect when paid via polling (mirrors webhook handler).
        if (nextStatus === "PAID" && payment.orderId) {
          await db.order.update({
            where: { id: payment.orderId },
            data: { status: "CONFIRMED" },
          });
        }
        return serializePayment(updated);
      }
    } catch (err) {
      logError("payment", err, { phase: "polling-stripe", paymentId: payment.id });
    }
  }

  return serializePayment(payment);
};

const mapIntentStatus = (status: string): PaymentStatus => {
  switch (status) {
    case "succeeded":
      return "PAID";
    case "canceled":
      return "EXPIRED";
    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
    case "processing":
      return "PENDING";
    default:
      return "PENDING";
  }
};

/**
 * Booking checkout — same shape as createOrderCheckout but the Payment row
 * is linked to a Booking and total comes from BookingService prices.
 */
export const createBookingCheckout = async (
  input: CreateBookingCheckoutInput
): Promise<CheckoutResult> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();
  const userId = session.user.id;

  await rateLimit(`user:${userId}:checkout`, { max: 20, windowMs: 60_000 });

  const booking = await db.booking.findUnique({
    where: { id: input.bookingId },
    include: {
      payment: true,
      services: { include: { service: true } },
      barbershop: { select: { platformFeePercent: true } },
    },
  });
  if (!booking) throw new Error("Reserva não encontrada.");
  if (booking.userId !== userId) throw new UnauthorizedError();

  if (booking.payment && booking.payment.status === "PAID") {
    throw new Error("Esta reserva já foi paga.");
  }

  // Reuse pending payment if same method (avoids stale intents).
  if (
    booking.payment &&
    booking.payment.status === "PENDING" &&
    booking.payment.method === input.method &&
    booking.payment.externalId
  ) {
    const intent = await stripe.paymentIntents.retrieve(booking.payment.externalId);
    return {
      payment: serializePayment(booking.payment),
      clientSecret: intent.client_secret ?? undefined,
    };
  }

  const subtotal = booking.services.reduce((sum, bs) => sum + Number(bs.service.price), 0);
  const fee = computeFee(subtotal, booking.barbershop.platformFeePercent.toString());

  const intent = await stripe.paymentIntents.create({
    amount: fee.totalCents,
    currency: "brl",
    description: `Reserva ${booking.id.slice(0, 8)} — ${booking.services.length} serviço${
      booking.services.length === 1 ? "" : "s"
    }`,
    payment_method_types: input.method === "PIX" ? ["pix"] : ["card"],
    ...(session.user.email ? { receipt_email: session.user.email } : {}),
    metadata: {
      bookingId: booking.id,
      barbershopId: booking.barbershopId,
      userId,
      kind: "booking",
    },
    ...(input.method === "PIX"
      ? {
          payment_method_data: { type: "pix" },
          confirm: true,
          payment_method_options: {
            pix: { expires_after_seconds: 30 * 60 },
          },
        }
      : {}),
  });

  const nextAction = intent.next_action;
  const pixDisplay =
    nextAction?.type === "pix_display_qr_code" ? nextAction.pix_display_qr_code : null;

  const payment = await db.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      externalId: intent.id,
      amount: fee.totalBRL,
      subtotalAmount: fee.subtotalBRL,
      platformFeeAmount: fee.feeBRL,
      currency: "BRL",
      method: input.method,
      status: "PENDING",
      bookingId: booking.id,
      userId,
      barbershopId: booking.barbershopId,
      qrCodeImage: pixDisplay?.image_url_png ?? null,
      qrCodeText: pixDisplay?.data ?? null,
      expiresAt:
        pixDisplay?.expires_at != null ? new Date(pixDisplay.expires_at * 1000) : null,
    },
    update: {
      externalId: intent.id,
      amount: fee.totalBRL,
      subtotalAmount: fee.subtotalBRL,
      platformFeeAmount: fee.feeBRL,
      method: input.method,
      status: "PENDING",
      qrCodeImage: pixDisplay?.image_url_png ?? null,
      qrCodeText: pixDisplay?.data ?? null,
      expiresAt:
        pixDisplay?.expires_at != null ? new Date(pixDisplay.expires_at * 1000) : null,
      paidAt: null,
      failedAt: null,
      failureReason: null,
    },
  });

  await audit({
    userId,
    action: "BOOKING_CREATE",
    barbershopId: booking.barbershopId,
    targetType: "Booking",
    targetId: booking.id,
    metadata: {
      paymentId: payment.id,
      method: input.method,
      subtotal: fee.subtotalBRL,
      fee: fee.feeBRL,
      total: fee.totalBRL,
    },
  });

  revalidatePath("/bookings");
  revalidatePath(`/admin/${booking.barbershopId}/bookings`);

  return {
    payment: serializePayment(payment),
    clientSecret: intent.client_secret ?? undefined,
  };
};

/**
 * Cancellation policy for paid bookings.
 *
 * Tiers (configurable per shop later — hard-coded global for v1):
 * - 24h+ before booking date → 100% refund of subtotal
 * - 2-24h before → 50% refund of subtotal (other 50% kept by barbershop as fee)
 * - <2h before / no-show → 0% refund of subtotal (full subtotal kept as fee)
 *
 * Platform fee is ALWAYS retained, regardless of tier. The customer paid for
 * the platform's service of processing the transaction, so the fee stays.
 */
const HOURS_BEFORE_FULL_REFUND = 24;
const HOURS_BEFORE_HALF_REFUND = 2;

interface RefundComputation {
  /** Amount we ask Stripe to refund — calculated against subtotal, not total. */
  refundCents: number;
  /** Subtotal portion the barbershop keeps as cancellation fee. */
  shopFeeCents: number;
  /** Platform fee — always retained, never refunded. */
  platformFeeCents: number;
  tier: "FULL" | "HALF" | "NONE";
}

const computeRefund = (
  subtotalAmount: string,
  platformFeeAmount: string,
  bookingDate: Date
): RefundComputation => {
  const subtotalCents = toStripeAmount(subtotalAmount);
  const platformFeeCents = toStripeAmount(platformFeeAmount);
  const hoursUntil = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursUntil >= HOURS_BEFORE_FULL_REFUND) {
    return { refundCents: subtotalCents, shopFeeCents: 0, platformFeeCents, tier: "FULL" };
  }
  if (hoursUntil >= HOURS_BEFORE_HALF_REFUND) {
    const half = Math.floor(subtotalCents / 2);
    return {
      refundCents: half,
      shopFeeCents: subtotalCents - half,
      platformFeeCents,
      tier: "HALF",
    };
  }
  return {
    refundCents: 0,
    shopFeeCents: subtotalCents,
    platformFeeCents,
    tier: "NONE",
  };
};

/**
 * Customer-facing booking cancellation. Computes refund tier based on how
 * close we are to the booking, refunds via Stripe, and deletes the booking
 * to free the slot.
 *
 * Returns the refund tier so the UI can show "you got 50% back" etc.
 */
export const cancelBookingWithRefund = async (
  bookingId: string
): Promise<{ tier: "FULL" | "HALF" | "NONE"; refundedCents: number }> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  await rateLimit(`user:${session.user.id}:cancelBooking`, {
    max: 10,
    windowMs: 60_000,
  });

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });
  if (!booking) throw new Error("Reserva não encontrada.");
  if (booking.userId !== session.user.id) throw new UnauthorizedError();

  // No payment yet — straight delete (legacy behavior for unpaid bookings).
  if (!booking.payment || booking.payment.status !== "PAID") {
    await db.booking.delete({ where: { id: bookingId } });
    revalidatePath("/");
    revalidatePath("/bookings");
    await audit({
      userId: session.user.id,
      action: "BOOKING_CANCEL",
      barbershopId: booking.barbershopId,
      targetType: "Booking",
      targetId: bookingId,
    });
    return { tier: "FULL", refundedCents: 0 };
  }

  const refund = computeRefund(
    booking.payment.subtotalAmount.toString(),
    booking.payment.platformFeeAmount.toString(),
    booking.date
  );

  // Issue partial/full refund via Stripe (skipped if tier=NONE).
  // Idempotency key keyed on the booking — re-clicking cancel doesn't issue
  // a duplicate refund (Stripe returns the original refund object).
  if (refund.refundCents > 0 && booking.payment.externalId) {
    await stripe.refunds.create(
      {
        payment_intent: booking.payment.externalId,
        amount: refund.refundCents,
        reason: "requested_by_customer",
        metadata: {
          bookingId,
          tier: refund.tier,
          shopFeeCents: String(refund.shopFeeCents),
          platformFeeCents: String(refund.platformFeeCents),
        },
      },
      { idempotencyKey: `booking-cancel-${bookingId}` }
    );
    // Webhook will mark Payment as REFUNDED/PARTIAL_REFUND. We don't update
    // the row here to avoid race conditions with the webhook.
  }

  // Free the slot regardless of refund tier — booking is dead.
  await db.booking.delete({ where: { id: bookingId } });

  revalidatePath("/");
  revalidatePath("/bookings");
  revalidatePath(`/admin/${booking.barbershopId}/bookings`);

  await audit({
    userId: session.user.id,
    action: "BOOKING_CANCEL",
    barbershopId: booking.barbershopId,
    targetType: "Booking",
    targetId: bookingId,
    metadata: {
      tier: refund.tier,
      refundedCents: refund.refundCents,
      shopFeeCents: refund.shopFeeCents,
      platformFeeCents: refund.platformFeeCents,
    },
  });

  return { tier: refund.tier, refundedCents: refund.refundCents };
};

/**
 * Owner action: mark a booking as no-show. The customer doesn't get a refund
 * — the full payment amount stays as a no-show fee.
 *
 * The booking row stays (with `noShow=true`) so the owner has a record. The
 * service slot is already in the past at this point so freeing it is moot.
 */
export const markBookingNoShow = async (bookingId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { barbershop: { select: { ownerId: true } } },
  });
  if (!booking) throw new Error("Reserva não encontrada.");
  if (booking.barbershop.ownerId !== session.user.id) throw new UnauthorizedError();
  if (booking.date.getTime() > Date.now()) {
    throw new Error("Só é possível marcar no-show após o horário da reserva.");
  }

  await rateLimit(`user:${session.user.id}:markNoShow`, { max: 30, windowMs: 60_000 });

  await db.booking.update({
    where: { id: bookingId },
    data: { noShow: true },
  });

  revalidatePath(`/admin/${booking.barbershopId}/bookings`);
  revalidatePath("/bookings");

  await audit({
    userId: session.user.id,
    action: "BOOKING_CANCEL",
    barbershopId: booking.barbershopId,
    targetType: "Booking",
    targetId: bookingId,
    metadata: { noShow: true },
  });
};

/**
 * Owner-initiated refund (override). For exceptional cases — e.g. they want
 * to give a full refund despite the policy saying half. Refunds the full
 * remaining balance (subtotal + platform fee — owner is overriding policy,
 * so they eat the platform fee too if Stripe allows).
 *
 * Side effects: also cancels the linked Order (with restock) or deletes the
 * linked Booking (frees the slot). Without these, the owner-refunded order
 * would stay listed as CONFIRMED and confuse staff.
 */
export const refundPaymentByOwner = async (paymentId: string, reason?: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      barbershop: { select: { ownerId: true } },
      order: { include: { items: true } },
    },
  });
  if (!payment) throw new Error("Pagamento não encontrado.");
  if (payment.barbershop.ownerId !== session.user.id) throw new UnauthorizedError();
  if (payment.status !== "PAID" && payment.status !== "PARTIAL_REFUND") {
    throw new Error("Esse pagamento não pode ser estornado.");
  }
  if (!payment.externalId) throw new Error("Pagamento sem referência Stripe.");

  await rateLimit(`shop:${payment.barbershopId}:refund`, { max: 20, windowMs: 60_000 });

  // Refund whatever's left after partial refunds.
  const remainingCents =
    toStripeAmount(payment.amount.toString()) -
    toStripeAmount(payment.refundedAmount.toString());
  if (remainingCents <= 0) throw new Error("Já estornado integralmente.");

  await stripe.refunds.create(
    {
      payment_intent: payment.externalId,
      amount: remainingCents,
      reason: "requested_by_customer",
      metadata: { paymentId, ownerOverride: "true", reason: reason ?? "" },
    },
    { idempotencyKey: `owner-refund-${paymentId}` }
  );
  // Webhook handleChargeRefunded will flip Payment.status to REFUNDED.

  // Cancel the underlying Order (restock + status flip) so the owner doesn't
  // see a "CONFIRMED" order that was actually refunded. Conditional on status
  // != CANCELLED so a re-run is idempotent. For Bookings, we delete the row
  // to free the slot — same as the customer-initiated cancel flow.
  if (payment.order && payment.order.status !== "CANCELLED" && payment.order.status !== "COMPLETED") {
    await db.$transaction(async (tx) => {
      const flip = await tx.order.updateMany({
        where: { id: payment.orderId!, status: { not: "CANCELLED" } },
        data: { status: "CANCELLED" },
      });
      if (flip.count === 0) return;
      for (const item of payment.order!.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
  }
  if (payment.bookingId) {
    // Delete to free the slot. onDelete:SetNull on Payment.bookingId means
    // the Payment row stays for accounting.
    await db.booking.deleteMany({ where: { id: payment.bookingId } });
  }

  revalidatePath(`/admin/${payment.barbershopId}/orders`);
  revalidatePath(`/admin/${payment.barbershopId}/bookings`);
  revalidatePath("/orders");
  revalidatePath("/bookings");

  await audit({
    userId: session.user.id,
    action: payment.orderId ? "ORDER_CANCEL" : "BOOKING_CANCEL",
    barbershopId: payment.barbershopId,
    targetType: payment.orderId ? "Order" : "Booking",
    targetId: payment.orderId ?? payment.bookingId ?? "",
    metadata: { paymentId, ownerRefund: true, reason, refundedCents: remainingCents },
  });
};

