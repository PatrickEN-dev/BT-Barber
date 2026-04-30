import { redirect } from "next/navigation";

const BarberShopRoot = ({ params }: { params: { shopId: string } }) => {
  redirect(`/barber/${params.shopId}/dashboard`);
};

export default BarberShopRoot;
