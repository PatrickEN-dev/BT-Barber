import { cache } from "react";
import { getServerSession } from "next-auth";

import { UnauthorizedError } from "@/app/_actions/_errors";
import { authOptions } from "@/app/_lib/auth";

const parseAllowlist = (raw: string | undefined): Set<string> => {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
};

export const isPlatformAdminEmail = (email: string | null | undefined) => {
  if (!email) return false;
  return parseAllowlist(process.env.PLATFORM_ADMIN_EMAILS).has(email.toLowerCase());
};

/**
 * Server-side gate for platform-admin actions (recording payouts, viewing
 * cross-shop financials, etc). Allowlist-based — emails come from
 * PLATFORM_ADMIN_EMAILS (comma-separated). No DB column needed.
 *
 * Use only for actions exclusive to the platform operator (BT-Barber team),
 * NOT for shop-owner actions. Shop-owner actions go through requireShopAccess.
 *
 * Wrapped in React `cache()` so multiple calls in the same request hit the DB
 * once.
 */
export const requirePlatformAdmin = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new UnauthorizedError();
  if (!isPlatformAdminEmail(session.user.email)) throw new UnauthorizedError();
  return { userId: session.user.id, email: session.user.email };
});
