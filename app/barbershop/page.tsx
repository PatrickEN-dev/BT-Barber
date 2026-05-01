import { redirect } from "next/navigation";

import Container from "../_components/Container";
import Header from "../_components/Header";
import InputSearch from "../_components/InputSearch";
import BarberShopCard from "../(home)/_components/BarberShopCard";
import { findAllBarbershops } from "../_actions/barberShop";
import { redirectIfOwner } from "../_utils/redirectIfOwner";

interface IBarbershopsPageProps {
  searchParams: {
    search?: string;
  };
}

const BarbershopsPage = async ({ searchParams }: IBarbershopsPageProps) => {
  await redirectIfOwner();
  if (!searchParams.search) return redirect("/");

  const barbershops = await findAllBarbershops(searchParams.search);

  return (
    <main className="pb-24">
      <Header />

      <Container as="section" className="flex flex-col gap-6 py-6 lg:py-10">
        <div className="animate-slide-up">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Resultados da busca
          </p>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl xl:text-4xl">
            &ldquo;{searchParams.search}&rdquo;
          </h1>
        </div>

        <div className="max-w-xl animate-slide-up" style={{ animationDelay: "80ms" }}>
          <InputSearch
            defaultValues={{ search: searchParams.search }}
            placeholderInput="Pesquise por uma barbearia..."
          />
        </div>

        {barbershops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="text-base text-muted-foreground">
              Nenhuma barbearia encontrada para essa busca.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {barbershops.map((barbershop, i) => (
              <li
                key={barbershop.id}
                className="animate-scale-in"
                style={{ animationDelay: `${120 + i * 50}ms` }}
              >
                <BarberShopCard barberShop={barbershop} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
};

export default BarbershopsPage;
