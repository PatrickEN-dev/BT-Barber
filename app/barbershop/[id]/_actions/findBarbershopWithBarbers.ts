"use server";

import { db } from "@/app/_lib/prisma";
import { serializeService } from "@/app/_lib/serializers";

export const findBarbershopWithBarbers = async (id: string) => {
  const shop = await db.barbershop.findUnique({
    where: { id },
    include: {
      Service: true,
      Barbers: {
        where: { deletedAt: null },
        orderBy: { rating: "desc" },
        include: { services: true },
      },
    },
  });

  if (!shop) return null;

  return {
    ...shop,
    Service: shop.Service.map(serializeService),
    Barbers: shop.Barbers.map((barber) => ({
      ...barber,
      services: barber.services.map(serializeService),
    })),
  };
};

export type BarbershopWithBarbers = NonNullable<
  Awaited<ReturnType<typeof findBarbershopWithBarbers>>
>;
export type BarberWithServices = BarbershopWithBarbers["Barbers"][number];
