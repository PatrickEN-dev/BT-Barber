import { redirect } from "next/navigation";

import { findShopProducts } from "@/app/_actions/product";
import { redirectIfOwner } from "@/app/_utils/redirectIfOwner";

import BarberShopInfos from "./_components/BarberShopInfos";
import BarbershopTabs from "./_components/BarbershopTabs";
import { findBarbershopWithBarbers } from "./_actions/findBarbershopWithBarbers";

interface IBarberShopDetailsPageProps {
  params: {
    id: string;
  };
}

const BarberShopDetailsPage = async ({ params }: IBarberShopDetailsPageProps) => {
  await redirectIfOwner();
  if (!params.id) redirect("/");

  const [barberShop, products] = await Promise.all([
    findBarbershopWithBarbers(params.id),
    findShopProducts(params.id),
  ]);

  if (!barberShop) {
    return (
      <h1 className="flex h-full items-center justify-center text-center">
        Nenhuma barbearia encontrada
      </h1>
    );
  }

  return (
    <div>
      <BarberShopInfos barbershopData={barberShop} />
      <BarbershopTabs barbershopData={barberShop} products={products} />
    </div>
  );
};

export default BarberShopDetailsPage;
