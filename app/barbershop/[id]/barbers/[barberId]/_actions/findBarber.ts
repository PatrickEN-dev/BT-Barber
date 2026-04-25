"use server";

import { db } from "@/app/_lib/prisma";
import { serializeService } from "@/app/_lib/serializers";

export const findBarberWithServices = async (barberId: string, barbershopId: string) => {
  const barber = await db.barber.findFirst({
    where: { id: barberId, barbershopId },
    include: {
      services: { orderBy: { name: "asc" } },
      barbershop: { select: { id: true, name: true } },
    },
  });

  if (!barber) return null;

  return {
    ...barber,
    services: barber.services.map(serializeService),
  };
};

export type BarberProfile = NonNullable<Awaited<ReturnType<typeof findBarberWithServices>>>;
