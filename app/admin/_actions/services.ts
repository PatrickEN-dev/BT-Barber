"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";
import { serializeService } from "@/app/_lib/serializers";

import { requireShopAccess } from "../_utils/requireOwner";

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
  const { user } = await requireShopAccess(shopId);
  await rateLimit(`shop:${shopId}:serviceMutate`, { max: 30, windowMs: 60_000 });
  const data = validate(payload);

  const service = await db.service.create({
    data: { ...data, barbershopId: shopId },
  });

  revalidatePath(`/admin/${shopId}/services`);
  revalidatePath(`/barbershop/${shopId}`);

  await audit({
    userId: user.id,
    action: "SERVICE_CREATE",
    barbershopId: shopId,
    targetType: "Service",
    targetId: service.id,
    metadata: { name: service.name, price: service.price.toString() },
  });
};

export const updateShopService = async (
  shopId: string,
  serviceId: string,
  payload: ServicePayload
) => {
  const { user } = await requireShopAccess(shopId);
  await rateLimit(`shop:${shopId}:serviceMutate`, { max: 30, windowMs: 60_000 });
  const data = validate(payload);

  await db.service.update({
    where: { id: serviceId, barbershopId: shopId },
    data,
  });

  revalidatePath(`/admin/${shopId}/services`);
  revalidatePath(`/barbershop/${shopId}`);

  await audit({
    userId: user.id,
    action: "SERVICE_UPDATE",
    barbershopId: shopId,
    targetType: "Service",
    targetId: serviceId,
  });
};

export const deleteShopService = async (shopId: string, serviceId: string) => {
  const { user } = await requireShopAccess(shopId);
  await rateLimit(`shop:${shopId}:serviceMutate`, { max: 30, windowMs: 60_000 });

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

  await audit({
    userId: user.id,
    action: "SERVICE_DELETE",
    barbershopId: shopId,
    targetType: "Service",
    targetId: serviceId,
  });
};
