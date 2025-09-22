import { db } from "../_lib/prisma";

export const findAllBarbersByShopId = async (shopId: string) => {
  const result = await db.barber.findMany({
    where: { barbershopId: shopId, deletedAt: null },
    select: { id: true, name: true, imageUrl: true, description: true, rating: true },
    orderBy: { name: "asc" },
  });
  return result;
};
