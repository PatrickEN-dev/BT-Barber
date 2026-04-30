import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { format, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarXIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";
import type { getDashboardMetrics } from "@/app/admin/_actions/dashboard";

type Bookings = Awaited<ReturnType<typeof getDashboardMetrics>>["todaysAgenda"];

interface IProps {
  bookings: Bookings;
}

const TodayAgenda = ({ bookings }: IProps) => {
  if (bookings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 px-5 flex flex-col items-center text-center gap-2">
          <CalendarXIcon size={22} className="text-gray-500" />
          <p className="text-sm font-medium">Hoje sem agendamentos</p>
          <p className="text-[11px] text-gray-500 max-w-[220px]">
            Aproveite pra revisar serviços e equipe.
          </p>
        </CardContent>
      </Card>
    );
  }

  const finishedCount = bookings.filter((b) => isPast(b.date)).length;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-3 flex items-baseline justify-between border-b border-secondary/50">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight tabular-nums">{bookings.length}</span>
            <span className="text-[11px] text-gray-400">no total</span>
          </div>
          <span className="text-[11px] text-gray-500">
            {finishedCount} concluído{finishedCount === 1 ? "" : "s"}
          </span>
        </div>

        <ul className="divide-y divide-secondary/40">
          {bookings.slice(0, 6).map((b) => {
            const past = isPast(b.date);
            const initials = (b.user.name ?? "U")
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase();
            return (
              <li key={b.id} className="px-4 py-2.5 flex items-center gap-3">
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums w-12 shrink-0",
                    past ? "text-gray-500" : "text-primary"
                  )}
                >
                  {format(b.date, "HH:mm")}
                </span>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={b.user.image ?? ""} alt={b.user.name ?? ""} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium truncate leading-tight",
                      past && "text-gray-500 line-through"
                    )}
                  >
                    {b.user.name ?? "Cliente"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {b.barber.name}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TodayAgenda;
