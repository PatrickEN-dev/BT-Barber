import { PackageIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { findShopOrders } from "@/app/_actions/order";
import { requireShopAccess } from "@/app/admin/_utils/requireOwner";

import PageHeading from "../_components/PageHeading";
import AdminOrdersList from "./_components/AdminOrdersList";

interface IProps {
  params: { shopId: string };
}

const AdminOrdersPage = async ({ params }: IProps) => {
  const { shop } = await requireShopAccess(params.shopId);
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
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/${params.shopId}/products`}>
              <PackageIcon size={14} className="mr-1.5" />
              Produtos
            </Link>
          </Button>
        }
      />

      {!shop.hasShop && (
        <div className="mx-5 mb-4 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          A lojinha está desativada. Os clientes não conseguem fazer novos pedidos. Reative em{" "}
          <Link
            href={`/admin/${params.shopId}/settings`}
            className="font-semibold underline underline-offset-2"
          >
            Configurações
          </Link>
          .
        </div>
      )}

      <div className="px-5 pb-8">
        <AdminOrdersList orders={orders} />
      </div>
    </>
  );
};

export default AdminOrdersPage;
