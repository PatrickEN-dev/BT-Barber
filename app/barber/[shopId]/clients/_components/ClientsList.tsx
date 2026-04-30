import Link from "next/link";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { CrownIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { listBarberClients } from "@/app/barber/_actions/clients";

type Clients = Awaited<ReturnType<typeof listBarberClients>>["clients"];

interface IProps {
  clients: Clients;
  shopId: string;
}

const ClientsList = ({ clients, shopId }: IProps) => (
  <ul className="flex flex-col gap-2">
    {clients.map(({ user, bookingsCount, lastBookingAt, isVip }) => {
      const initials = (user.name ?? "U")
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      return (
        <li key={user.id}>
          <Link href={`/barber/${shopId}/clients/${user.id}`}>
            <Card className="hover:bg-accent/40 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{user.name ?? "Cliente"}</p>
                    {isVip && (
                      <Badge className="shrink-0 px-1.5 py-0 h-4 text-[9px] bg-amber-500/15 text-amber-400 border-transparent">
                        <CrownIcon size={9} className="mr-0.5" />
                        VIP
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary leading-none tabular-nums">
                    {bookingsCount}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {lastBookingAt
                      ? format(lastBookingAt, "dd/MM/yy", { locale: ptBR })
                      : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </li>
      );
    })}
  </ul>
);

export default ClientsList;
