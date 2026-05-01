import { Barbershop, Booking } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPrice } from "@/app/_utils/formatPrices";
import { Card, CardContent } from "@/app/_components/ui/card";
import type { SerializedService } from "@/app/_lib/serializers";

interface BookingInfoProps {
  booking: Partial<Pick<Booking, "date">> & {
    services: Array<{ service: Pick<SerializedService, "name" | "price"> }>;
    barbershop: Pick<Barbershop, "name">;
    barber?: { name: string } | null;
  };
}

const BookingDetails = ({ booking }: BookingInfoProps) => {
  const { services, date, barber } = booking;
  const total = services.reduce((acc, bs) => acc + Number(bs.service.price), 0);

  return (
    <Card>
      <CardContent className="p-3 gap-3 flex flex-col">
        <section className="flex flex-col gap-1">
          {services.map((bs, idx) => (
            <div key={idx} className="flex justify-between">
              <h2 className="text-sm">{bs.service.name}</h2>
              <h3 className="text-sm">{formatPrice(String(bs.service.price))}</h3>
            </div>
          ))}
          {services.length > 1 && (
            <div className="flex justify-between mt-2 pt-2 border-t border-secondary">
              <span className="font-bold">Total</span>
              <span className="font-bold">{formatPrice(String(total))}</span>
            </div>
          )}
        </section>

        {date && (
          <section>
            <div className="flex justify-between">
              <h3 className="text-muted-foreground text-sm">Data</h3>
              <h4 className="text-sm">{format(date, "dd 'de' MMMM", { locale: ptBR })}</h4>
            </div>

            <div className="flex justify-between">
              <h3 className="text-muted-foreground text-sm">Horário</h3>
              <h4 className="text-sm">{format(date, "HH:mm")}</h4>
            </div>
          </section>
        )}

        <section className="flex justify-between">
          <h3 className="text-muted-foreground text-sm">Barbearia</h3>
          <h4 className="text-sm">{booking.barbershop.name}</h4>
        </section>

        {barber && (
          <section className="flex justify-between">
            <h3 className="text-muted-foreground text-sm">Barbeiro</h3>
            <h4 className="text-sm">{barber.name}</h4>
          </section>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingDetails;
