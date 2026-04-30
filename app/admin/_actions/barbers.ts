"use server";

import { db } from "@/app/_lib/prisma";
import { requireShopAccess } from "../_utils/requireOwner";

export const listShopBarbers = async (shopId: string) => {
  await requireShopAccess(shopId);

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const barbers = await db.barber.findMany({
    where: { barbershopId: shopId },
    orderBy: { name: "asc" },
    include: {
      services: { select: { id: true, name: true } },
      _count: { select: { Booking: true } },
    },
  });

  const stats = await Promise.all(
    barbers.map(async (b) => {
      const [last7, upcoming, finishedBookings] = await Promise.all([
        db.booking.count({
          where: { barberId: b.id, date: { gte: sevenDaysAgo, lt: now } },
        }),
        db.booking.count({
          where: { barberId: b.id, date: { gte: now } },
        }),
        db.booking.findMany({
          where: { barberId: b.id, date: { gte: sevenDaysAgo, lt: now } },
          include: { services: { include: { service: { select: { price: true } } } } },
        }),
      ]);

      const revenueLast7 = finishedBookings.reduce(
        (sum, bk) => sum + bk.services.reduce((acc, bs) => acc + Number(bs.service.price), 0),
        0
      );

      return { barberId: b.id, last7, upcoming, revenueLast7 };
    })
  );

  const statsById = new Map(stats.map((s) => [s.barberId, s]));

  return barbers.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    rating: b.rating,
    imageUrl: b.imageUrl,
    servicesCount: b.services.length,
    totalBookings: b._count.Booking,
    last7: statsById.get(b.id)?.last7 ?? 0,
    upcoming: statsById.get(b.id)?.upcoming ?? 0,
    revenueLast7: statsById.get(b.id)?.revenueLast7 ?? 0,
  }));
};
