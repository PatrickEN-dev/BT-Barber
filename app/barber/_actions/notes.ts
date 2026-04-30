"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";

export const addClientNote = async (shopId: string, clientId: string, note: string) => {
  const { barber } = await requireBarberContext(shopId);

  const text = note.trim();
  if (text.length < 2) throw new Error("Nota muito curta.");
  if (text.length > 500) throw new Error("Máximo de 500 caracteres.");

  // Cliente precisa ter agendado com este barbeiro pelo menos uma vez
  const hasBooking = await db.booking.findFirst({
    where: { barberId: barber.id, userId: clientId },
    select: { id: true },
  });
  if (!hasBooking) throw new Error("Cliente não atendido por você.");

  await db.barberClientNote.create({
    data: { barberId: barber.id, clientId, note: text },
  });

  revalidatePath(`/barber/${shopId}/clients/${clientId}`);
};

export const deleteClientNote = async (shopId: string, noteId: string) => {
  const { barber } = await requireBarberContext(shopId);

  await db.barberClientNote.delete({
    where: { id: noteId, barberId: barber.id },
  });

  revalidatePath(`/barber/${shopId}/clients`);
};
