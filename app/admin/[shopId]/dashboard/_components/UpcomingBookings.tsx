import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { getDashboardMetrics } from "@/app/admin/_actions/dashboard";

type Bookings = Awaited<ReturnType<typeof getDashboardMetrics>>["upcoming"];

interface IProps {
  bookings: Bookings;
  shopId: string;
}

const formatWhen = (date: Date) => {
  const time = format(date, "HH:mm", { locale: ptBR });
  if (isToday(date)) return `Hoje · ${time}`;
  if (isTomorrow(date)) return `Amanhã · ${time}`;
  return format(date, "dd MMM · HH:mm", { locale: ptBR });
};

const UpcomingBookings = ({ bookings }: IProps) => (
  <ul className="flex flex-col gap-2">
    {bookings.map((b) => {
      const services = b.services.map((s) => s.service.name).join(", ");
      const initials = (b.user.name ?? "U")
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      return (
        <li key={b.id}>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={b.user.image ?? ""} alt={b.user.name ?? ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {b.user.name ?? "Cliente"}
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {services || "—"} · {b.barber.name}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary shrink-0 text-right leading-tight tabular-nums">
                {formatWhen(b.date)}
              </span>
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);

export default UpcomingBookings;
