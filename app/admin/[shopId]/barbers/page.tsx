import { ScissorsIcon } from "lucide-react";

import Container from "@/app/_components/Container";
import { listShopBarbers } from "@/app/admin/_actions/barbers";

import EmptyState from "../_components/EmptyState";
import PageHeading from "../_components/PageHeading";
import BarbersList from "./_components/BarbersList";

const ShopBarbersPage = async ({ params }: { params: { shopId: string } }) => {
  const barbers = await listShopBarbers(params.shopId);

  return (
    <main>
      <PageHeading
        title="Equipe"
        description={`${barbers.length} ${barbers.length === 1 ? "barbeiro" : "barbeiros"}`}
      />

      <Container className="pb-8">
        {barbers.length === 0 ? (
          <EmptyState
            icon={ScissorsIcon}
            title="Nenhum barbeiro cadastrado"
            description="Cadastre seus barbeiros para começar a receber agendamentos."
          />
        ) : (
          <BarbersList barbers={barbers} />
        )}
      </Container>
    </main>
  );
};

export default ShopBarbersPage;
