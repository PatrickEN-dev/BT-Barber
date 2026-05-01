import { ScissorsIcon } from "lucide-react";

import Container from "@/app/_components/Container";
import { listShopServices } from "@/app/admin/_actions/services";

import EmptyState from "../_components/EmptyState";
import PageHeading from "../_components/PageHeading";
import ServiceFormSheet from "./_components/ServiceFormSheet";
import ServicesList from "./_components/ServicesList";

const ShopServicesPage = async ({ params }: { params: { shopId: string } }) => {
  const services = await listShopServices(params.shopId);

  return (
    <main>
      <PageHeading
        title="Serviços"
        description={`${services.length} ${services.length === 1 ? "serviço" : "serviços"}`}
        action={<ServiceFormSheet shopId={params.shopId} mode="create" />}
      />

      <Container className="pb-8">
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
      </Container>
    </main>
  );
};

export default ShopServicesPage;
