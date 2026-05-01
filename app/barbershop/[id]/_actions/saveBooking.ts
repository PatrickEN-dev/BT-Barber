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
  /** Total of selected services, in BRL string ("45.00"). Used to spin up checkout. */
  total: string;
}

export const saveBooking = async ({
  barbershopId,
  barberId,
  userId,
  date,
  serviceIds,
}: ISaveBookingProps): Promise<SaveBookingResult> => {
  // Auth + IDOR guard: never trust the userId param. Derive it from the session
  // and require it to match what the client sent. This keeps the function shape
  // stable for callers while preventing impersonation.
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

  let bookingId: string;

  try {
    const booking = await db.booking.create({
      data: {
        barbershopId,
        barberId,
        userId,
        date,
        services: {
          create: serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
      select: { id: true },
    });
    bookingId = booking.id;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
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
    metadata: { barberId, serviceCount: serviceIds.length, total: total.toFixed(2) },
  });

  return { bookingId, total: total.toFixed(2) };
};
