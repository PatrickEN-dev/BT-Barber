import { ScissorsIcon } from "lucide-react";
import { listShopServices } from "@/app/admin/_actions/services";
import PageHeading from "../_components/PageHeading";
import EmptyState from "../_components/EmptyState";
import ServicesList from "./_components/ServicesList";
import ServiceFormSheet from "./_components/ServiceFormSheet";

const ShopServicesPage = async ({ params }: { params: { shopId: string } }) => {
  const services = await listShopServices(params.shopId);

  return (
    <main>
      <PageHeading
        title="Serviços"
        description={`${services.length} ${services.length === 1 ? "serviço" : "serviços"}`}
        action={<ServiceFormSheet shopId={params.shopId} mode="create" />}
      />

      <section className="px-5">
        {services.length === 0 ? (
          <EmptyState
            icon={ScissorsIcon}
            title="Nenhum serviço cadastrado"
            description="Crie o primeiro serviço para começar a receber agendamentos."
            action={<ServiceFormSheet shopId={params.shopId} mode="create" />}
          />
        ) : (
          <ServicesList services={services} shopId={params.shopId} />
        )}
      </section>
    </main>
  );
};

export default ShopServicesPage;
