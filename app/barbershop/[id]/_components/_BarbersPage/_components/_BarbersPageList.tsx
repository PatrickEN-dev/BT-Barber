import { findAllBarbersByShopId } from "@/app/_actions/barbers";
import { BarbersPageCards } from "./_BarbersPageCards";

interface Props {
  searchParams?: { shopId?: string };
}

export default async function BarbersPageList({ searchParams }: Props) {
  const shopId = searchParams?.shopId;

  if (!shopId) {
    return <div className="p-6 text-red-400">Barbershop id não informado.</div>;
  }

  const barbers = await findAllBarbersByShopId(shopId);

  return (
    <main className="min-h-screen bg-neutral-900 text-white p-4">
      <h1 className="text-2xl font-semibold mb-6">Barbeiros</h1>

      <ul className="flex flex-col gap-4">
        {barbers.length === 0 && (
          <li className="text-neutral-400">Nenhum barbeiro encontrado para esta barbearia.</li>
        )}

        {barbers.map((b: Barber) => (
          <li key={b.id}>
            <BarbersPageCards barber={b} />
          </li>
        ))}
      </ul>
    </main>
  );
}
