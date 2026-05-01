"use client";

import { Shuffle } from "lucide-react";

import Container from "@/app/_components/Container";
import { Card, CardContent } from "@/app/_components/ui/card";

import BarberCard from "./BarberCard";
import useBarbershopServices from "../_ServiceComponent/model";
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
      <Container as="section" className="py-10 text-center text-muted-foreground">
        Esta barbearia ainda não tem barbeiros cadastrados.
      </Container>
    );
  }

  return (
    <Container as="section" className="py-6 lg:py-10">
      <h2 className="mb-4 text-xs uppercase text-muted-foreground font-bold tracking-wider lg:text-sm">
        Escolha um barbeiro
      </h2>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
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
          className="cursor-pointer border-dashed transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover focus-visible:border-accent focus-visible:outline-none"
        >
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
              <Shuffle className="text-white" size={22} />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold tracking-tight">Qualquer barbeiro</h3>
              <span className="text-xs text-muted-foreground">
                Escolhemos um disponível para você
              </span>
            </div>
          </CardContent>
        </Card>

        {barbers.map((barber) => (
          <BarberCard key={barber.id} barber={barber} shopId={shopId} onSelect={handleSelect} />
        ))}
      </div>
    </Container>
  );
};

export default BarberSelectStep;
