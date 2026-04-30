import { ScissorsIcon } from "lucide-react";
import { listShopBarbers } from "@/app/admin/_actions/barbers";
import PageHeading from "../_components/PageHeading";
import EmptyState from "../_components/EmptyState";
import BarbersList from "./_components/BarbersList";

const ShopBarbersPage = async ({ params }: { params: { shopId: string } }) => {
  const barbers = await listShopBarbers(params.shopId);

  return (
    <main>
      <PageHeading
        title="Equipe"
        description={`${barbers.length} ${barbers.length === 1 ? "barbeiro" : "barbeiros"}`}
      />

      <section className="px-5">
        {barbers.length === 0 ? (
          <EmptyState
            icon={ScissorsIcon}
            title="Nenhum barbeiro cadastrado"
            description="Cadastre seus barbeiros para começar a receber agendamentos."
          />
        ) : (
          <BarbersList barbers={barbers} />
        )}
      </section>
    </main>
  );
};

export default ShopBarbersPage;
