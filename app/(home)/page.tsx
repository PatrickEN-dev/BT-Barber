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
    <main className="pb-24">
      <Header />

      <section className="animate-slide-up px-5 pt-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {session?.user
            ? `Olá, ${session.user?.name?.split(" ")[0]}!`
            : "Olá! Vamos agendar um corte hoje?"}
        </h1>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
        </p>
      </section>

      <section
        className="mt-6 animate-slide-up px-5"
        style={{ animationDelay: "80ms" }}
      >
        <InputSearch placeholderInput="Pesquise por uma barbearia..." />
      </section>

      {confirmedBookings.length > 0 && (
        <section className="mt-8 animate-slide-up" style={{ animationDelay: "160ms" }}>
          <h2 className="mb-3 px-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Agendamentos
          </h2>
          <ul className="flex gap-3 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden">
            {confirmedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 px-5">
        <h2
          className="mb-4 animate-slide-up text-xs font-bold uppercase tracking-wider text-muted-foreground"
          style={{ animationDelay: "200ms" }}
        >
          Recomendados
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {barbershops.map((barbershop: Barbershop, i: number) => (
            <li
              key={barbershop.id}
              className="animate-scale-in"
              style={{ animationDelay: `${240 + i * 60}ms` }}
            >
              <BarberShopCard barberShop={barbershop} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 px-5">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Populares
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {recommendedBarbershops.map((barbershop: Barbershop, i: number) => (
            <li
              key={barbershop.id}
              className="animate-scale-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <BarberShopCard barberShop={barbershop} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
