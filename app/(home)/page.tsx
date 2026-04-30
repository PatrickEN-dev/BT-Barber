import Header from "../_components/Header";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BookingCard from "../bookings/_components/BookingCard";
import BarberShopCard from "./_components/BarberShopCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";
import { Barbershop } from "@prisma/client";
import { db } from "../_lib/prisma";
import InputSearch from "../_components/InputSearch";
import { findConfirmedBookings } from "../_actions/booking";
import { redirectIfOwner } from "../_utils/redirectIfOwner";

export default async function Home() {
  await redirectIfOwner();
  const session = await getServerSession(authOptions);

  const [barbershops, recommendedBarbershops, confirmedBookings] = await Promise.all([
    db.barbershop.findMany({}),
    db.barbershop.findMany({ orderBy: { id: "asc" } }),
    session?.user ? findConfirmedBookings(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <main>
      <Header />

      <section className="px-5 pt-5">
        <h2 className="text-xl font-bold">
          {session?.user
            ? `Olá, ${session.user?.name?.split(" ")[0]}!`
            : "Olá! Vamos agendar um corte hoje?"}
        </h2>
        <p className="capitalize text-sm">
          {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
        </p>
      </section>

      <section className="px-5 mt-6">
        <InputSearch placeholderInput="Pesquise por uma barbearia..." />
      </section>

      <section className="mt-6">
        {confirmedBookings.length > 0 && (
          <>
            <h2 className="pl-5 text-xs mb-3 uppercase text-gray-400 font-bold">Agendamentos</h2>
            <li className="px-5 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {confirmedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </li>
          </>
        )}
      </section>

      <section className="px-2 pb-3 mt-4">
        <h2 className="px-5 text-sm uppercase text-gray-400 font-bold mb-3">Recomendados</h2>

        <ul className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop: Barbershop) => (
            <li key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarberShopCard key={barbershop.id} barberShop={barbershop} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 mb-[4.5rem] px-2">
        <h2 className="px-5 text-xs mb-3 uppercase text-gray-400 font-bold">Populares</h2>

        <ul className="flex px-5 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {recommendedBarbershops.map((barbershop: Barbershop) => (
            <li key={barbershop.id} className="min-w-[167px] max-w-[167px]">
              <BarberShopCard key={barbershop.id} barberShop={barbershop} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
