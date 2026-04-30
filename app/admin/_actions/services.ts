"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/app/_lib/prisma";
import { requireShopAccess } from "../_utils/requireOwner";
import { serializeService } from "@/app/_lib/serializers";

export const listShopServices = async (shopId: string) => {
  await requireShopAccess(shopId);

  const services = await db.service.findMany({
    where: { barbershopId: shopId },
    orderBy: { name: "asc" },
    include: { _count: { select: { Barbers: true, BookingService: true } } },
  });

  return services.map((s) => ({
    ...serializeService(s),
    barbersCount: s._count.Barbers,
    bookingsCount: s._count.BookingService,
  }));
};

interface ServicePayload {
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
}

const validate = (payload: ServicePayload) => {
  const name = payload.name.trim();
  const description = payload.description.trim();
  const imageUrl = payload.imageUrl.trim();
  const price = Number(payload.price);

  if (name.length < 2) throw new Error("Nome muito curto.");
  if (description.length < 2) throw new Error("Descrição muito curta.");
  if (!imageUrl) throw new Error("Informe uma URL de imagem.");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Preço inválido.");

  return { name, description, imageUrl, price: new Prisma.Decimal(price.toFixed(2)) };
};

export const createShopService = async (shopId: string, payload: ServicePayload) => {
  await requireShopAccess(shopId);
  const data = validate(payload);

  await db.service.create({
    data: { ...data, barbershopId: shopId },
  });

  revalidatePath(`/admin/${shopId}/services`);
  revalidatePath(`/barbershop/${shopId}`);
};

export const updateShopService = async (
  shopId: string,
  serviceId: string,
  payload: ServicePayload
) => {
  await requireShopAccess(shopId);
  const data = validate(payload);

  await db.service.update({
    where: { id: serviceId, barbershopId: shopId },
    data,
  });

  revalidatePath(`/admin/${shopId}/services`);
  revalidatePath(`/barbershop/${shopId}`);
};

export const deleteShopService = async (shopId: string, serviceId: string) => {
  await requireShopAccess(shopId);

  try {
    await db.service.delete({
      where: { id: serviceId, barbershopId: shopId },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new Error("Este serviço já está vinculado a agendamentos e não pode ser excluído.");
    }
    throw err;
  }

  revalidatePath(`/admin/${shopId}/services`);
  revalidatePath(`/barbershop/${shopId}`);
};
