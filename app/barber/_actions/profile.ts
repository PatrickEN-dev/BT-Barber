"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "../_utils/requireBarber";

interface ProfilePayload {
  name: string;
  description: string;
  imageUrl: string;
}

export const updateBarberProfile = async (shopId: string, payload: ProfilePayload) => {
  const { barber } = await requireBarberContext(shopId);

  const name = payload.name.trim();
  const description = payload.description.trim();
  const imageUrl = payload.imageUrl.trim();

  if (name.length < 2) throw new Error("Nome muito curto.");
  if (description.length > 500) throw new Error("Descrição muito longa.");

  await db.barber.update({
    where: { id: barber.id },
    data: {
      name,
      description: description || null,
      imageUrl: imageUrl || null,
    },
  });

  revalidatePath(`/barber/${shopId}/profile`);
  revalidatePath(`/barber/${shopId}/dashboard`);
  revalidatePath(`/barbershop/${shopId}`);
  revalidatePath(`/barbershop/${shopId}/barbers/${barber.id}`);
};
