import { ReactNode } from "react";
import { requireShopAccess } from "../_utils/requireOwner";
import AdminHeader from "./_components/AdminHeader";
import AdminBottomNav from "./_components/AdminBottomNav";

interface IProps {
  children: ReactNode;
  params: { shopId: string };
}

const ShopAdminLayout = async ({ children, params }: IProps) => {
  const { shop } = await requireShopAccess(params.shopId);

  return (
    <>
      <AdminHeader shopName={shop.name} shopId={shop.id} shopImageUrl={shop.imageUrl} />
      <div className="pb-24">{children}</div>
      <AdminBottomNav shopId={shop.id} />
    </>
  );
};

export default ShopAdminLayout;
