import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";

const BarberIndexPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const barber = await db.barber.findUnique({
    where: { userId },
    select: { barbershopId: true },
  });

  if (!barber) {
    return (
      <main className="px-5 py-10 max-w-md mx-auto">
        <h1 className="text-xl font-bold">Conta sem barbearia vinculada</h1>
        <p className="mt-2 text-sm text-gray-400">
          Sua conta é de barbeiro mas ainda não foi vinculada a um perfil. Fale com o dono da barbearia.
        </p>
      </main>
    );
  }

  redirect(`/barber/${barber.barbershopId}/dashboard`);
};

export default BarberIndexPage;
