import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { listShopClients } from "@/app/admin/_actions/clients";

type Clients = Awaited<ReturnType<typeof listShopClients>>["clients"];

interface IProps {
  clients: Clients;
}

const ClientsList = ({ clients }: IProps) => (
  <ul className="flex flex-col gap-2">
    {clients.map(({ user, bookingsCount, lastBookingAt }) => {
      const initials = (user.name ?? "U")
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      return (
        <li key={user.id}>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.name ?? "Cliente"}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary leading-none">{bookingsCount}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {lastBookingAt
                    ? `Último: ${format(lastBookingAt, "dd/MM/yy", { locale: ptBR })}`
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);

export default ClientsList;
