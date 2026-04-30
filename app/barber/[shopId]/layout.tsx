import { ReactNode } from "react";
import { requireBarberContext } from "../_utils/requireBarber";
import BarberHeader from "./_components/BarberHeader";
import BarberBottomNav from "./_components/BarberBottomNav";

interface IProps {
  children: ReactNode;
  params: { shopId: string };
}

const BarberShopLayout = async ({ children, params }: IProps) => {
  const { barber } = await requireBarberContext(params.shopId);

  return (
    <>
      <BarberHeader
        shopId={barber.barbershopId}
        shopName={barber.barbershop.name}
        barberName={barber.name}
        barberImageUrl={barber.imageUrl}
      />
      <div className="pb-24">{children}</div>
      <BarberBottomNav shopId={barber.barbershopId} />
    </>
  );
};

export default BarberShopLayout;
