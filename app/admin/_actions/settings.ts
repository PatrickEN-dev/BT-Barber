"use server";

import { revalidatePath } from "next/cache";

import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";

import { requireShopAccess } from "../_utils/requireOwner";

interface SettingsPayload {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  hasShop?: boolean;
}

export const updateShopSettings = async (shopId: string, payload: SettingsPayload) => {
  const { user } = await requireShopAccess(shopId);
  await rateLimit(`shop:${shopId}:settings`, { max: 10, windowMs: 60_000 });

  const name = payload.name.trim();
  const address = payload.address.trim();
  const phone = payload.phone.trim();
  const imageUrl = payload.imageUrl.trim();

  if (name.length < 2) throw new Error("Nome muito curto.");
  if (name.length > 120) throw new Error("Nome muito longo.");
  if (address.length < 2) throw new Error("Endereço inválido.");
  if (address.length > 200) throw new Error("Endereço muito longo.");
  if (phone.length > 30) throw new Error("Telefone inválido.");
  if (!imageUrl) throw new Error("Informe a URL da imagem.");
  try {
    const u = new URL(imageUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error("URL da imagem deve ser http ou https.");
    }
  } catch {
    throw new Error("URL da imagem inválida.");
  }
  if (imageUrl.length > 2048) throw new Error("URL da imagem muito longa.");

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

  await audit({
    userId: user.id,
    action: "SHOP_SETTINGS_UPDATE",
    barbershopId: shopId,
    targetType: "Barbershop",
    targetId: shopId,
    metadata: { hasShop: payload.hasShop },
  });
};
