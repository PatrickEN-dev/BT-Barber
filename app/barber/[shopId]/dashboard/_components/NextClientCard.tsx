import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClockIcon, HistoryIcon } from "lucide-react";

interface IProps {
  booking: {
    id: string;
    date: Date;
    user: { name: string | null; image: string | null };
    services: { service: { name: string } }[];
  };
  lastVisit: { date: Date; services: string[] } | null;
}

const formatWhen = (date: Date) => {
  const time = format(date, "HH:mm");
  if (isToday(date)) return `Hoje · ${time}`;
  if (isTomorrow(date)) return `Amanhã · ${time}`;
  return format(date, "dd MMM · HH:mm", { locale: ptBR });
};

const NextClientCard = ({ booking, lastVisit }: IProps) => {
  const initials = (booking.user.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const services = booking.services.map((s) => s.service.name).join(", ");

  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={booking.user.image ?? ""} alt={booking.user.name ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{booking.user.name ?? "Cliente"}</p>
            <p className="text-[11px] text-gray-400 truncate">{services}</p>
          </div>
          <Badge className="shrink-0 tabular-nums">
            <ClockIcon size={11} className="mr-1" />
            {formatWhen(booking.date)}
          </Badge>
        </div>

        {lastVisit && (
          <div className="flex items-start gap-2 border-t border-secondary/50 pt-3">
            <HistoryIcon size={13} className="text-gray-500 mt-0.5 shrink-0" />
            <div className="text-[11px] text-gray-400 leading-snug">
              <span className="text-gray-500">Última visita: </span>
              <span className="text-foreground font-medium">
                {formatDistanceToNow(lastVisit.date, { addSuffix: true, locale: ptBR })}
              </span>
              {lastVisit.services.length > 0 && (
                <span className="text-gray-500"> · {lastVisit.services.join(", ")}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NextClientCard;
