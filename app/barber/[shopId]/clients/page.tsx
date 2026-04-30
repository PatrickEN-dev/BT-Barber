import { UsersIcon } from "lucide-react";
import { listBarberClients } from "@/app/barber/_actions/clients";
import PageHeading from "@/app/admin/[shopId]/_components/PageHeading";
import EmptyState from "@/app/admin/[shopId]/_components/EmptyState";
import Pagination from "@/app/admin/[shopId]/_components/Pagination";
import ClientsList from "./_components/ClientsList";
import ClientsSearch from "./_components/ClientsSearch";

interface IProps {
  params: { shopId: string };
  searchParams?: { page?: string; search?: string };
}

const BarberClientsPage = async ({ params, searchParams }: IProps) => {
  const search = searchParams?.search?.trim() || undefined;
  const page = Number(searchParams?.page ?? 1) || 1;

  const data = await listBarberClients({ shopId: params.shopId, page, search });

  return (
    <main>
      <PageHeading
        title="Meus clientes"
        description={`${data.total} ${data.total === 1 ? "cliente atendido" : "clientes atendidos"}`}
      />

      <div className="px-5">
        <ClientsSearch shopId={params.shopId} initial={search ?? ""} />
      </div>

      <section className="px-5 mt-4">
        {data.clients.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Sem clientes"
            description={search ? "Nenhum cliente encontrado." : "Aguardando seu primeiro atendimento."}
          />
        ) : (
          <ClientsList clients={data.clients} shopId={params.shopId} />
        )}
      </section>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        perPage={data.perPage}
        basePath={`/barber/${params.shopId}/clients`}
        searchParams={{ search }}
      />
    </main>
  );
};

export default BarberClientsPage;
