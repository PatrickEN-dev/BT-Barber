import { UsersIcon } from "lucide-react";
import { listShopClients } from "@/app/admin/_actions/clients";
import PageHeading from "../_components/PageHeading";
import EmptyState from "../_components/EmptyState";
import Pagination from "../_components/Pagination";
import ClientsList from "./_components/ClientsList";
import ClientsSearch from "./_components/ClientsSearch";

interface IProps {
  params: { shopId: string };
  searchParams?: { page?: string; search?: string };
}

const ShopClientsPage = async ({ params, searchParams }: IProps) => {
  const search = searchParams?.search?.trim() || undefined;
  const page = Number(searchParams?.page ?? 1) || 1;

  const data = await listShopClients({ shopId: params.shopId, page, search });

  return (
    <main>
      <PageHeading
        title="Clientes"
        description={`${data.total} ${data.total === 1 ? "cliente" : "clientes"}`}
      />

      <div className="px-5">
        <ClientsSearch shopId={params.shopId} initial={search ?? ""} />
      </div>

      <section className="px-5 mt-4">
        {data.clients.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Sem clientes"
            description={search ? "Nenhum cliente encontrado." : "Aguardando o primeiro agendamento."}
          />
        ) : (
          <ClientsList clients={data.clients} />
        )}
      </section>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        perPage={data.perPage}
        basePath={`/admin/${params.shopId}/clients`}
        searchParams={{ search }}
      />
    </main>
  );
};

export default ShopClientsPage;
