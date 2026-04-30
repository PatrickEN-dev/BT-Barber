import { Card, CardContent } from "@/app/_components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DeleteBlockButton from "./DeleteBlockButton";
import type { BarberBlock } from "@prisma/client";

interface IProps {
  blocks: BarberBlock[];
  shopId: string;
}

const BlocksList = ({ blocks, shopId }: IProps) => (
  <ul className="flex flex-col gap-2">
    {blocks.map((b) => {
      const sameDay = b.startAt.toDateString() === b.endAt.toDateString();
      return (
        <li key={b.id}>
          <Card>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tabular-nums leading-tight">
                  {sameDay
                    ? `${format(b.startAt, "dd MMM", { locale: ptBR })} · ${format(b.startAt, "HH:mm")} – ${format(b.endAt, "HH:mm")}`
                    : `${format(b.startAt, "dd MMM HH:mm", { locale: ptBR })} → ${format(b.endAt, "dd MMM HH:mm", { locale: ptBR })}`}
                </p>
                {b.reason && (
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{b.reason}</p>
                )}
              </div>
              <DeleteBlockButton shopId={shopId} blockId={b.id} />
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);

export default BlocksList;
