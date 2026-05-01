import { Prisma } from "@prisma/client";

import { db } from "./prisma";

export class RateLimitExceededError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super(
      `Muitas tentativas. Tente novamente em ${retryAfterSeconds} segundo${
        retryAfterSeconds === 1 ? "" : "s"
      }.`
    );
    this.name = "RateLimitExceededError";
  }
}

interface RateLimitOptions {
  /** Max requests within the window. */
  max: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

/**
 * Postgres-backed rate limiter — atomic via row-level lock inside transaction.
 *
 * Usage inside a server action:
 *   await rateLimit(`user:${userId}:createOrder`, { max: 10, windowMs: 60_000 });
 *
 * Throws `RateLimitExceededError` when the budget is exhausted. The action
 * caller is responsible for surfacing the error (we let it bubble — the toast
 * UX in the client catches `error.message`).
 *
 * Why Postgres and not in-memory: the app runs on Vercel serverless and
 * in-memory state doesn't survive across instances. Why not Upstash/Redis:
 * adding another infra dep wasn't worth it for the current scale.
 */
export const rateLimit = async (
  key: string,
  { max, windowMs }: RateLimitOptions
): Promise<void> => {
  const now = new Date();
  const reset = new Date(now.getTime() + windowMs);

  await db.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.resetAt < now) {
      // Either no record or the window has expired — reset the counter.
      await tx.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt: reset },
        update: { count: 1, resetAt: reset },
      });
      return;
    }

    if (existing.count >= max) {
      const retryAfter = Math.max(
        1,
        Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000)
      );
      throw new RateLimitExceededError(retryAfter);
    }

    await tx.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
};

/**
 * Best-effort cleanup. Called occasionally — not a hot path. Stale keys also
 * get reset naturally on the next call, so this is just to keep the table
 * small.
 */
export const cleanupExpiredRateLimits = async () => {
  await db.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } });
};
