import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPrice } from "@/app/_utils/formatPrices";
import CancelBookingButton from "./CancelBookingButton";
import NoShowButton from "./NoShowButton";
import type { listShopBookings } from "@/app/admin/_actions/bookings";

type Bookings = Awaited<ReturnType<typeof listShopBookings>>["bookings"];

interface IProps {
  bookings: Bookings;
  shopId: string;
}

const BookingsList = ({ bookings, shopId }: IProps) => (
  <ul className="flex flex-col gap-2">
    {bookings.map((b) => {
      const finished = isPast(b.date);
      const total = b.services.reduce((sum, bs) => sum + Number(bs.service.price), 0);
      const initials = (b.user.name ?? "U")
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      return (
        <li key={b.id}>
          <Card>
            <CardContent className="p-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={b.user.image ?? ""} alt={b.user.name ?? ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{b.user.name ?? "Cliente"}</p>
                    <Badge variant={finished ? "secondary" : "default"} className="shrink-0">
                      {finished ? "Finalizado" : "Confirmado"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{b.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs border-t border-secondary pt-2">
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Data</p>
                  <p className="font-medium">{format(b.date, "dd/MM HH:mm", { locale: ptBR })}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Barbeiro</p>
                  <p className="font-medium truncate">{b.barber.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-gray-500">Total</p>
                  <p className="font-semibold text-primary">{formatPrice(total)}</p>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 truncate">
                {b.services.map((s) => s.service.name).join(" • ")}
              </p>

              {!finished && (
                <CancelBookingButton shopId={shopId} bookingId={b.id} clientName={b.user.name ?? ""} />
              )}
              {finished && (
                <NoShowButton bookingId={b.id} clientName={b.user.name ?? ""} />
              )}
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);

export default BookingsList;
