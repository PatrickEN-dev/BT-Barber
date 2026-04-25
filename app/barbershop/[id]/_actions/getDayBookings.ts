"use server";

import { db } from "@/app/_lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

export const getDayBookings = async (
  barbershopId: string,
  date: Date,
  barberId?: string
) => {
  return db.booking.findMany({
    where: {
      barbershopId,
      ...(barberId ? { barberId } : {}),
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  });
};
