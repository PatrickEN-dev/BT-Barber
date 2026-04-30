import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";

export const requireBarber = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  if (session.user.role !== "BARBER") redirect("/");
  return session.user;
};

export const requireBarberContext = async (shopId: string) => {
  const user = await requireBarber();

  const barber = await db.barber.findFirst({
    where: { userId: user.id, barbershopId: shopId },
    include: { barbershop: { select: { id: true, name: true, address: true, imageUrl: true } } },
  });

  if (!barber) redirect("/barber");

  return { user, barber };
};
