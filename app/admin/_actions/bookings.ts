"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/app/_lib/prisma";
import { serializeBookingWithRelations } from "@/app/_lib/serializers";
import { requireShopAccess } from "../_utils/requireOwner";

const PAGE_SIZE = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

export type BookingStatus = "upcoming" | "past" | "all";
export type BookingRange = "today" | "tomorrow" | "week" | "month" | "any";

interface ListParams {
  shopId: string;
  page?: number;
  status?: BookingStatus;
  barberId?: string;
  range?: BookingRange;
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const buildDateFilter = (status: BookingStatus, range: BookingRange) => {
  const now = new Date();
  const startToday = startOfDay(now);

  if (range === "today") {
    return { gte: startToday, lt: new Date(startToday.getTime() + DAY_MS) };
  }
  if (range === "tomorrow") {
    const tomorrow = new Date(startToday.getTime() + DAY_MS);
    return { gte: tomorrow, lt: new Date(tomorrow.getTime() + DAY_MS) };
  }
  if (range === "week") {
    return { gte: now, lt: new Date(startToday.getTime() + 7 * DAY_MS) };
  }
  if (range === "month") {
    return { gte: now, lt: new Date(startToday.getTime() + 30 * DAY_MS) };
  }
  // "any" — fall back to status-based filter
  if (status === "upcoming") return { gte: now };
  if (status === "past") return { lt: now };
  return undefined;
};

const includeRelations = {
  barber: true,
  user: { select: { id: true, name: true, email: true, image: true } },
  services: { include: { service: true } },
} satisfies Prisma.BookingInclude;

export const listShopBookings = async ({
  shopId,
  page = 1,
  status = "upcoming",
  barberId,
  range = "any",
}: ListParams) => {
  const { shop } = await requireShopAccess(shopId);

  const dateFilter = buildDateFilter(status, range);

  const where = {
    barbershopId: shopId,
    ...(dateFilter ? { date: dateFilter } : {}),
    ...(barberId ? { barberId } : {}),
  };

  const skip = (page - 1) * PAGE_SIZE;

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { date: status === "past" ? "desc" : "asc" },
      skip,
      take: PAGE_SIZE,
      include: includeRelations,
    }),
    db.booking.count({ where }),
  ]);

  return {
    bookings: bookings.map((b) => ({
      ...serializeBookingWithRelations({ ...b, barbershop: shop }),
      user: b.user,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    perPage: PAGE_SIZE,
  };
};

export const cancelShopBooking = async (shopId: string, bookingId: string) => {
  await requireShopAccess(shopId);

  await db.booking.delete({
    where: { id: bookingId, barbershopId: shopId },
  });

  revalidatePath(`/admin/${shopId}/bookings`);
  revalidatePath(`/admin/${shopId}/dashboard`);
  revalidatePath("/bookings");
};
