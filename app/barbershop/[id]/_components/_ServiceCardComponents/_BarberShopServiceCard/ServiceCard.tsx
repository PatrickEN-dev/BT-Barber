"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { Sheet } from "@/app/_components/ui/sheet";
import { formatPrice } from "@/app/_utils/formatPrices";
import { Barbershop, Service } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import BookingMenu from "../../_BookingMenu/BookingMenu";
import { Checkbox } from "@/app/_components/ui/checkbox";
import useBarbershopServices from "../../_ServiceComponent/model";

interface IServiceCardProps {
  service: Service;
  barbershop: Barbershop;
}

const BarberShopServiceCard = ({ service, barbershop }: IServiceCardProps) => {
  const { sheetIsOpen, setSheetIsOpen, handleCheckboxChange } = useBarbershopServices();

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

              <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
                <Checkbox
                  onCheckedChange={(isChecked: boolean) => handleCheckboxChange(isChecked, service)}
                />

                <BookingMenu {...{ barbershop }} />
              </Sheet>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarberShopServiceCard;
