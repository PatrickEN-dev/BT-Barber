"use client";

import Image from "next/image";
import { useTransition } from "react";
import { Card, CardContent } from "@/app/_components/ui/card";
import { formatPrice } from "@/app/_utils/formatPrices";
import { toast } from "sonner";
import { toggleBarberService } from "@/app/barber/_actions/services";
import type { listBarberServices } from "@/app/barber/_actions/services";
import { cn } from "@/app/_lib/utils";

type Services = Awaited<ReturnType<typeof listBarberServices>>;

interface IProps {
  services: Services;
  shopId: string;
}

const ServicesList = ({ services, shopId }: IProps) => {
  const [pending, startTransition] = useTransition();

  const onToggle = (serviceId: string) => {
    startTransition(async () => {
      try {
        await toggleBarberService(shopId, serviceId);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
      }
    });
  };

  return (
    <ul className="flex flex-col gap-2">
      {services.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => onToggle(s.id)}
            disabled={pending}
            className="block w-full text-left disabled:opacity-60"
          >
            <Card
              className={cn(
                "transition-colors",
                s.enabled ? "border-primary/40 bg-primary/[0.04]" : ""
              )}
            >
              <CardContent className="p-3 flex gap-3 items-center">
                <div className="relative h-14 w-14 rounded-md overflow-hidden bg-secondary shrink-0">
                  {s.imageUrl && (
                    <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{s.description}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(s.price)}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 relative inline-flex h-6 w-11 rounded-full transition-colors",
                    s.enabled ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
                      s.enabled ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </span>
              </CardContent>
            </Card>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ServicesList;
