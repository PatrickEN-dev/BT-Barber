import { findShopOrders } from "@/app/_actions/order";
import { requireShopAccess } from "@/app/admin/_utils/requireOwner";

import PageHeading from "../_components/PageHeading";
import AdminOrdersList from "./_components/AdminOrdersList";

interface IProps {
  params: { shopId: string };
}

const AdminOrdersPage = async ({ params }: IProps) => {
  await requireShopAccess(params.shopId);
  const orders = await findShopOrders(params.shopId);

  const pendingCount = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "READY"].includes(o.status)
  ).length;

  return (
    <>
      <PageHeading
        eyebrow="Lojinha"
        title="Pedidos"
        description={`${orders.length} no total · ${pendingCount} ativo${pendingCount === 1 ? "" : "s"}`}
      />

      <div className="px-5 pb-8">
        <AdminOrdersList orders={orders} />
      </div>
    </>
  );
};

export default AdminOrdersPage;
