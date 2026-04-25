"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Shuffle } from "lucide-react";
import useBarbershopServices from "../_ServiceComponent/model";
import BarberCard from "./BarberCard";
import type { BarberWithServices } from "../../_actions/findBarbershopWithBarbers";

interface IBarberSelectStepProps {
  shopId: string;
  barbers: BarberWithServices[];
}

const BarberSelectStep = ({ shopId, barbers }: IBarberSelectStepProps) => {
  const { selectBarber } = useBarbershopServices();

  const handleSelect = (barber: BarberWithServices) => selectBarber(barber);

  const handleRandom = () => {
    if (barbers.length === 0) return;
    const random = barbers[Math.floor(Math.random() * barbers.length)];
    selectBarber(random);
  };

  if (barbers.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-gray-400">
        Esta barbearia ainda não tem barbeiros cadastrados.
      </div>
    );
  }

  return (
    <section className="px-5 py-6">
      <h2 className="text-xs uppercase text-gray-400 font-bold mb-3">Escolha um barbeiro</h2>

      <div className="flex flex-col gap-3">
        <Card
          role="button"
          tabIndex={0}
          onClick={handleRandom}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleRandom();
            }
          }}
          className="cursor-pointer border-dashed transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none"
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Shuffle className="text-primary" size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold">Qualquer barbeiro</h3>
              <span className="text-xs text-gray-400">Escolhemos um disponível para você</span>
            </div>
          </CardContent>
        </Card>

        {barbers.map((barber) => (
          <BarberCard key={barber.id} barber={barber} shopId={shopId} onSelect={handleSelect} />
        ))}
      </div>
    </section>
  );
};

export default BarberSelectStep;
