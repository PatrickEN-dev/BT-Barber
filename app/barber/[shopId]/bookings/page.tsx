import { CalendarClockIcon } from "lucide-react";
import {
  listBarberBookings,
  type BarberBookingStatus,
  type BarberBookingRange,
} from "@/app/barber/_actions/bookings";
import PageHeading from "@/app/admin/[shopId]/_components/PageHeading";
import EmptyState from "@/app/admin/[shopId]/_components/EmptyState";
import Pagination from "@/app/admin/[shopId]/_components/Pagination";
import BookingsList from "./_components/BookingsList";
import BookingFilters from "./_components/BookingFilters";

interface IProps {
  params: { shopId: string };
  searchParams?: { page?: string; status?: string; range?: string };
}

const isStatus = (s?: string): s is BarberBookingStatus =>
  s === "upcoming" || s === "past" || s === "all";

const isRange = (s?: string): s is BarberBookingRange =>
  s === "today" || s === "tomorrow" || s === "week" || s === "month" || s === "any";

const BarberBookingsPage = async ({ params, searchParams }: IProps) => {
  const status: BarberBookingStatus = isStatus(searchParams?.status)
    ? searchParams!.status
    : "upcoming";
  const range: BarberBookingRange = isRange(searchParams?.range) ? searchParams!.range : "any";
  const page = Number(searchParams?.page ?? 1) || 1;

  const data = await listBarberBookings({ shopId: params.shopId, page, status, range });

  return (
    <main>
      <PageHeading
        title="Minha agenda"
        description={`${data.total} ${data.total === 1 ? "agendamento" : "agendamentos"}`}
      />

      <div className="px-5">
        <BookingFilters shopId={params.shopId} status={status} range={range} />
      </div>

      <section className="px-5 mt-4">
        {data.bookings.length === 0 ? (
          <EmptyState
            icon={CalendarClockIcon}
            title="Sem agendamentos"
            description="Não há agendamentos para os filtros selecionados."
          />
        ) : (
          <BookingsList bookings={data.bookings} shopId={params.shopId} />
        )}
      </section>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        perPage={data.perPage}
        basePath={`/barber/${params.shopId}/bookings`}
        searchParams={{ status, range: range === "any" ? undefined : range }}
      />
    </main>
  );
};

export default BarberBookingsPage;
