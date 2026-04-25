import BarberShopInfos from "./_components/BarberShopInfos";
import { redirect } from "next/navigation";
import BarbershopServices from "./_components/_ServiceComponent/BarbershopServices";
import { findBarbershopWithBarbers } from "./_actions/findBarbershopWithBarbers";

interface IBarberShopDetailsPageProps {
  params: {
    id: string;
  };
}

const BarberShopDetailsPage = async ({ params }: IBarberShopDetailsPageProps) => {
  if (!params.id) redirect("/");

  const barberShop = await findBarbershopWithBarbers(params.id);

  if (!barberShop)
    return (
      <h1 className="h-full items-center text-center flex justify-center">
        Nenhuma barbearia encontrada
      </h1>
    );

  return (
    <div>
      <BarberShopInfos barbershopData={barberShop} />

      <BarbershopServices barbershopData={barberShop} />
    </div>
  );
};

export default BarberShopDetailsPage;
