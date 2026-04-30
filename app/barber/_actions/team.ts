"use server";

import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const getTeamComparison = async (shopId: string) => {
  const { barber } = await requireBarberContext(shopId);

  const now = new Date();
  const startToday = startOfDay(now);
  const start7Ago = new Date(startToday.getTime() - 6 * DAY_MS);

  const teammates = await db.barber.findMany({
    where: { barbershopId: shopId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      rating: true,
    },
  });

  // Cada barbeiro: contar bookings 7d + clientes únicos (próprios deles)
  const stats = await Promise.all(
    teammates.map(async (b) => {
      const [last7, distinctClients] = await Promise.all([
        db.booking.count({
          where: { barberId: b.id, date: { gte: start7Ago, lt: now } },
        }),
        db.booking.findMany({
          where: { barberId: b.id },
          select: { userId: true },
          distinct: ["userId"],
        }),
      ]);
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        imageUrl: b.imageUrl,
        rating: b.rating,
        last7Bookings: last7,
        clientsCount: distinctClients.length,
        isMe: b.id === barber.id,
      };
    })
  );

  stats.sort((a, b) => b.last7Bookings - a.last7Bookings);

  return {
    barbers: stats,
    myId: barber.id,
  };
};
