"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";

export const listBarberBlocks = async (shopId: string) => {
  const { barber } = await requireBarberContext(shopId);

  const now = new Date();
  return db.barberBlock.findMany({
    where: { barberId: barber.id, endAt: { gte: now } },
    orderBy: { startAt: "asc" },
  });
};

interface BlockPayload {
  startAt: string;
  endAt: string;
  reason?: string;
}

export const createBarberBlock = async (shopId: string, payload: BlockPayload) => {
  const { barber } = await requireBarberContext(shopId);

  const startAt = new Date(payload.startAt);
  const endAt = new Date(payload.endAt);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw new Error("Datas inválidas.");
  }
  if (endAt <= startAt) throw new Error("Fim deve ser depois do início.");
  if (endAt < new Date()) throw new Error("Não bloqueie o passado.");

  const reason = payload.reason?.trim() || null;
  if (reason && reason.length > 120) throw new Error("Motivo muito longo (máx. 120).");

  await db.barberBlock.create({
    data: { barberId: barber.id, startAt, endAt, reason },
  });

  revalidatePath(`/barber/${shopId}/blocks`);
  revalidatePath(`/barber/${shopId}/dashboard`);
};

export const deleteBarberBlock = async (shopId: string, blockId: string) => {
  const { barber } = await requireBarberContext(shopId);

  await db.barberBlock.delete({
    where: { id: blockId, barberId: barber.id },
  });

  revalidatePath(`/barber/${shopId}/blocks`);
};
