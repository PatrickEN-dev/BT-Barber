import { Users2Icon } from "lucide-react";
import { getTeamComparison } from "@/app/barber/_actions/team";
import PageHeading from "@/app/admin/[shopId]/_components/PageHeading";
import EmptyState from "@/app/admin/[shopId]/_components/EmptyState";
import TeamList from "./_components/TeamList";

const BarberTeamPage = async ({ params }: { params: { shopId: string } }) => {
  const data = await getTeamComparison(params.shopId);

  return (
    <main>
      <PageHeading
        title="Equipe"
        description="Comparativo dos últimos 7 dias"
        eyebrow="Sem informação financeira dos colegas"
      />

      <section className="px-5">
        {data.barbers.length === 0 ? (
          <EmptyState icon={Users2Icon} title="Sem barbeiros" />
        ) : (
          <TeamList barbers={data.barbers} myId={data.myId} />
        )}
      </section>
    </main>
  );
};

export default BarberTeamPage;
