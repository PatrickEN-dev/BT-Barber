import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Card, CardContent } from "@/app/_components/ui/card";
import { TrophyIcon } from "lucide-react";

interface IProps {
  barber: {
    name: string;
    imageUrl: string | null;
    count: number;
    share: number;
  };
}

const TopBarber = ({ barber }: IProps) => {
  const initials = barber.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={barber.imageUrl ?? ""} alt={barber.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <TrophyIcon size={11} className="text-amber-400 shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.08em] text-amber-400 font-semibold">
              Top da semana
            </span>
          </div>
          <p className="text-sm font-bold truncate mt-0.5">{barber.name}</p>
          <p className="text-[11px] text-gray-400">
            {barber.count} agendamentos · {Math.round(barber.share)}% do total
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopBarber;
