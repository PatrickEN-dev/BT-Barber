"use client";

import { CheckIcon } from "lucide-react";
import Image from "next/image";

import { cn } from "@/app/_lib/utils";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { SerializedService } from "@/app/_lib/serializers";

import useBarbershopServices from "../../_ServiceComponent/model";

interface IServiceCardProps {
  service: SerializedService;
}

const BarberShopServiceCard = ({ service }: IServiceCardProps) => {
  const { isServiceSelected, toggleService } = useBarbershopServices();
  const checked = isServiceSelected(service.id);

  const handleToggle = () => toggleService(service);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`${service.name} — ${checked ? "selecionado" : "selecionar"}`}
      onClick={handleToggle}
      className={cn(
        "group/service relative w-full overflow-hidden rounded-2xl border bg-card p-3 text-left transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]",
        checked
          ? "border-accent shadow-glow ring-1 ring-accent/40"
          : "border-border shadow-card hover:border-accent/50 hover:shadow-card-hover"
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent transition-opacity duration-300 ease-smooth",
          checked ? "opacity-100" : "opacity-0"
        )}
      />

      <div className="relative flex w-full items-center gap-4">
        <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-xl">
          <Image
            className="object-cover transition-transform duration-500 ease-smooth group-hover/service:scale-105"
            src={service.imageUrl}
            fill
            alt={service.name}
            sizes="110px"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-base font-bold tracking-tight">{service.name}</h2>

            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ease-smooth",
                checked
                  ? "scale-100 border-accent bg-accent text-accent-foreground"
                  : "scale-95 border-border bg-card group-hover/service:border-accent/50"
              )}
            >
              <CheckIcon
                size={14}
                strokeWidth={3}
                className={cn(
                  "transition-all duration-300 ease-smooth",
                  checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
                )}
              />
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{service.description}</p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p
              className={cn(
                "text-sm font-bold transition-colors duration-300",
                checked ? "text-accent" : "text-primary"
              )}
            >
              {formatPrice(String(service.price))}
            </p>
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider transition-colors duration-300",
                checked ? "text-accent" : "text-muted-foreground"
              )}
            >
              {checked ? "Selecionado" : "Toque para selecionar"}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default BarberShopServiceCard;
