"use server";

import { db } from "@/app/_lib/prisma";
import { serializeProduct, type SerializedProduct } from "@/app/_lib/serializers";

export const findShopProducts = async (barbershopId: string): Promise<SerializedProduct[]> => {
  const products = await db.product.findMany({
    where: { barbershopId, active: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return products.map(serializeProduct);
};
