"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";
import { serializeBookingWithRelations } from "@/app/_lib/serializers";

const PAGE_SIZE = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

export type BarberBookingStatus = "upcoming" | "past" | "all";
export type BarberBookingRange = "today" | "tomorrow" | "week" | "month" | "any";

interface ListParams {
  shopId: string;
  page?: number;
  status?: BarberBookingStatus;
  range?: BarberBookingRange;
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const buildDateFilter = (status: BarberBookingStatus, range: BarberBookingRange) => {
  const now = new Date();
  const startToday = startOfDay(now);

  if (range === "today") return { gte: startToday, lt: new Date(startToday.getTime() + DAY_MS) };
  if (range === "tomorrow") {
    const tomorrow = new Date(startToday.getTime() + DAY_MS);
    return { gte: tomorrow, lt: new Date(tomorrow.getTime() + DAY_MS) };
  }
  if (range === "week") return { gte: now, lt: new Date(startToday.getTime() + 7 * DAY_MS) };
  if (range === "month") return { gte: now, lt: new Date(startToday.getTime() + 30 * DAY_MS) };

  if (status === "upcoming") return { gte: now };
  if (status === "past") return { lt: now };
  return undefined;
};

export const listBarberBookings = async ({
  shopId,
  page = 1,
  status = "upcoming",
  range = "any",
}: ListParams) => {
  const { barber } = await requireBarberContext(shopId);

  const dateFilter = buildDateFilter(status, range);
  const where = {
    barberId: barber.id,
    ...(dateFilter ? { date: dateFilter } : {}),
  };

  const skip = (page - 1) * PAGE_SIZE;
  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { date: status === "past" ? "desc" : "asc" },
      skip,
      take: PAGE_SIZE,
      include: {
        barbershop: true,
        barber: true,
        user: { select: { id: true, name: true, email: true, image: true } },
        services: { include: { service: true } },
      },
    }),
    db.booking.count({ where }),
  ]);

  return {
    bookings: bookings.map((b) => ({
      ...serializeBookingWithRelations(b),
      user: b.user,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    perPage: PAGE_SIZE,
  };
};

export const cancelBarberBooking = async (shopId: string, bookingId: string) => {
  const { barber } = await requireBarberContext(shopId);

  await db.booking.delete({
    where: { id: bookingId, barberId: barber.id },
  });

  revalidatePath(`/barber/${shopId}/bookings`);
  revalidatePath(`/barber/${shopId}/dashboard`);
  revalidatePath("/bookings");
};
