import { NextResponse } from "next/server";

import { db } from "@/app/_lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron endpoint that frees booking slots whose hold expired without payment.
 *
 * A booking is "held" while the customer goes through the checkout flow.
 * `holdUntil` is set to ~30 minutes after creation. If the user closes the
 * checkout dialog or the PIX QR expires, this endpoint deletes the booking
 * so the slot becomes available again.
 *
 * Auth: bearer token in `Authorization` header matching `CRON_SECRET`.
 *
 * Schedule: ideally every 5 minutes via Vercel Cron (`vercel.json`) or any
 * external scheduler. Until cron is configured, can be triggered manually:
 *
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
 *     https://<host>/api/cron/cleanup-bookings
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete bookings where the hold expired AND no payment was confirmed.
  // The unique constraint on (barberId, date) frees up automatically once
  // the row is gone. Stripe's PaymentIntent for the orphan stays open until
  // it expires on Stripe's side (30min for PIX, 7 days for card).
  const expired = await db.booking.findMany({
    where: {
      holdUntil: { lt: new Date() },
      OR: [{ payment: { is: null } }, { payment: { status: { not: "PAID" } } }],
    },
    select: { id: true, barbershopId: true },
  });

  if (expired.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const ids = expired.map((b) => b.id);
  const result = await db.booking.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({
    deleted: result.count,
    bookingIds: ids,
  });
}

// Allow GET for ad-hoc invocation from a browser/curl in dev. Production
// crons should still POST.
export async function GET(req: Request) {
  return POST(req);
}
