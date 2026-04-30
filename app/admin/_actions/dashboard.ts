"use server";

import { db } from "@/app/_lib/prisma";
import { requireShopAccess } from "../_utils/requireOwner";
import { serializeBookingWithRelations } from "@/app/_lib/serializers";

const includeRelations = {
  barbershop: true,
  barber: true,
  user: { select: { id: true, name: true, email: true, image: true } },
  services: { include: { service: true } },
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const sumServicesPrice = <T extends { services: { service: { price: { toString: () => string } } }[] }>(
  bookings: T[]
) => bookings.reduce((sum, b) => sum + b.services.reduce((acc, bs) => acc + Number(bs.service.price), 0), 0);

const pctDelta = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
};

export const getDashboardMetrics = async (shopId: string) => {
  const { shop } = await requireShopAccess(shopId);

  const now = new Date();
  const startToday = startOfDay(now);
  const endToday = new Date(startToday.getTime() + DAY_MS);
  const startYesterday = new Date(startToday.getTime() - DAY_MS);
  const start7Ago = new Date(startToday.getTime() - 6 * DAY_MS);
  const start14Ago = new Date(startToday.getTime() - 13 * DAY_MS);
  const end7Ahead = new Date(startToday.getTime() + 7 * DAY_MS);

  const [
    todayCount,
    yesterdayCount,
    next7Count,
    next7CountPrev,
    totalClients,
    finishedLast7,
    finishedPrev7,
    upcoming,
    todaysAgenda,
    finishedTotal,
    barbersAgg,
  ] = await Promise.all([
    db.booking.count({
      where: { barbershopId: shopId, date: { gte: startToday, lt: endToday } },
    }),
    db.booking.count({
      where: { barbershopId: shopId, date: { gte: startYesterday, lt: startToday } },
    }),
    db.booking.count({
      where: { barbershopId: shopId, date: { gte: now, lt: end7Ahead } },
    }),
    db.booking.count({
      where: { barbershopId: shopId, date: { gte: start7Ago, lt: now } },
    }),
    db.booking.findMany({
      where: { barbershopId: shopId },
      select: { userId: true },
      distinct: ["userId"],
    }),
    db.booking.findMany({
      where: { barbershopId: shopId, date: { gte: start7Ago, lt: now } },
      select: { date: true, services: { select: { service: { select: { price: true } } } } },
    }),
    db.booking.findMany({
      where: { barbershopId: shopId, date: { gte: start14Ago, lt: start7Ago } },
      select: { services: { select: { service: { select: { price: true } } } } },
    }),
    db.booking.findMany({
      where: { barbershopId: shopId, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: includeRelations,
    }),
    db.booking.findMany({
      where: { barbershopId: shopId, date: { gte: startToday, lt: endToday } },
      orderBy: { date: "asc" },
      include: includeRelations,
    }),
    db.booking.count({ where: { barbershopId: shopId, date: { lt: now } } }),
    db.booking.groupBy({
      by: ["barberId"],
      where: { barbershopId: shopId, date: { gte: start7Ago, lt: now } },
      _count: { _all: true },
    }),
  ]);

  const revenueLast7 = sumServicesPrice(finishedLast7);
  const revenuePrev7 = sumServicesPrice(finishedPrev7);
  const finishedLast7Count = finishedLast7.length;
  const finishedPrev7Count = finishedPrev7.length;
  const avgTicket = finishedLast7Count > 0 ? revenueLast7 / finishedLast7Count : 0;
  const avgTicketPrev = finishedPrev7Count > 0 ? revenuePrev7 / finishedPrev7Count : 0;

  // Receita por dia (últimos 7) — buckets por dia local
  const revenueByDay: { date: string; label: string; revenue: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startToday.getTime() - i * DAY_MS);
    revenueByDay.push({
      date: d.toISOString(),
      label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      revenue: 0,
      count: 0,
    });
  }
  const indexByDay = new Map(
    revenueByDay.map((b, idx) => [startOfDay(new Date(b.date)).getTime(), idx])
  );

  for (const b of finishedLast7) {
    const key = startOfDay(b.date).getTime();
    const idx = indexByDay.get(key);
    if (idx === undefined) continue;
    const total = b.services.reduce((acc, bs) => acc + Number(bs.service.price), 0);
    revenueByDay[idx].revenue += total;
    revenueByDay[idx].count += 1;
  }

  // Bookings por barbeiro (últimos 7)
  const barberIds = barbersAgg.map((g) => g.barberId);
  const barbers =
    barberIds.length > 0
      ? await db.barber.findMany({
          where: { id: { in: barberIds } },
          select: { id: true, name: true, imageUrl: true },
        })
      : [];
  const byId = new Map(barbers.map((b) => [b.id, b]));
  const totalBookingsByBarber = barbersAgg.reduce((sum, g) => sum + g._count._all, 0);
  const bookingsByBarber = barbersAgg
    .map((g) => ({
      barberId: g.barberId,
      name: byId.get(g.barberId)?.name ?? "—",
      imageUrl: byId.get(g.barberId)?.imageUrl ?? null,
      count: g._count._all,
      share: totalBookingsByBarber > 0 ? (g._count._all / totalBookingsByBarber) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      address: shop.address,
      imageUrl: shop.imageUrl,
    },
    todayCount,
    next7Count,
    totalClients: totalClients.length,
    revenueLast7,
    finishedLast7Count,
    finishedTotal,
    avgTicket,
    todayDelta: pctDelta(todayCount, yesterdayCount),
    next7Delta: pctDelta(next7Count, next7CountPrev),
    revenueDelta: pctDelta(revenueLast7, revenuePrev7),
    ticketDelta: pctDelta(avgTicket, avgTicketPrev),
    revenueByDay,
    bookingsByBarber,
    upcoming: upcoming.map((b) => ({
      ...serializeBookingWithRelations(b),
      user: b.user,
    })),
    todaysAgenda: todaysAgenda.map((b) => ({
      ...serializeBookingWithRelations(b),
      user: b.user,
    })),
  };
};
