import { CalendarClockIcon } from "lucide-react";
import Container from "@/app/_components/Container";
import { db } from "@/app/_lib/prisma";
import { listShopBookings, type BookingStatus, type BookingRange } from "@/app/admin/_actions/bookings";
import PageHeading from "../_components/PageHeading";
import EmptyState from "../_components/EmptyState";
import Pagination from "../_components/Pagination";
import BookingsList from "./_components/BookingsList";
import BookingFilters from "./_components/BookingFilters";

interface IProps {
  params: { shopId: string };
  searchParams?: { page?: string; status?: string; barberId?: string; range?: string };
}

const isStatus = (s?: string): s is BookingStatus =>
  s === "upcoming" || s === "past" || s === "all";

const isRange = (s?: string): s is BookingRange =>
  s === "today" || s === "tomorrow" || s === "week" || s === "month" || s === "any";

const ShopBookingsPage = async ({ params, searchParams }: IProps) => {
  const status: BookingStatus = isStatus(searchParams?.status) ? searchParams!.status : "upcoming";
  const range: BookingRange = isRange(searchParams?.range) ? searchParams!.range : "any";
  const barberId = searchParams?.barberId || undefined;
  const page = Number(searchParams?.page ?? 1) || 1;

  const [data, barbers] = await Promise.all([
    listShopBookings({ shopId: params.shopId, page, status, barberId, range }),
    db.barber.findMany({
      where: { barbershopId: params.shopId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main>
      <PageHeading
        title="Agenda"
        description={`${data.total} ${data.total === 1 ? "agendamento" : "agendamentos"}`}
      />

      <Container className="space-y-4 pb-8">
        <BookingFilters
          shopId={params.shopId}
          status={status}
          barberId={barberId}
          range={range}
          barbers={barbers}
        />

        {data.bookings.length === 0 ? (
          <EmptyState
            icon={CalendarClockIcon}
            title="Sem agendamentos"
            description="Não há agendamentos para os filtros selecionados."
          />
        ) : (
          <BookingsList bookings={data.bookings} shopId={params.shopId} />
        )}

        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          perPage={data.perPage}
          basePath={`/admin/${params.shopId}/bookings`}
          searchParams={{ status, barberId, range: range === "any" ? undefined : range }}
        />
      </Container>
    </main>
  );
};

export default ShopBookingsPage;
