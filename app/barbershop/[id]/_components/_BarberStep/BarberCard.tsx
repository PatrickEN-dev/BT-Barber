"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "lucide-react";
import type { BarberWithServices } from "../../_actions/findBarbershopWithBarbers";

interface IBarberCardProps {
  barber: BarberWithServices;
  shopId: string;
  onSelect: (barber: BarberWithServices) => void;
}

const BarberCard = ({ barber, shopId, onSelect }: IBarberCardProps) => {
  const initials = barber.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(barber)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(barber);
        }
      }}
      className="cursor-pointer transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none"
    >
      <CardContent className="p-3 flex gap-3 items-center">
        <div className="relative h-16 w-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
          {barber.imageUrl ? (
            <Image src={barber.imageUrl} alt={barber.name} fill className="object-cover" sizes="64px" />
          ) : (
            <span className="text-sm font-bold">{initials}</span>
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-bold truncate">{barber.name}</h3>
          {typeof barber.rating === "number" && barber.rating > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <StarIcon size={12} className="text-primary" />
              {barber.rating.toFixed(1)}
            </span>
          )}
          <span className="text-xs text-muted-foreground mt-0.5">
            {barber.services.length} {barber.services.length === 1 ? "serviço" : "serviços"}
          </span>
        </div>

        <Link
          href={`/barbershop/${shopId}/barbers/${barber.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-primary hover:underline flex-shrink-0"
        >
          Ver perfil
        </Link>
      </CardContent>
    </Card>
  );
};

export default BarberCard;
