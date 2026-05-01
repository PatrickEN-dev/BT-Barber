import { cache } from "react";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";

export const requireOwner = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  if (session.user.role !== "OWNER") redirect("/");
  return session.user;
});

export const requireShopAccess = cache(async (shopId: string) => {
  const user = await requireOwner();

  const shop = await db.barbershop.findFirst({
    where: { id: shopId, ownerId: user.id },
  });

  if (!shop) redirect("/admin");

  return { user, shop };
});
