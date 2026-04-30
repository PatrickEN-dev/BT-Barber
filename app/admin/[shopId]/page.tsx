import { redirect } from "next/navigation";

const ShopRootPage = ({ params }: { params: { shopId: string } }) => {
  redirect(`/admin/${params.shopId}/dashboard`);
};

export default ShopRootPage;
