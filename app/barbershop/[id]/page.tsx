import BarberShopInfos from "./_components/BarberShopInfos";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import BarbershopServices from "./_components/_ServiceComponent/BarbershopServices";
import { findUniqueBarberShop } from "@/app/_actions/barberShop";

interface IBarberShopDetailsPageProps {
  params: {
    id: string;
  };
}

const BarberShopDetailsPage = async ({ params }: IBarberShopDetailsPageProps) => {
  const session = await getServerSession(authOptions);
  if (!params.id) redirect("/");

  const barberShop = await findUniqueBarberShop(params);

  if (!barberShop)
    return (
      <h1 className="h-full items-center text-center flex justify-center">
        Nenhuma barbearia encontrada
      </h1>
    );

  return (
    <div>
      <BarberShopInfos barbershopData={barberShop} />

      <BarbershopServices barbershopData={barberShop} session={session!} />
    </div>
  );
};

export default BarberShopDetailsPage;
