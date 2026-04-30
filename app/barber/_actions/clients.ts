"use server";

import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";
import { serializeService } from "@/app/_lib/serializers";

const PAGE_SIZE = 15;
const VIP_THRESHOLD = 5;

interface ListParams {
  shopId: string;
  page?: number;
  search?: string;
}

export const listBarberClients = async ({ shopId, page = 1, search }: ListParams) => {
  const { barber } = await requireBarberContext(shopId);

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
    where: { barberId: barber.id, user: userWhere },
    _count: { _all: true },
    _max: { date: true },
  });

  grouped.sort((a, b) => (b._max.date?.getTime() ?? 0) - (a._max.date?.getTime() ?? 0));

  const total = grouped.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const slice = grouped.slice(skip, skip + PAGE_SIZE);
  const userIds = slice.map((g) => g.userId);

  const users = userIds.length
    ? await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, image: true },
      })
    : [];
  const usersById = new Map(users.map((u) => [u.id, u]));

  const clients = slice.map((g) => ({
    user: usersById.get(g.userId)!,
    bookingsCount: g._count._all,
    lastBookingAt: g._max.date,
    isVip: g._count._all >= VIP_THRESHOLD,
  }));

  return { clients, total, page: safePage, totalPages, perPage: PAGE_SIZE };
};

export const getBarberClientDetail = async (shopId: string, clientId: string) => {
  const { barber } = await requireBarberContext(shopId);

  const [client, history, notes, count] = await Promise.all([
    db.user.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true, image: true },
    }),
    db.booking.findMany({
      where: { barberId: barber.id, userId: clientId },
      orderBy: { date: "desc" },
      take: 20,
      include: { services: { include: { service: true } } },
    }),
    db.barberClientNote.findMany({
      where: { barberId: barber.id, clientId },
      orderBy: { createdAt: "desc" },
    }),
    db.booking.count({ where: { barberId: barber.id, userId: clientId } }),
  ]);

  if (!client) return null;

  return {
    client,
    bookingsCount: count,
    isVip: count >= VIP_THRESHOLD,
    history: history.map((b) => ({
      id: b.id,
      date: b.date,
      services: b.services.map((bs) => serializeService(bs.service)),
    })),
    notes,
  };
};
