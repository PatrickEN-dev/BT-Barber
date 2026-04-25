"use client";

import BarberShopServiceCard from "./ServiceCard";
import type { SerializedService } from "@/app/_lib/serializers";

interface IBarbershopServiceCardListProps {
  services: SerializedService[];
}

const BarbershopServiceCardList = ({ services }: IBarbershopServiceCardListProps) => {
  if (services.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-gray-400 text-sm">
        Este barbeiro ainda não tem serviços cadastrados.
      </div>
    );
  }

  return (
    <ul className="px-5 flex flex-col gap-3 py-6">
      {services.map((service) => (
        <BarberShopServiceCard service={service} key={service.id} />
      ))}
    </ul>
  );
};

export default BarbershopServiceCardList;
