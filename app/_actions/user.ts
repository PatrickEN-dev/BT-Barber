"use server";

import { Theme } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { TERMS_VERSION } from "@/app/_lib/terms";

import { UnauthorizedError } from "./_errors";

const VALID_THEMES = new Set<Theme>(["LIGHT", "DARK", "SYSTEM"]);

export const updateUserTheme = async (theme: Theme) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  if (!VALID_THEMES.has(theme)) throw new Error("Tema inválido.");

  await db.user.update({
    where: { id: session.user.id },
    data: { theme },
  });
};

/**
 * Records the user's acceptance of the platform's Terms of Use, Privacy
 * Policy and Cancellation Policy. The TermsGate calls this once on first
 * login (or after a TERMS_VERSION bump) and unblocks the app.
 *
 * Audited because LGPD asks operators to keep proof of consent. The audit
 * row plus the User columns are the durable record of "user X agreed to
 * version Y at time Z".
 */
export const acceptTerms = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  const now = new Date();
  await db.user.update({
    where: { id: session.user.id },
    data: { termsAcceptedAt: now, termsVersion: TERMS_VERSION },
  });

  await audit({
    userId: session.user.id,
    action: "TERMS_ACCEPTED",
    targetType: "User",
    targetId: session.user.id,
    metadata: { version: TERMS_VERSION, acceptedAt: now.toISOString() },
  });

  return { acceptedAt: now.toISOString(), version: TERMS_VERSION };
};
