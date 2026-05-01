import { ChevronLeft, ScissorsIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/app/_components/Container";
import { Card, CardContent } from "@/app/_components/ui/card";
import { formatPrice } from "@/app/_utils/formatPrices";

import { findBarberWithServices } from "./_actions/findBarber";
import SelectBarberButton from "./_components/SelectBarberButton";

interface IBarberProfilePageProps {
  params: { id: string; barberId: string };
}

const BarberProfilePage = async ({ params }: IBarberProfilePageProps) => {
  const barber = await findBarberWithServices(params.barberId, params.id);

  if (!barber) notFound();

  const initials = barber.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <main className="pb-24">
      <Container className="py-4 lg:py-8">
        <Link
          href={`/barbershop/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </Container>

      <Container className="lg:py-4">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] xl:gap-12">
          {/* Barber profile column (sticky on desktop) */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="animate-slide-up rounded-2xl border border-border bg-card p-6 text-center shadow-card lg:p-8">
              <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-secondary ring-4 ring-accent/20 lg:h-36 lg:w-36">
                {barber.imageUrl ? (
                  <Image
                    src={barber.imageUrl}
                    alt={barber.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 112px, 144px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-bold">
                    {initials}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-xl font-bold tracking-tight lg:text-2xl">{barber.name}</h1>
              <p className="text-xs text-muted-foreground">{barber.barbershop.name}</p>

              {typeof barber.rating === "number" && barber.rating > 0 && (
                <span className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <StarIcon size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{barber.rating.toFixed(1)}</span>
                </span>
              )}

              {barber.description && (
                <p className="mt-4 text-sm text-muted-foreground">{barber.description}</p>
              )}

              <div className="mt-6 hidden lg:block">
                <SelectBarberButton barber={barber} shopId={params.id} />
              </div>
            </div>
          </aside>

          {/* Services column */}
          <section
            className="animate-slide-up min-w-0"
            style={{ animationDelay: "120ms" }}
          >
            <header className="mb-4 flex items-center gap-2 lg:mb-6">
              <ScissorsIcon size={16} className="text-accent" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                O que ele faz
              </h2>
            </header>

            {barber.services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">Sem serviços cadastrados.</p>
              </div>
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {barber.services.map((service, i) => (
                  <li
                    key={service.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${160 + i * 50}ms` }}
                  >
                    <Card className="transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover">
                      <CardContent className="flex items-center justify-between gap-4 p-4">
                        <span className="truncate text-sm font-medium">{service.name}</span>
                        <span className="shrink-0 text-sm font-bold text-accent">
                          {formatPrice(String(service.price))}
                        </span>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Container>

      {/* Mobile sticky CTA */}
      <div className="sticky bottom-0 left-0 right-0 z-20 mt-8 border-t border-border bg-background/95 px-5 py-4 backdrop-blur-md lg:hidden">
        <SelectBarberButton barber={barber} shopId={params.id} />
      </div>
    </main>
  );
};

export default BarberProfilePage;
