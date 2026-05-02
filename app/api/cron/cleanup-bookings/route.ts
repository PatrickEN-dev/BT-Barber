import { NextResponse } from "next/server";

import { logInfo } from "@/app/_lib/log";
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
 * Schedule: every 5 minutes via Vercel Cron (see `vercel.json`). Vercel
 * auto-injects `Authorization: Bearer ${CRON_SECRET}` on scheduled runs when
 * the env var is set, so the bearer check works out of the box.
 *
 * Manual trigger:
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
 *     https://<host>/api/cron/cleanup-bookings
 */

/**
 * Grace period after holdUntil expires before we delete. Prevents a race
 * where:
 *   - User pays at the very edge of the 30-min PIX window.
 *   - Stripe processes the payment.
 *   - Cron runs in the same second and deletes the booking.
 *   - Webhook arrives a moment later trying to confirm a booking that no
 *     longer exists.
 *
 * 15 min is generous — Stripe webhooks usually arrive in <1s. With this grace
 * period, an abandoned slot is freed within ~45min of the booking creation
 * worst-case (30min holdUntil + 15min grace + cron tick). Acceptable.
 */
const GRACE_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - GRACE_MS);

  // Delete bookings where the hold has been expired for a while AND no
  // payment was confirmed. Excludes payments still in PENDING (they may yet
  // confirm) — only deletes when payment is null or in a terminal-failed
  // state. The unique constraint on (barberId, date) frees up automatically
  // once the row is gone.
  const result = await db.booking.deleteMany({
    where: {
      holdUntil: { lt: cutoff },
      OR: [
        { payment: { is: null } },
        {
          payment: {
            status: { in: ["EXPIRED", "FAILED", "CANCELED", "REFUNDED"] },
          },
        },
      ],
    },
  });

  if (result.count > 0) {
    logInfo("cron-cleanup", "freed expired booking holds", { deleted: result.count });
  }

  return NextResponse.json({ deleted: result.count });
}

// Allow GET for ad-hoc invocation from a browser/curl in dev. Production
// crons should still POST.
export async function GET(req: Request) {
  return POST(req);
}
