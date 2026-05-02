"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { UnauthorizedError } from "@/app/_actions/_errors";
import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";

import { BookingSlotTakenError } from "./_errors";

interface ISaveBookingProps {
  barbershopId: string;
  barberId: string;
  userId: string;
  date: Date;
  serviceIds: string[];
}

interface SaveBookingResult {
  bookingId: string;
  /** Subtotal (sum of service prices). UI uses this + shop's fee % to display total. */
  total: string;
  /** True if this is a fresh booking; false if we returned an existing unpaid hold. */
  isNew: boolean;
}

// How long the slot stays held while waiting for the customer to complete
// payment. Mirrors the Stripe PIX expiration (30min) so the cleanup window
// is roughly aligned with payment expiry.
const HOLD_DURATION_MS = 30 * 60 * 1000;

export const saveBooking = async ({
  barbershopId,
  barberId,
  userId,
  date,
  serviceIds,
}: ISaveBookingProps): Promise<SaveBookingResult> => {
  // Auth + IDOR guard: never trust the userId param. Derive it from the session
  // and require it to match what the client sent.
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    throw new UnauthorizedError();
  }

  await rateLimit(`user:${userId}:saveBooking`, { max: 10, windowMs: 60_000 });

  if (serviceIds.length === 0) {
    throw new Error("Selecione ao menos um serviço.");
  }
  if (serviceIds.length > 20) {
    throw new Error("Máximo 20 serviços por reserva.");
  }

  // Bloqueia se cair dentro de uma janela de indisponibilidade do barbeiro
  const blocked = await db.barberBlock.findFirst({
    where: {
      barberId,
      startAt: { lte: date },
      endAt: { gt: date },
    },
    select: { id: true },
  });
  if (blocked) {
    throw new BookingSlotTakenError();
  }

  // Snapshot service prices for totaling. Verify they all belong to the same shop.
  const services = await db.service.findMany({
    where: { id: { in: serviceIds }, barbershopId },
    select: { id: true, price: true },
  });
  if (services.length !== serviceIds.length) {
    throw new Error("Algum serviço não pertence a essa barbearia.");
  }
  const total = services.reduce((sum, s) => sum + Number(s.price), 0);

  const holdUntil = new Date(Date.now() + HOLD_DURATION_MS);

  let bookingId: string;
  let isNew = true;

  try {
    const booking = await db.booking.create({
      data: {
        barbershopId,
        barberId,
        userId,
        date,
        holdUntil,
        services: {
          create: serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
      select: { id: true },
    });
    bookingId = booking.id;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Either (userId, date) or (barberId, date) constraint hit. Check if it
      // was the user's own abandoned hold — if so, return that booking so the
      // user can resume checkout instead of being stuck.
      const existing = await db.booking.findFirst({
        where: { userId, barberId, date },
        include: { payment: true },
      });
      if (
        existing &&
        existing.userId === userId &&
        (!existing.payment || existing.payment.status !== "PAID")
      ) {
        // Refresh the hold window so the user has a fresh 30min to pay.
        await db.booking.update({
          where: { id: existing.id },
          data: { holdUntil },
        });
        return { bookingId: existing.id, total: total.toFixed(2), isNew: false };
      }
      throw new BookingSlotTakenError();
    }
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/bookings");

  await audit({
    userId,
    action: "BOOKING_CREATE",
    barbershopId,
    targetType: "Booking",
    targetId: bookingId,
    metadata: {
      barberId,
      serviceCount: serviceIds.length,
      total: total.toFixed(2),
      holdUntil: holdUntil.toISOString(),
    },
  });

  return { bookingId, total: total.toFixed(2), isNew };
};
