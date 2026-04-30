import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { StarIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";
import type { getTeamComparison } from "@/app/barber/_actions/team";

type Barbers = Awaited<ReturnType<typeof getTeamComparison>>["barbers"];

interface IProps {
  barbers: Barbers;
  myId: string;
}

const TeamList = ({ barbers, myId }: IProps) => (
  <ul className="flex flex-col gap-2">
    {barbers.map((b, idx) => {
      const initials = b.name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      const isLeader = idx === 0 && b.last7Bookings > 0;
      const isMe = b.id === myId;
      return (
        <li key={b.id}>
          <Card
            className={cn(
              "transition-colors",
              isMe ? "border-primary/40 bg-primary/[0.04]" : ""
            )}
          >
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 tabular-nums w-5 shrink-0 text-center">
                  {idx + 1}
                </span>
                <Avatar className="h-11 w-11">
                  <AvatarImage src={b.imageUrl ?? ""} alt={b.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{b.name}</p>
                    {isMe && (
                      <Badge className="px-1.5 py-0 h-4 text-[9px] shrink-0">você</Badge>
                    )}
                    {isLeader && !isMe && (
                      <Badge className="px-1.5 py-0 h-4 text-[9px] bg-amber-500/15 text-amber-400 border-transparent">
                        top
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarIcon size={11} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[11px] text-gray-400 tabular-nums">
                      {(b.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-secondary pt-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase text-gray-500 tracking-wide">7 dias</p>
                  <p className="font-bold tabular-nums">{b.last7Bookings}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-gray-500 tracking-wide">Clientes</p>
                  <p className="font-bold tabular-nums">{b.clientsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);

export default TeamList;
