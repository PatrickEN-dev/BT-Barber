"use server";

import { revalidatePath } from "next/cache";
import { db } from "../_lib/prisma";
import { serializeBookingWithRelations } from "../_lib/serializers";

export const findConfirmedBookings = async (userId: string) => {
  const bookings = await db.booking.findMany({
    where: {
      userId,
      date: { gte: new Date() },
    },
    orderBy: { date: "desc" },
    include: { service: true, barbershop: true },
  });
  return bookings.map(serializeBookingWithRelations);
};

export const findFinishedBookings = async (userId: string) => {
  const bookings = await db.booking.findMany({
    where: {
      userId,
      date: { lt: new Date() },
    },
    orderBy: { date: "desc" },
    include: { service: true, barbershop: true },
  });
  return bookings.map(serializeBookingWithRelations);
};

export const cancelBooking = async (bookingId: string) => {
  await db.booking.delete({ where: { id: bookingId } });

  revalidatePath("/");
  revalidatePath("/bookings");
};
