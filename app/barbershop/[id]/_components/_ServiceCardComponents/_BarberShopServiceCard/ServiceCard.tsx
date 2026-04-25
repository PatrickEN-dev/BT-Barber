"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { formatPrice } from "@/app/_utils/formatPrices";
import Image from "next/image";
import { Checkbox } from "@/app/_components/ui/checkbox";
import useBarbershopServices from "../../_ServiceComponent/model";
import type { SerializedService } from "@/app/_lib/serializers";

interface IServiceCardProps {
  service: SerializedService;
}

const BarberShopServiceCard = ({ service }: IServiceCardProps) => {
  const { isServiceSelected, toggleService } = useBarbershopServices();
  const checked = isServiceSelected(service.id);

  return (
    <Card>
      <CardContent className="p-3 w-full">
        <div className="flex gap-4 items-center w-full">
          <div className="relative min-h-[110px] min-w-[110px] max-h-[110px] max-w-[110px]">
            <Image
              className="rounded-lg object-contain"
              src={service.imageUrl}
              fill
              alt={service.name}
              sizes="100vw"
            />
          </div>

          <div className="flex flex-col w-full">
            <h2 className="font-bold">{service.name}</h2>
            <p className="text-sm text-gray-400">{service.description}</p>

            <section className="flex items-center justify-between mt-3">
              <p className="text-primary text-sm font-bold">{formatPrice(String(service.price))}</p>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
                <Checkbox
                  id={`service-${service.id}`}
                  checked={checked}
                  onCheckedChange={() => toggleService(service)}
                />
                <span>{checked ? "Selecionado" : "Selecionar"}</span>
              </label>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarberShopServiceCard;
