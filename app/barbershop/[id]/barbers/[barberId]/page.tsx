import { Card, CardContent } from "@/app/_components/ui/card";
import { formatPrice } from "@/app/_utils/formatPrices";
import { ChevronLeft, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findBarberWithServices } from "./_actions/findBarber";
import SelectBarberButton from "./_components/SelectBarberButton";

interface IBarberProfilePageProps {
  params: { id: string; barberId: string };
}

const BarberProfilePage = async ({ params }: IBarberProfilePageProps) => {
  const barber = await findBarberWithServices(params.barberId, params.id);

  if (!barber) notFound();

  const initials = barber.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <main className="pb-24">
      <div className="px-5 py-4 flex items-center gap-2">
        <Link
          href={`/barbershop/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary"
        >
          <ChevronLeft size={16} />
          Voltar
        </Link>
      </div>

      <section className="px-5 flex flex-col items-center text-center">
        <div className="relative h-28 w-28 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
          {barber.imageUrl ? (
            <Image
              src={barber.imageUrl}
              alt={barber.name}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <span className="text-2xl font-bold">{initials}</span>
          )}
        </div>

        <h1 className="mt-4 text-xl font-bold">{barber.name}</h1>
        <p className="text-xs text-gray-400">{barber.barbershop.name}</p>

        {typeof barber.rating === "number" && barber.rating > 0 && (
          <span className="mt-2 inline-flex items-center gap-1 text-sm text-gray-400">
            <StarIcon size={14} className="text-primary" />
            {barber.rating.toFixed(1)}
          </span>
        )}

        {barber.description && (
          <p className="mt-4 text-sm text-gray-300 max-w-md">{barber.description}</p>
        )}
      </section>

      <section className="px-5 mt-8">
        <h2 className="text-xs uppercase text-gray-400 font-bold mb-3">O que ele faz</h2>

        {barber.services.length === 0 ? (
          <p className="text-sm text-gray-400">Sem serviços cadastrados.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {barber.services.map((service) => (
              <li key={service.id}>
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-sm">{service.name}</span>
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(String(service.price))}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-secondary px-5 py-4 mt-8">
        <SelectBarberButton barber={barber} shopId={params.id} />
      </div>
    </main>
  );
};

export default BarberProfilePage;
