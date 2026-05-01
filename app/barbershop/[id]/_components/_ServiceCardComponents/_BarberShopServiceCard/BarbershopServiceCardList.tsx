"use client";

import BarberShopServiceCard from "./ServiceCard";
import type { SerializedService } from "@/app/_lib/serializers";

interface IBarbershopServiceCardListProps {
  services: SerializedService[];
}

const BarbershopServiceCardList = ({ services }: IBarbershopServiceCardListProps) => {
  if (services.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground text-sm">
        Este barbeiro ainda não tem serviços cadastrados.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 py-2">
      {services.map((service) => (
        <BarberShopServiceCard service={service} key={service.id} />
      ))}
    </ul>
  );
};

export default BarbershopServiceCardList;
