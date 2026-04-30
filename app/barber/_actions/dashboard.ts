"use server";

import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";
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
) =>
  bookings.reduce(
    (sum, b) => sum + b.services.reduce((acc, bs) => acc + Number(bs.service.price), 0),
    0
  );

const pctDelta = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
};

export const getBarberDashboard = async (shopId: string) => {
  const { barber } = await requireBarberContext(shopId);

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
    finishedLast7,
    finishedPrev7,
    todaysAgenda,
    nextBooking,
    teamAgg,
  ] = await Promise.all([
    db.booking.count({
      where: { barberId: barber.id, date: { gte: startToday, lt: endToday } },
    }),
    db.booking.count({
      where: { barberId: barber.id, date: { gte: startYesterday, lt: startToday } },
    }),
    db.booking.count({
      where: { barberId: barber.id, date: { gte: now, lt: end7Ahead } },
    }),
    db.booking.count({
      where: { barberId: barber.id, date: { gte: start7Ago, lt: now } },
    }),
    db.booking.findMany({
      where: { barberId: barber.id, date: { gte: start7Ago, lt: now } },
      select: { date: true, services: { select: { service: { select: { price: true } } } } },
    }),
    db.booking.findMany({
      where: { barberId: barber.id, date: { gte: start14Ago, lt: start7Ago } },
      select: { services: { select: { service: { select: { price: true } } } } },
    }),
    db.booking.findMany({
      where: { barberId: barber.id, date: { gte: startToday, lt: endToday } },
      orderBy: { date: "asc" },
      include: includeRelations,
    }),
    db.booking.findFirst({
      where: { barberId: barber.id, date: { gte: now } },
      orderBy: { date: "asc" },
      include: includeRelations,
    }),
    // Toda a equipe da loja: agendamentos 7d (sem receita)
    db.booking.groupBy({
      by: ["barberId"],
      where: { barbershopId: shopId, date: { gte: start7Ago, lt: now } },
      _count: { _all: true },
    }),
  ]);

  const revenueLast7 = sumServicesPrice(finishedLast7);
  const revenuePrev7 = sumServicesPrice(finishedPrev7);
  const finishedLast7Count = finishedLast7.length;

  // Posição na equipe (por agendamentos)
  const sortedTeam = [...teamAgg].sort((a, b) => b._count._all - a._count._all);
  const myIndex = sortedTeam.findIndex((g) => g.barberId === barber.id);
  const teamRank = myIndex >= 0 ? myIndex + 1 : null;
  const teamSize = sortedTeam.length;

  // Histórico do próximo cliente (último corte com este barbeiro)
  let lastVisitOfNext: { date: Date; services: string[] } | null = null;
  if (nextBooking) {
    const prev = await db.booking.findFirst({
      where: {
        barberId: barber.id,
        userId: nextBooking.userId,
        date: { lt: nextBooking.date },
      },
      orderBy: { date: "desc" },
      include: { services: { include: { service: true } } },
    });
    if (prev) {
      lastVisitOfNext = {
        date: prev.date,
        services: prev.services.map((bs) => bs.service.name),
      };
    }
  }

  return {
    barber: {
      id: barber.id,
      name: barber.name,
      imageUrl: barber.imageUrl,
      rating: barber.rating,
    },
    shop: {
      id: barber.barbershopId,
      name: barber.barbershop.name,
    },
    todayCount,
    next7Count,
    finishedLast7Count,
    revenueLast7,
    todayDelta: pctDelta(todayCount, yesterdayCount),
    next7Delta: pctDelta(next7Count, next7CountPrev),
    revenueDelta: pctDelta(revenueLast7, revenuePrev7),
    teamRank,
    teamSize,
    todaysAgenda: todaysAgenda.map((b) => ({
      ...serializeBookingWithRelations(b),
      user: b.user,
    })),
    nextBooking: nextBooking
      ? {
          ...serializeBookingWithRelations(nextBooking),
          user: nextBooking.user,
        }
      : null,
    lastVisitOfNext,
  };
};
