import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, CrownIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBarberClientDetail } from "@/app/barber/_actions/clients";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { formatPrice } from "@/app/_utils/formatPrices";
import NotesPanel from "./_components/NotesPanel";

interface IProps {
  params: { shopId: string; clientId: string };
}

const BarberClientDetailPage = async ({ params }: IProps) => {
  const data = await getBarberClientDetail(params.shopId, params.clientId);
  if (!data) notFound();

  const initials = (data.client.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <main className="pb-12">
      <div className="px-5 py-4">
        <Link
          href={`/barber/${params.shopId}/clients`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary"
        >
          <ChevronLeftIcon size={16} />
          Voltar
        </Link>
      </div>

      <section className="px-5 flex flex-col items-center text-center">
        <Avatar className="h-20 w-20">
          <AvatarImage src={data.client.image ?? ""} alt={data.client.name ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 mt-3">
          <h1 className="text-lg font-bold">{data.client.name ?? "Cliente"}</h1>
          {data.isVip && (
            <Badge className="bg-amber-500/15 text-amber-400 border-transparent">
              <CrownIcon size={11} className="mr-1" />
              VIP
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-400">{data.client.email}</p>
        <p className="text-[11px] text-gray-500 mt-1 tabular-nums">
          {data.bookingsCount} {data.bookingsCount === 1 ? "atendimento" : "atendimentos"} com você
        </p>
      </section>

      <section className="px-5 mt-7">
        <h2 className="text-sm font-semibold tracking-tight mb-2">Notas privadas</h2>
        <NotesPanel
          shopId={params.shopId}
          clientId={params.clientId}
          notes={data.notes}
        />
      </section>

      <section className="px-5 mt-7">
        <h2 className="text-sm font-semibold tracking-tight mb-2">Histórico recente</h2>
        {data.history.length === 0 ? (
          <Card>
            <CardContent className="py-6 px-4 text-center text-xs text-gray-500">
              Sem histórico ainda.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.history.map((h) => {
              const total = h.services.reduce((sum, s) => sum + Number(s.price), 0);
              return (
                <li key={h.id}>
                  <Card>
                    <CardContent className="p-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold tabular-nums">
                          {format(h.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {h.services.map((s) => s.name).join(" · ")}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">
                        {formatPrice(total)}
                      </span>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
};

export default BarberClientDetailPage;
