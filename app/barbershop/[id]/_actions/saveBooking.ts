"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { BookingSlotTakenError } from "./_errors";

interface ISaveBookingProps {
  barbershopId: string;
  barberId: string;
  userId: string;
  date: Date;
  serviceIds: string[];
}

export const saveBooking = async ({
  barbershopId,
  barberId,
  userId,
  date,
  serviceIds,
}: ISaveBookingProps) => {
  if (serviceIds.length === 0) {
    throw new Error("Selecione ao menos um serviço.");
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

  try {
    await db.booking.create({
      data: {
        barbershopId,
        barberId,
        userId,
        date,
        services: {
          create: serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new BookingSlotTakenError();
    }
    throw err;
  }

  revalidatePath("/");
  revalidatePath("/bookings");
};
