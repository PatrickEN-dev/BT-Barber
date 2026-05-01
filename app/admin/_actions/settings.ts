"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/_lib/prisma";
import { requireShopAccess } from "../_utils/requireOwner";

interface SettingsPayload {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  hasShop?: boolean;
}

export const updateShopSettings = async (shopId: string, payload: SettingsPayload) => {
  await requireShopAccess(shopId);

  const name = payload.name.trim();
  const address = payload.address.trim();
  const phone = payload.phone.trim();
  const imageUrl = payload.imageUrl.trim();

  if (name.length < 2) throw new Error("Nome muito curto.");
  if (address.length < 2) throw new Error("Endereço inválido.");
  if (!imageUrl) throw new Error("Informe a URL da imagem.");

  await db.barbershop.update({
    where: { id: shopId },
    data: {
      name,
      address,
      phone: phone || null,
      imageUrl,
      ...(typeof payload.hasShop === "boolean" ? { hasShop: payload.hasShop } : {}),
    },
  });

  revalidatePath(`/admin/${shopId}/settings`);
  revalidatePath(`/admin/${shopId}/dashboard`);
  revalidatePath(`/admin/${shopId}/products`);
  revalidatePath(`/barbershop/${shopId}`);
  revalidatePath("/");
};
