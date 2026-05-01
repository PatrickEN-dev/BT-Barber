import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing — check .env");
}

/**
 * Server-side Stripe SDK. Singleton on globalThis to avoid re-instantiation
 * during Next.js dev server hot reloads (same pattern as the Prisma client).
 *
 * apiVersion is pinned so a Stripe-side update doesn't silently change request
 * shapes. Bump this only after reviewing the changelog and updating the SDK.
 */
const globalForStripe = globalThis as unknown as { stripe?: Stripe };

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    appInfo: {
      name: "BT-Barber",
      version: "0.1.0",
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}

/** Convert a BRL Decimal/number to integer cents for Stripe. */
export const toStripeAmount = (amountBRL: number | string): number => {
  const value = typeof amountBRL === "string" ? Number(amountBRL) : amountBRL;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid amount for Stripe");
  }
  return Math.round(value * 100);
};

/** Convert integer cents back to decimal BRL string. */
export const fromStripeAmount = (cents: number): string =>
  (cents / 100).toFixed(2);
