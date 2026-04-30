import {
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarRangeIcon,
  ChevronRightIcon,
  DollarSignIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getDashboardMetrics } from "@/app/admin/_actions/dashboard";
import { formatPrice } from "@/app/_utils/formatPrices";
import { Card, CardContent } from "@/app/_components/ui/card";
import StatCard from "../_components/StatCard";
import EmptyState from "../_components/EmptyState";
import UpcomingBookings from "./_components/UpcomingBookings";
import RevenueChart from "./_components/RevenueChart";
import BarbersChart from "./_components/BarbersChart";
import TodayAgenda from "./_components/TodayAgenda";
import TopBarber from "./_components/TopBarber";

const greetingFor = (hour: number) => {
  if (hour < 5) return "Boa madrugada";
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const SectionHeading = ({
  title,
  hint,
  href,
  hrefLabel,
}: {
  title: string;
  hint?: string;
  href?: string;
  hrefLabel?: string;
}) => (
  <div className="flex items-baseline justify-between mb-2">
    <div className="flex items-baseline gap-2">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
    </div>
    {href && (
      <Link
        href={href}
        className="text-[11px] text-gray-400 hover:text-primary inline-flex items-center transition-colors"
      >
        {hrefLabel ?? "Ver tudo"}
        <ChevronRightIcon size={12} className="ml-0.5" />
      </Link>
    )}
  </div>
);

const DashboardPage = async ({ params }: { params: { shopId: string } }) => {
  const [metrics, session] = await Promise.all([
    getDashboardMetrics(params.shopId),
    getServerSession(authOptions),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const greeting = greetingFor(new Date().getHours());
  const topBarber = metrics.bookingsByBarber[0];

  return (
    <main>
      <section className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-secondary shrink-0 ring-1 ring-secondary">
            {metrics.shop.imageUrl && (
              <Image
                src={metrics.shop.imageUrl}
                alt={metrics.shop.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 font-semibold">
              {format(new Date(), "EEE, dd 'de' MMM", { locale: ptBR })}
            </p>
            <h1 className="text-base font-bold leading-tight truncate">
              {greeting}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-[11px] text-gray-500 truncate">{metrics.shop.name}</p>
          </div>
        </div>
      </section>

      <section className="px-5 grid grid-cols-2 gap-3">
        <StatCard
          label="Hoje"
          value={metrics.todayCount}
          hint="agendamentos"
          icon={CalendarCheckIcon}
          tone="primary"
          trend={metrics.todayDelta}
        />
        <StatCard
          label="Próx. 7 dias"
          value={metrics.next7Count}
          hint="confirmados"
          icon={CalendarRangeIcon}
          tone="sky"
          trend={metrics.next7Delta}
        />
        <StatCard
          label="Receita 7d"
          value={formatPrice(metrics.revenueLast7)}
          hint={`${metrics.finishedLast7Count} concluídos`}
          icon={DollarSignIcon}
          tone="emerald"
          trend={metrics.revenueDelta}
        />
        <StatCard
          label="Ticket médio"
          value={formatPrice(metrics.avgTicket)}
          hint="por agendamento"
          icon={TrendingUpIcon}
          tone="amber"
          trend={metrics.ticketDelta}
        />
      </section>

      <section className="px-5 mt-7">
        <SectionHeading
          title="Agenda de hoje"
          href={`/admin/${params.shopId}/bookings?status=upcoming`}
          hrefLabel="Ver agenda"
        />
        <TodayAgenda bookings={metrics.todaysAgenda} />
      </section>

      <section className="px-5 mt-7">
        <SectionHeading title="Receita" hint="últimos 7 dias" />
        <Card>
          <CardContent className="p-4">
            <RevenueChart data={metrics.revenueByDay} />
          </CardContent>
        </Card>
      </section>

      <section className="px-5 mt-7">
        <SectionHeading
          title="Performance da equipe"
          hint="últimos 7 dias"
          href={`/admin/${params.shopId}/barbers`}
        />
        {topBarber && <div className="mb-3"><TopBarber barber={topBarber} /></div>}
        <Card>
          <CardContent className="p-4">
            <BarbersChart data={metrics.bookingsByBarber} />
          </CardContent>
        </Card>
      </section>

      <section className="px-5 mt-7 grid grid-cols-2 gap-3">
        <StatCard label="Clientes" value={metrics.totalClients} hint="únicos no histórico" icon={UsersIcon} />
        <StatCard
          label="Atendimentos"
          value={metrics.finishedTotal}
          hint="histórico total"
          icon={CalendarCheckIcon}
        />
      </section>

      <section className="px-5 mt-7">
        <SectionHeading
          title="Próximos agendamentos"
          href={`/admin/${params.shopId}/bookings`}
        />
        {metrics.upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarClockIcon}
            title="Sem agendamentos próximos"
            description="Quando seus clientes agendarem, eles aparecerão aqui."
          />
        ) : (
          <UpcomingBookings bookings={metrics.upcoming} shopId={params.shopId} />
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
