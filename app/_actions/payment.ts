"use server";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";
import { serializePayment, type SerializedPayment } from "@/app/_lib/serializers";
import { stripe, toStripeAmount } from "@/app/_lib/stripe";

import { UnauthorizedError } from "./_errors";

interface CreateOrderCheckoutInput {
  orderId: string;
  method: PaymentMethod;
}

interface CheckoutResult {
  payment: SerializedPayment;
  /** Stripe client_secret — used by Card flow with Stripe Elements/PaymentElement. */
  clientSecret?: string;
}

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
    include: { payment: true, items: { include: { product: true } } },
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

  const amountCents = toStripeAmount(order.total.toString());
  const description = `Pedido ${order.id.slice(0, 8)} — ${order.items.length} ${
    order.items.length === 1 ? "item" : "itens"
  }`;

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "brl",
    description,
    payment_method_types: input.method === "PIX" ? ["pix"] : ["card"],
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
      amount: order.total,
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
    metadata: { paymentId: payment.id, method: input.method, amount: order.total.toString() },
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
      console.error("[payment] polling Stripe failed:", err);
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
