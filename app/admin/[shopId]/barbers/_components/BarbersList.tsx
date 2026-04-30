import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { StarIcon } from "lucide-react";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { listShopBarbers } from "@/app/admin/_actions/barbers";

type Barbers = Awaited<ReturnType<typeof listShopBarbers>>;

interface IProps {
  barbers: Barbers;
}

const BarbersList = ({ barbers }: IProps) => (
  <ul className="flex flex-col gap-2">
    {barbers.map((b) => {
      const initials = b.name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      return (
        <li key={b.id}>
          <Card>
            <CardContent className="p-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={b.imageUrl ?? ""} alt={b.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{b.name}</p>
                  {b.description && (
                    <p className="text-[11px] text-gray-400 truncate">{b.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarIcon size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[11px] text-gray-400">
                      {(b.rating ?? 0).toFixed(1)} • {b.servicesCount} serviços
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-secondary pt-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase text-gray-500">7 dias</p>
                  <p className="font-semibold">{b.last7}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-500">Próximos</p>
                  <p className="font-semibold">{b.upcoming}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-gray-500">Receita 7d</p>
                  <p className="font-semibold text-primary">{formatPrice(b.revenueLast7)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);

export default BarbersList;
