import { redirect } from "next/navigation";
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
    <>
      <Header />

      <section className="px-5 py-6 flex flex-col gap-6">
        <InputSearch
          defaultValues={{
            search: searchParams.search,
          }}
          placeholderInput="Pesquise por uma barbearia..."
        />

        {barbershops.length === 0 ? (
          <section className="text-center items-center">
            <p>Nenhuma barbearia encontrada.</p>
          </section>
        ) : (
          <>
            <h1 className="text-gray-400 font-bold text-xs uppercase">
              Resultados para &quot;{searchParams.search}&quot;
            </h1>

            <ul className="grid grid-cols-2 gap-4">
              {barbershops.map((barbershop) => (
                <li key={barbershop.id} className="w-full">
                  <BarberShopCard barberShop={barbershop} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
};

export default BarbershopsPage;
