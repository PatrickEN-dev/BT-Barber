import { ScissorsIcon } from "lucide-react";
import { listBarberServices } from "@/app/barber/_actions/services";
import PageHeading from "@/app/admin/[shopId]/_components/PageHeading";
import EmptyState from "@/app/admin/[shopId]/_components/EmptyState";
import ServicesList from "./_components/ServicesList";

const BarberServicesPage = async ({ params }: { params: { shopId: string } }) => {
  const services = await listBarberServices(params.shopId);
  const enabledCount = services.filter((s) => s.enabled).length;

  return (
    <main>
      <PageHeading
        title="Meus serviços"
        description={`${enabledCount} de ${services.length} ativados`}
      />

      <section className="px-5">
        {services.length === 0 ? (
          <EmptyState
            icon={ScissorsIcon}
            title="Loja sem serviços"
            description="Peça pro dono cadastrar serviços no catálogo da barbearia."
          />
        ) : (
          <ServicesList services={services} shopId={params.shopId} />
        )}
      </section>
    </main>
  );
};

export default BarberServicesPage;
