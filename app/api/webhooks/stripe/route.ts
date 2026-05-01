import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import { audit } from "@/app/_lib/audit";
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
    console.error("[stripe-webhook] missing signature or webhook secret");
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 400 });
  }

  // Read the raw body — `req.text()` is required because constructEvent
  // verifies the signature against the exact bytes Stripe sent.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[stripe-webhook] signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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
    console.error("[stripe-webhook] handler error for", event.type, err);
    // Return 500 so Stripe retries with backoff.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

const handlePaymentSucceeded = async (intent: Stripe.PaymentIntent) => {
  const payment = await db.payment.findUnique({ where: { externalId: intent.id } });
  if (!payment) {
    console.warn("[stripe-webhook] PaymentIntent succeeded but no Payment row:", intent.id);
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
  if (payment.orderId) {
    await db.order.update({
      where: { id: payment.orderId },
      data: { status: "CONFIRMED" },
    });
    revalidatePath(`/admin/${payment.barbershopId}/orders`);
    revalidatePath("/orders");
  }
  if (payment.bookingId) {
    revalidatePath("/bookings");
    revalidatePath(`/admin/${payment.barbershopId}/bookings`);
  }

  await audit({
    userId: payment.userId,
    action: "ORDER_CREATE",
    barbershopId: payment.barbershopId,
    targetType: "Order",
    targetId: payment.orderId ?? payment.bookingId ?? "",
    metadata: { paymentId: payment.id, status: "PAID", method: payment.method },
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
};

const handlePaymentCanceled = async (intent: Stripe.PaymentIntent) => {
  const payment = await db.payment.findUnique({ where: { externalId: intent.id } });
  if (!payment) return;
  if (payment.status === "CANCELED" || payment.status === "PAID") return;

  await db.payment.update({
    where: { id: payment.id },
    data: { status: "EXPIRED" },
  });
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

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: isFullRefund ? "REFUNDED" : "PARTIAL_REFUND",
      refundedAmount: (refundedCents / 100).toFixed(2),
      refundedAt: new Date(),
    },
  });

  if (payment.orderId) {
    revalidatePath(`/admin/${payment.barbershopId}/orders`);
    revalidatePath("/orders");
  }
  if (payment.bookingId) {
    revalidatePath("/bookings");
    revalidatePath(`/admin/${payment.barbershopId}/bookings`);
  }
};
