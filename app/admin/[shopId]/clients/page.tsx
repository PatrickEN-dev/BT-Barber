import { UsersIcon } from "lucide-react";

import Container from "@/app/_components/Container";
import { listShopClients } from "@/app/admin/_actions/clients";

import EmptyState from "../_components/EmptyState";
import PageHeading from "../_components/PageHeading";
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

      <Container className="space-y-4 pb-8">
        <ClientsSearch shopId={params.shopId} initial={search ?? ""} />

        {data.clients.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Sem clientes"
            description={search ? "Nenhum cliente encontrado." : "Aguardando o primeiro agendamento."}
          />
        ) : (
          <ClientsList clients={data.clients} />
        )}

        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          perPage={data.perPage}
          basePath={`/admin/${params.shopId}/clients`}
          searchParams={{ search }}
        />
      </Container>
    </main>
  );
};

export default ShopClientsPage;
