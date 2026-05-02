import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import { audit } from "@/app/_lib/audit";
import { logError, logWarn } from "@/app/_lib/log";
import { db } from "@/app/_lib/prisma";
import { stripe } from "@/app/_lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook receiver.
 *
 * Stripe pushes asynchronous events here when payment state changes
 * (PIX confirmed, card charged, refund processed, etc). The signature
 * header is HMAC'd with `STRIPE_WEBHOOK_SECRET` so we can trust the body
 * actually came from Stripe.
 *
 * Idempotency: Stripe can deliver the same event multiple times. Our handlers
 * are written to be safe under duplicate delivery — they look up the Payment
 * by `externalId` and only transition forward (e.g. PENDING → PAID, never
 * PAID → PENDING).
 *
 * Dev: run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` —
 * the CLI prints the webhook signing secret to put in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    logError("stripe-webhook", new Error("missing signature or webhook secret"), {
      hasSignature: Boolean(signature),
      hasSecret: Boolean(webhookSecret),
    });
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 400 });
  }

  // Read the raw body — `req.text()` is required because constructEvent
  // verifies the signature against the exact bytes Stripe sent.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    logError("stripe-webhook", err, { phase: "signature-verification" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: dedupe by Stripe event.id. If we've already processed this
  // event, skip silently and return 200 so Stripe stops retrying.
  try {
    await db.webhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ received: true, deduplicated: true });
    }
    throw err;
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        // No-op for events we don't care about — return 200 so Stripe doesn't retry.
        break;
    }
  } catch (err) {
    logError("stripe-webhook", err, { eventType: event.type, eventId: event.id });
    // Roll back the dedup row so a retry can re-process.
    await db.webhookEvent.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

const handlePaymentSucceeded = async (intent: Stripe.PaymentIntent) => {
  const payment = await db.payment.findUnique({ where: { externalId: intent.id } });
  if (!payment) {
    logWarn("stripe-webhook", "PaymentIntent succeeded but no matching Payment row", {
      intentId: intent.id,
    });
    return;
  }
  if (payment.status === "PAID") return; // already processed (idempotent)

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      metadata: {
        ...(payment.metadata as object | null),
        chargeId: intent.latest_charge?.toString() ?? null,
      },
    },
  });

  // Side effect: when an Order is paid, also confirm the Order itself so
  // the owner sees it in CONFIRMED status and the customer in "Aguardando".
  // updateMany tolerates the order being already cancelled (CANCELLED won't match).
  if (payment.orderId) {
    await db.order.updateMany({
      where: { id: payment.orderId, status: "PENDING" },
      data: { status: "CONFIRMED" },
    });
    revalidatePath(`/admin/${payment.barbershopId}/orders`);
    revalidatePath("/orders");
  }
  if (payment.bookingId) {
    // Clear holdUntil — booking is now permanent and the slot is locked.
    // updateMany tolerates the booking being deleted (e.g., user cancelled
    // mid-payment race) — 0 affected rows is fine.
    await db.booking.updateMany({
      where: { id: payment.bookingId, holdUntil: { not: null } },
      data: { holdUntil: null },
    });
    revalidatePath("/bookings");
    revalidatePath(`/admin/${payment.barbershopId}/bookings`);
  }

  await audit({
    userId: payment.userId,
    action: "PAYMENT_SUCCEEDED",
    barbershopId: payment.barbershopId,
    targetType: payment.orderId ? "Order" : "Booking",
    targetId: payment.orderId ?? payment.bookingId ?? "",
    metadata: { paymentId: payment.id, method: payment.method, amount: payment.amount.toString() },
  });
};

/**
 * Restock + cancel the Order tied to a Payment that ended without success
 * (PIX expired, card declined, intent canceled). Idempotent via the
 * `status: "PENDING"` filter on updateMany — won't double-restock.
 *
 * Bookings aren't touched here: the cleanup cron handles them through
 * holdUntil expiry, since deleting a Booking row also frees the slot
 * (whereas an Order is just a record we mark CANCELLED).
 */
const cancelOrderForFailedPayment = async (
  payment: { id: string; userId: string; barbershopId: string; orderId: string | null },
  reason: string
) => {
  if (!payment.orderId) return;

  const order = await db.order.findUnique({
    where: { id: payment.orderId },
    include: { items: true },
  });
  if (!order || order.status !== "PENDING") return;

  await db.$transaction(async (tx) => {
    const flip = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (flip.count === 0) return; // someone else already flipped it
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  revalidatePath(`/admin/${payment.barbershopId}/orders`);
  revalidatePath("/orders");

  await audit({
    userId: payment.userId,
    action: "ORDER_CANCEL",
    barbershopId: payment.barbershopId,
    targetType: "Order",
    targetId: order.id,
    metadata: { reason, paymentId: payment.id },
  });
};

const handlePaymentFailed = async (intent: Stripe.PaymentIntent) => {
  const payment = await db.payment.findUnique({ where: { externalId: intent.id } });
  if (!payment || payment.status === "FAILED") return;

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: "FAILED",
      failedAt: new Date(),
      failureReason: intent.last_payment_error?.message ?? "Pagamento recusado",
    },
  });

  // Card declined / 3DS failed / etc. The PaymentIntent stays alive in Stripe
  // and the customer can retry from the same checkout dialog (PENDING reuse
  // path in createOrderCheckout). Don't auto-cancel the Order here — only on
  // explicit canceled / expired events. Just record the failure.
};

const handlePaymentCanceled = async (intent: Stripe.PaymentIntent) => {
  const payment = await db.payment.findUnique({
    where: { externalId: intent.id },
  });
  if (!payment) return;
  if (payment.status === "CANCELED" || payment.status === "PAID") return;

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "EXPIRED" },
  });

  // PIX expired (or intent was canceled) before the customer paid.
  // For Orders: restock + cancel the order so stock isn't leaked forever.
  // For Bookings: the cleanup cron handles deletion via holdUntil.
  await cancelOrderForFailedPayment(payment, "pix_expired");
};

const handleChargeRefunded = async (charge: Stripe.Charge) => {
  const intentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!intentId) return;

  const payment = await db.payment.findUnique({ where: { externalId: intentId } });
  if (!payment) return;

  const refundedCents = charge.amount_refunded;
  const totalCents = charge.amount;
  const isFullRefund = refundedCents >= totalCents;
  const newStatus = isFullRefund ? "REFUNDED" : "PARTIAL_REFUND";

  // Idempotent: only forward-progress (PAID → PARTIAL_REFUND → REFUNDED).
  // Don't overwrite a PARTIAL_REFUND with a smaller refundedAmount, and don't
  // overwrite REFUNDED with PARTIAL_REFUND.
  if (payment.status === "REFUNDED" && newStatus === "PARTIAL_REFUND") return;

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      refundedAmount: (refundedCents / 100).toFixed(2),
      refundedAt: new Date(),
    },
  });

  // Always revalidate both order + booking paths — payment.bookingId may have
  // been nulled out by Booking deletion (onDelete: SetNull) before this webhook
  // arrives, so we can't rely on the FK to know which view to refresh.
  revalidatePath("/orders");
  revalidatePath("/bookings");
  revalidatePath(`/admin/${payment.barbershopId}/orders`);
  revalidatePath(`/admin/${payment.barbershopId}/bookings`);

  await audit({
    userId: payment.userId,
    action: "PAYMENT_REFUNDED",
    barbershopId: payment.barbershopId,
    targetType: payment.orderId ? "Order" : "Booking",
    targetId: payment.orderId ?? payment.bookingId ?? "",
    metadata: {
      paymentId: payment.id,
      refundedCents,
      totalCents,
      isFullRefund,
      chargeId: charge.id,
    },
  });
};
