"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { serializeBookingWithRelations } from "@/app/_lib/serializers";

import { UnauthorizedError } from "./_errors";

const includeBookingRelations = {
  barbershop: true,
  barber: true,
  services: { include: { service: true } },
} as const;

const requireOwnUserId = async (userId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    throw new UnauthorizedError();
  }
};

export const findConfirmedBookings = async (userId: string) => {
  await requireOwnUserId(userId);
  const bookings = await db.booking.findMany({
    where: { userId, date: { gte: new Date() } },
    orderBy: { date: "desc" },
    include: includeBookingRelations,
  });
  return bookings.map(serializeBookingWithRelations);
};

export const findFinishedBookings = async (userId: string) => {
  await requireOwnUserId(userId);
  const bookings = await db.booking.findMany({
    where: { userId, date: { lt: new Date() } },
    orderBy: { date: "desc" },
    include: includeBookingRelations,
  });
  return bookings.map(serializeBookingWithRelations);
};

export const cancelBooking = async (bookingId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  // deleteMany + scoped where = either own booking is deleted (count: 1) or nothing happens (count: 0).
  // We never trust the bookingId to belong to the caller — the WHERE clause enforces it atomically.
  const result = await db.booking.deleteMany({
    where: { id: bookingId, userId: session.user.id },
  });

  if (result.count === 0) throw new UnauthorizedError();

  revalidatePath("/");
  revalidatePath("/bookings");
};
