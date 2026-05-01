import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import { findShopProducts } from "@/app/_actions/product";
import { requireShopAccess } from "@/app/admin/_utils/requireOwner";

import PageHeading from "../_components/PageHeading";
import AdminProductsList from "./_components/AdminProductsList";

interface IProps {
  params: { shopId: string };
}

const AdminProductsPage = async ({ params }: IProps) => {
  const { shop } = await requireShopAccess(params.shopId);
  const products = await findShopProducts(params.shopId, { includeInactive: true });

  if (!shop.hasShop) {
    return (
      <>
        <PageHeading
          eyebrow="Lojinha"
          title="Produtos"
          description="A lojinha está desativada"
        />
        <div className="px-5 pb-8">
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Você desativou a lojinha em &ldquo;Configurações&rdquo;. Os clientes não veem a
              aba &ldquo;Loja&rdquo; e não conseguem fazer pedidos. Os produtos abaixo seguem
              salvos pra quando você reativar.
            </p>
            <Button variant="accent" size="sm" asChild>
              <Link href={`/admin/${params.shopId}/settings`}>
                Reativar lojinha
              </Link>
            </Button>
          </div>
          <div className="mt-6">
            <AdminProductsList shopId={params.shopId} products={products} />
          </div>
        </div>
      </>
    );
  }

  const activeCount = products.filter((p) => p.active).length;

  return (
    <>
      <PageHeading
        eyebrow="Lojinha"
        title="Produtos"
        description={`${products.length} cadastrado${products.length === 1 ? "" : "s"} · ${activeCount} ativo${activeCount === 1 ? "" : "s"}`}
      />

      <div className="px-5 pb-8">
        <AdminProductsList shopId={params.shopId} products={products} />
      </div>
    </>
  );
};

export default AdminProductsPage;
