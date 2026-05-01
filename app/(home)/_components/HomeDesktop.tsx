import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheckIcon, SparklesIcon, TrendingUpIcon } from "lucide-react";
import { Barbershop } from "@prisma/client";
import { Session } from "next-auth";

import Container from "@/app/_components/Container";
import InputSearch from "@/app/_components/InputSearch";
import { cn } from "@/app/_lib/utils";
import BookingCard from "@/app/bookings/_components/BookingCard";
import type { findConfirmedBookings } from "@/app/_actions/booking";

import BarberShopCard from "./BarberShopCard";

type ConfirmedBookings = Awaited<ReturnType<typeof findConfirmedBookings>>;

interface IHomeDesktopProps {
  session: Session | null;
  barbershops: Barbershop[];
  recommendedBarbershops: Barbershop[];
  confirmedBookings: ConfirmedBookings;
  className?: string;
}

const HomeDesktop = ({
  session,
  barbershops,
  recommendedBarbershops,
  confirmedBookings,
  className,
}: IHomeDesktopProps) => {
  const hasBookings = confirmedBookings.length > 0;

  return (
    <div className={cn("pb-24", className)}>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card to-background">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(40%_60%_at_75%_30%,hsl(var(--accent)/0.15),transparent_70%)]"
        />
        <Container as="section" className="relative animate-slide-up py-12 xl:py-16">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                BT-Barber
              </p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl">
                {session?.user
                  ? `Olá, ${session.user?.name?.split(" ")[0]}.`
                  : "Encontre o barbeiro ideal pra você."}
              </h1>
              <p className="mt-3 text-base capitalize text-muted-foreground xl:text-lg">
                {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            <div className="w-full max-w-xl xl:max-w-md">
              <InputSearch placeholderInput="Pesquise por uma barbearia..." />
            </div>
          </div>
        </Container>
      </section>

      <Container as="section" className="mt-10 xl:mt-12">
        <div className={cn("grid gap-10", hasBookings && "lg:grid-cols-[1fr_320px] xl:gap-12")}>
          <div className="flex min-w-0 flex-col gap-12">
            <section
              className="animate-slide-up"
              style={{ animationDelay: "120ms" }}
            >
              <header className="mb-5 flex items-center gap-2">
                <SparklesIcon size={16} className="text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Recomendados
                </h2>
              </header>
              <ul className="grid grid-cols-3 gap-5 xl:grid-cols-4">
                {barbershops.map((barbershop, i) => (
                  <li
                    key={barbershop.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${160 + i * 50}ms` }}
                  >
                    <BarberShopCard barberShop={barbershop} />
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="animate-slide-up"
              style={{ animationDelay: "200ms" }}
            >
              <header className="mb-5 flex items-center gap-2">
                <TrendingUpIcon size={16} className="text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Populares
                </h2>
              </header>
              <ul className="grid grid-cols-3 gap-5 xl:grid-cols-4">
                {recommendedBarbershops.map((barbershop, i) => (
                  <li
                    key={barbershop.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <BarberShopCard barberShop={barbershop} />
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {hasBookings && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 animate-slide-up" style={{ animationDelay: "240ms" }}>
                <header className="mb-4 flex items-center gap-2">
                  <CalendarCheckIcon size={16} className="text-accent" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Próximos agendamentos
                  </h2>
                </header>
                <div className="flex flex-col gap-3">
                  {confirmedBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </Container>
    </div>
  );
};

export default HomeDesktop;
