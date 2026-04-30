import { db } from "@/app/_lib/prisma";
import { requireBarberContext } from "@/app/barber/_utils/requireBarber";
import PageHeading from "@/app/admin/[shopId]/_components/PageHeading";
import ProfileForm from "./_components/ProfileForm";

const BarberProfilePage = async ({ params }: { params: { shopId: string } }) => {
  const { barber } = await requireBarberContext(params.shopId);

  const fresh = await db.barber.findUniqueOrThrow({
    where: { id: barber.id },
    select: { id: true, name: true, description: true, imageUrl: true, rating: true },
  });

  return (
    <main>
      <PageHeading
        title="Meu perfil"
        description="Como você aparece pra clientes"
      />
      <section className="px-5">
        <ProfileForm
          shopId={params.shopId}
          initial={{
            name: fresh.name,
            description: fresh.description ?? "",
            imageUrl: fresh.imageUrl ?? "",
          }}
          rating={fresh.rating ?? 0}
        />
      </section>
    </main>
  );
};

export default BarberProfilePage;
