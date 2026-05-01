import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/_lib/auth";

/**
 * Kept for backward compat with existing call sites. With the capability-based
 * auth model, owners and barbers can browse the customer side freely — no
 * forced redirect. Function is now a no-op.
 *
 * New code should not call this; remove the call when touching the file.
 */
export const redirectIfOwner = async () => {
  /* intentionally empty */
};

/**
 * Require the user to be authenticated. Capability-agnostic: an owner who is
 * also a barber is still a valid customer for routes like /bookings, /orders
 * and /profile.
 */
export const requireCustomer = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
};
