"use client";

import { Card, CardContent } from "@/app/_components/ui/card";
import { formatPrice } from "@/app/_utils/formatPrices";
import { Barbershop } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import useBarbershopServices from "../_ServiceComponent/model";

interface IServiceCardDetails {
  date: Date | undefined;
  hour: string | undefined;
  barbershop: Barbershop;
}

const ServiceCardDetails = ({ date, hour, barbershop }: IServiceCardDetails) => {
  const { selectedServices, selectedBarber } = useBarbershopServices();

  const formattedDate = date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : undefined;

  const totalServicePrice = selectedServices.reduce(
    (total, service) => total + Number(service.price),
    0
  );

  return (
    <Card>
      <CardContent className="p-3 flex flex-col">
        <section className="flex flex-col mb-2">
          <div className="flex justify-between">
            <h2 className="font-bold">
              {selectedServices.map((service) => (
                <div key={service.id}>{service.name}</div>
              ))}
            </h2>
            <h3 className="font-bold">{formatPrice(String(totalServicePrice))}</h3>
          </div>

          {date && (
            <section className="flex justify-between mt-4">
              <h3 className="text-gray-400 text-sm">Data</h3>
              <time className="text-gray-400 text-sm capitalize">{formattedDate}</time>
            </section>
          )}

          {hour && (
            <section className="flex justify-between mt-4">
              <h3 className="text-gray-400 text-sm">Hora</h3>
              <time className="text-gray-400 text-sm capitalize">{hour}</time>
            </section>
          )}

          <section className="flex justify-between mt-4">
            <h3 className="text-gray-400 text-sm">Barbearia</h3>
            <h4 className="text-gray-400 text-sm capitalize">{barbershop.name}</h4>
          </section>

          {selectedBarber && (
            <section className="flex justify-between mt-4">
              <h3 className="text-gray-400 text-sm">Barbeiro</h3>
              <h4 className="text-gray-400 text-sm">{selectedBarber.name}</h4>
            </section>
          )}
        </section>
      </CardContent>
    </Card>
  );
};

export default ServiceCardDetails;
