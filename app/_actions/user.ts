"use server";

import { getServerSession } from "next-auth";
import { Theme } from "@prisma/client";

import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";

export const updateUserTheme = async (theme: Theme) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return;
  await db.user.update({
    where: { id: session.user.id },
    data: { theme },
  });
};
