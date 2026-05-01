import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Barbershop } from "@prisma/client";
import { Session } from "next-auth";

import InputSearch from "@/app/_components/InputSearch";
import { cn } from "@/app/_lib/utils";
import BookingCard from "@/app/bookings/_components/BookingCard";
import type { findConfirmedBookings } from "@/app/_actions/booking";

import BarberShopCard from "./BarberShopCard";

type ConfirmedBookings = Awaited<ReturnType<typeof findConfirmedBookings>>;

interface IHomeMobileProps {
  session: Session | null;
  barbershops: Barbershop[];
  recommendedBarbershops: Barbershop[];
  confirmedBookings: ConfirmedBookings;
  className?: string;
}

const HomeMobile = ({
  session,
  barbershops,
  recommendedBarbershops,
  confirmedBookings,
  className,
}: IHomeMobileProps) => (
  <div className={cn("pb-24", className)}>
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

    <section className="mt-6 animate-slide-up px-5" style={{ animationDelay: "80ms" }}>
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
  </div>
);

export default HomeMobile;
