import { CalendarOffIcon } from "lucide-react";
import { listBarberBlocks } from "@/app/barber/_actions/blocks";
import PageHeading from "@/app/admin/[shopId]/_components/PageHeading";
import EmptyState from "@/app/admin/[shopId]/_components/EmptyState";
import BlocksList from "./_components/BlocksList";
import BlockFormSheet from "./_components/BlockFormSheet";

const BarberBlocksPage = async ({ params }: { params: { shopId: string } }) => {
  const blocks = await listBarberBlocks(params.shopId);

  return (
    <main>
      <PageHeading
        title="Bloqueios"
        description="Janelas em que você não estará disponível"
        action={<BlockFormSheet shopId={params.shopId} />}
      />

      <section className="px-5">
        {blocks.length === 0 ? (
          <EmptyState
            icon={CalendarOffIcon}
            title="Sem bloqueios"
            description="Adicione períodos de almoço, folga ou indisponibilidade. Clientes não conseguirão agendar nesses horários."
          />
        ) : (
          <BlocksList blocks={blocks} shopId={params.shopId} />
        )}
      </section>
    </main>
  );
};

export default BarberBlocksPage;
