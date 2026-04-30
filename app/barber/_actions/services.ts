"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";
import { serializeService } from "@/app/_lib/serializers";

export const listBarberServices = async (shopId: string) => {
  const { barber } = await requireBarberContext(shopId);

  const [allServices, mineRaw] = await Promise.all([
    db.service.findMany({
      where: { barbershopId: shopId },
      orderBy: { name: "asc" },
    }),
    db.barber.findUnique({
      where: { id: barber.id },
      select: { services: { select: { id: true } } },
    }),
  ]);

  const mine = new Set((mineRaw?.services ?? []).map((s) => s.id));

  return allServices.map((s) => ({
    ...serializeService(s),
    enabled: mine.has(s.id),
  }));
};

export const toggleBarberService = async (shopId: string, serviceId: string) => {
  const { barber } = await requireBarberContext(shopId);

  // Garante que o serviço pertence à loja
  const service = await db.service.findFirst({
    where: { id: serviceId, barbershopId: shopId },
    select: { id: true },
  });
  if (!service) throw new Error("Serviço inválido.");

  const existing = await db.barber.findFirst({
    where: { id: barber.id, services: { some: { id: serviceId } } },
    select: { id: true },
  });

  if (existing) {
    await db.barber.update({
      where: { id: barber.id },
      data: { services: { disconnect: { id: serviceId } } },
    });
  } else {
    await db.barber.update({
      where: { id: barber.id },
      data: { services: { connect: { id: serviceId } } },
    });
  }

  revalidatePath(`/barber/${shopId}/services`);
  revalidatePath(`/barbershop/${shopId}`);
};
