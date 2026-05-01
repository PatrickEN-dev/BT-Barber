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

import Container from "@/app/_components/Container";
import { Card, CardContent } from "@/app/_components/ui/card";
import { authOptions } from "@/app/_lib/auth";
import { formatPrice } from "@/app/_utils/formatPrices";
import { getDashboardMetrics } from "@/app/admin/_actions/dashboard";

import StatCard from "../_components/StatCard";
import EmptyState from "../_components/EmptyState";
import BarbersChart from "./_components/BarbersChart";
import RevenueChart from "./_components/RevenueChart";
import TodayAgenda from "./_components/TodayAgenda";
import TopBarber from "./_components/TopBarber";
import UpcomingBookings from "./_components/UpcomingBookings";

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
  <div className="mb-3 flex items-baseline justify-between">
    <div className="flex items-baseline gap-2">
      <h2 className="text-sm font-semibold tracking-tight lg:text-base">{title}</h2>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
    {href && (
      <Link
        href={href}
        className="inline-flex items-center text-[11px] text-muted-foreground transition-colors hover:text-accent"
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
      <Container className="pt-5 lg:pt-8">
        {/* Greeting */}
        <section className="mb-6 flex items-center gap-3 lg:gap-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-secondary ring-1 ring-secondary lg:h-16 lg:w-16">
            {metrics.shop.imageUrl && (
              <Image
                src={metrics.shop.imageUrl}
                alt={metrics.shop.name}
                fill
                sizes="(max-width: 1024px) 48px, 64px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground lg:text-xs lg:tracking-[0.18em]">
              {format(new Date(), "EEE, dd 'de' MMM", { locale: ptBR })}
            </p>
            <h1 className="truncate text-base font-bold leading-tight tracking-tight lg:text-2xl xl:text-3xl">
              {greeting}
              {firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground lg:mt-0.5 lg:text-sm">
              {metrics.shop.name}
            </p>
          </div>
        </section>

        {/* Top stats: 2 cols mobile, 4 cols lg */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
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

        {/* Main 2-col grid on desktop */}
        <div className="mt-7 grid gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          {/* Agenda de hoje */}
          <section className="min-w-0">
            <SectionHeading
              title="Agenda de hoje"
              href={`/admin/${params.shopId}/bookings?status=upcoming`}
              hrefLabel="Ver agenda"
            />
            <TodayAgenda bookings={metrics.todaysAgenda} />
          </section>

          {/* Receita */}
          <section className="min-w-0">
            <SectionHeading title="Receita" hint="últimos 7 dias" />
            <Card>
              <CardContent className="p-4 lg:p-5">
                <RevenueChart data={metrics.revenueByDay} />
              </CardContent>
            </Card>
          </section>

          {/* Performance da equipe */}
          <section className="min-w-0">
            <SectionHeading
              title="Performance da equipe"
              hint="últimos 7 dias"
              href={`/admin/${params.shopId}/barbers`}
            />
            {topBarber && (
              <div className="mb-3">
                <TopBarber barber={topBarber} />
              </div>
            )}
            <Card>
              <CardContent className="p-4 lg:p-5">
                <BarbersChart data={metrics.bookingsByBarber} />
              </CardContent>
            </Card>
          </section>

          {/* Próximos agendamentos */}
          <section className="min-w-0">
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
        </div>

        {/* Footer stats */}
        <section className="mt-7 grid grid-cols-2 gap-3 lg:mt-10 lg:gap-4">
          <StatCard
            label="Clientes"
            value={metrics.totalClients}
            hint="únicos no histórico"
            icon={UsersIcon}
          />
          <StatCard
            label="Atendimentos"
            value={metrics.finishedTotal}
            hint="histórico total"
            icon={CalendarCheckIcon}
          />
        </section>
      </Container>
    </main>
  );
};

export default DashboardPage;
