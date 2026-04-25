"use server";

import { revalidatePath } from "next/cache";
import { db } from "../_lib/prisma";
import { serializeBookingWithRelations } from "../_lib/serializers";

const includeBookingRelations = {
  barbershop: true,
  barber: true,
  services: { include: { service: true } },
} as const;

export const findConfirmedBookings = async (userId: string) => {
  const bookings = await db.booking.findMany({
    where: { userId, date: { gte: new Date() } },
    orderBy: { date: "desc" },
    include: includeBookingRelations,
  });
  return bookings.map(serializeBookingWithRelations);
};

export const findFinishedBookings = async (userId: string) => {
  const bookings = await db.booking.findMany({
    where: { userId, date: { lt: new Date() } },
    orderBy: { date: "desc" },
    include: includeBookingRelations,
  });
  return bookings.map(serializeBookingWithRelations);
};

export const cancelBooking = async (bookingId: string) => {
  await db.booking.delete({ where: { id: bookingId } });

  revalidatePath("/");
  revalidatePath("/bookings");
};
