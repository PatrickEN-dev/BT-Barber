import {
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarRangeIcon,
  DollarSignIcon,
  TrophyIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBarberDashboard } from "@/app/barber/_actions/dashboard";
import { formatPrice } from "@/app/_utils/formatPrices";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import StatCard from "@/app/admin/[shopId]/_components/StatCard";
import EmptyState from "@/app/admin/[shopId]/_components/EmptyState";
import TodayAgenda from "@/app/admin/[shopId]/dashboard/_components/TodayAgenda";
import NextClientCard from "./_components/NextClientCard";

const greetingFor = (hour: number) => {
  if (hour < 5) return "Boa madrugada";
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const BarberDashboardPage = async ({ params }: { params: { shopId: string } }) => {
  const data = await getBarberDashboard(params.shopId);

  const greeting = greetingFor(new Date().getHours());
  const initials = data.barber.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <main>
      <section className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-1 ring-secondary">
            <AvatarImage src={data.barber.imageUrl ?? ""} alt={data.barber.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 font-semibold">
              {format(new Date(), "EEE, dd 'de' MMM", { locale: ptBR })}
            </p>
            <h1 className="text-base font-bold leading-tight truncate">
              {greeting}, {data.barber.name.split(" ")[0]}
            </h1>
            <p className="text-[11px] text-gray-500 truncate">{data.shop.name}</p>
          </div>
        </div>
      </section>

      <section className="px-5 grid grid-cols-2 gap-3">
        <StatCard
          label="Hoje"
          value={data.todayCount}
          hint="agendamentos seus"
          icon={CalendarCheckIcon}
          tone="primary"
          trend={data.todayDelta}
        />
        <StatCard
          label="Próx. 7 dias"
          value={data.next7Count}
          hint="confirmados"
          icon={CalendarRangeIcon}
          tone="sky"
          trend={data.next7Delta}
        />
        <StatCard
          label="Receita 7d"
          value={formatPrice(data.revenueLast7)}
          hint={`${data.finishedLast7Count} concluídos`}
          icon={DollarSignIcon}
          tone="emerald"
          trend={data.revenueDelta}
        />
        <StatCard
          label="Posição na equipe"
          value={data.teamRank ? `#${data.teamRank}` : "—"}
          hint={data.teamSize > 0 ? `de ${data.teamSize} barbeiros (7d)` : "sem dados"}
          icon={TrophyIcon}
          tone="amber"
        />
      </section>

      {data.nextBooking && (
        <section className="px-5 mt-7">
          <h2 className="text-sm font-semibold tracking-tight mb-2">Próximo cliente</h2>
          <NextClientCard
            booking={data.nextBooking}
            lastVisit={data.lastVisitOfNext}
          />
        </section>
      )}

      <section className="px-5 mt-7">
        <h2 className="text-sm font-semibold tracking-tight mb-2">Agenda de hoje</h2>
        <TodayAgenda bookings={data.todaysAgenda} />
      </section>

      {!data.nextBooking && data.todayCount === 0 && (
        <section className="px-5 mt-7">
          <EmptyState
            icon={CalendarClockIcon}
            title="Sem agendamentos próximos"
            description="Aproveite pra revisar serviços e bloqueios."
          />
        </section>
      )}
    </main>
  );
};

export default BarberDashboardPage;
