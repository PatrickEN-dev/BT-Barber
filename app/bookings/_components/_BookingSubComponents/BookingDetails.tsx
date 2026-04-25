import { Barbershop, Booking } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPrice } from "@/app/_utils/formatPrices";
import { Card, CardContent } from "@/app/_components/ui/card";
import type { SerializedService } from "@/app/_lib/serializers";

interface BookingInfoProps {
  booking: Partial<Pick<Booking, "date">> & {
    service: Pick<SerializedService, "name" | "price">;
    barbershop: Pick<Barbershop, "name">;
  };
}

const BookingDetails = ({ booking }: BookingInfoProps) => {
  const { service, date } = booking;
  return (
    <Card>
      <CardContent className="p-3 gap-3 flex flex-col">
        <section className="flex justify-between">
          <h2 className="font-bold">{service.name}</h2>
          <h3 className="font-bold text-sm">{formatPrice(String(service.price))}</h3>
        </section>

        {date && (
          <section>
            <div className="flex justify-between">
              <h3 className="text-gray-400 text-sm">Data</h3>
              <h4 className="text-sm">{format(date, "dd 'de' MMMM", { locale: ptBR })}</h4>
            </div>

            <div className="flex justify-between">
              <h3 className="text-gray-400 text-sm">Horário</h3>
              <h4 className="text-sm">{format(date, "hh:mm")}</h4>
            </div>
          </section>
        )}

        <section className="flex justify-between">
          <h3 className="text-gray-400 text-sm">Barbearia</h3>
          <h4 className="text-sm">{booking.barbershop.name}</h4>
        </section>
      </CardContent>
    </Card>
  );
};

export default BookingDetails;
