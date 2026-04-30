"use server";

import { db } from "@/app/_lib/prisma";
import { requireShopAccess } from "../_utils/requireOwner";

const PAGE_SIZE = 15;

interface ListParams {
  shopId: string;
  page?: number;
  search?: string;
}

export const listShopClients = async ({ shopId, page = 1, search }: ListParams) => {
  await requireShopAccess(shopId);

  const userWhere = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const grouped = await db.booking.groupBy({
    by: ["userId"],
    where: { barbershopId: shopId, user: userWhere },
    _count: { _all: true },
    _max: { date: true },
  });

  grouped.sort((a, b) => {
    const ad = a._max.date?.getTime() ?? 0;
    const bd = b._max.date?.getTime() ?? 0;
    return bd - ad;
  });

  const total = grouped.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const slice = grouped.slice(skip, skip + PAGE_SIZE);
  const userIds = slice.map((g) => g.userId);

  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, image: true },
  });
  const usersById = new Map(users.map((u) => [u.id, u]));

  const clients = slice.map((g) => ({
    user: usersById.get(g.userId)!,
    bookingsCount: g._count._all,
    lastBookingAt: g._max.date,
  }));

  return { clients, total, page: safePage, totalPages, perPage: PAGE_SIZE };
};
