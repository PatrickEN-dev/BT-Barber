"use server";

import { db } from "@/app/_lib/prisma";
import { requireShopAccess } from "../_utils/requireOwner";

export const listShopBarbers = async (shopId: string) => {
  await requireShopAccess(shopId);

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Single round-trip for everything: barbers + 3 aggregations across all of them.
  const [barbers, last7Counts, upcomingCounts, last7BookingsForRevenue] = await Promise.all([
    db.barber.findMany({
      where: { barbershopId: shopId },
      orderBy: { name: "asc" },
      include: {
        services: { select: { id: true, name: true } },
        _count: { select: { Booking: true } },
      },
    }),
    db.booking.groupBy({
      by: ["barberId"],
      where: { barbershopId: shopId, date: { gte: sevenDaysAgo, lt: now } },
      _count: { _all: true },
    }),
    db.booking.groupBy({
      by: ["barberId"],
      where: { barbershopId: shopId, date: { gte: now } },
      _count: { _all: true },
    }),
    db.booking.findMany({
      where: { barbershopId: shopId, date: { gte: sevenDaysAgo, lt: now } },
      select: {
        barberId: true,
        services: { select: { service: { select: { price: true } } } },
      },
    }),
  ]);

  const last7CountByBarber = new Map(last7Counts.map((g) => [g.barberId, g._count._all]));
  const upcomingCountByBarber = new Map(upcomingCounts.map((g) => [g.barberId, g._count._all]));

  const revenueByBarber = new Map<string, number>();
  for (const b of last7BookingsForRevenue) {
    const total = b.services.reduce((acc, bs) => acc + Number(bs.service.price), 0);
    revenueByBarber.set(b.barberId, (revenueByBarber.get(b.barberId) ?? 0) + total);
  }

  return barbers.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    rating: b.rating,
    imageUrl: b.imageUrl,
    servicesCount: b.services.length,
    totalBookings: b._count.Booking,
    last7: last7CountByBarber.get(b.id) ?? 0,
    upcoming: upcomingCountByBarber.get(b.id) ?? 0,
    revenueLast7: revenueByBarber.get(b.id) ?? 0,
  }));
};
