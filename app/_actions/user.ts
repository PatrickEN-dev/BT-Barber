"use server";

import { Theme } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";

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
