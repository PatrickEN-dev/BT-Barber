import { db } from "@/app/_lib/prisma";
import { requireShopAccess } from "@/app/admin/_utils/requireOwner";
import PageHeading from "../_components/PageHeading";
import SettingsForm from "./_components/SettingsForm";

const ShopSettingsPage = async ({ params }: { params: { shopId: string } }) => {
  await requireShopAccess(params.shopId);

  const shop = await db.barbershop.findUniqueOrThrow({
    where: { id: params.shopId },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      imageUrl: true,
      hasShop: true,
    },
  });

  return (
    <main>
      <PageHeading title="Configurações" description="Ajuste os dados públicos da barbearia." />
      <section className="px-5 pb-8">
        <SettingsForm
          shopId={shop.id}
          initial={{
            name: shop.name,
            address: shop.address,
            phone: shop.phone ?? "",
            imageUrl: shop.imageUrl,
            hasShop: shop.hasShop,
          }}
        />
      </section>
    </main>
  );
};

export default ShopSettingsPage;
