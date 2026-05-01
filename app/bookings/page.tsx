import { CalendarCheckIcon, HistoryIcon } from "lucide-react";
import { getServerSession } from "next-auth";

import Container from "../_components/Container";
import Header from "../_components/Header";
import ErrorPage from "../_components/errors/ErrorPage";
import { findConfirmedBookings, findFinishedBookings } from "../_actions/booking";
import { authOptions } from "../_lib/auth";
import { requireCustomer } from "../_utils/redirectIfOwner";
import BookingList from "./_components/BookingsList";
import NoBookingsMessage from "./_components/NotFoundBookings";

const BookingsPage = async () => {
  await requireCustomer();
  const session = await getServerSession(authOptions);

  const userId = session!.user.id;

  try {
    const [confirmedBookings, finishedBookings] = await Promise.all([
      findConfirmedBookings(userId),
      findFinishedBookings(userId),
    ]);

    if (!confirmedBookings.length && !finishedBookings.length) {
      return <NoBookingsMessage reset={() => {}} />;
    }

    return (
      <main className="pb-24">
        <Header />

        <Container className="py-6 lg:py-10">
          <header className="mb-8 animate-slide-up lg:mb-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Sua agenda
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl xl:text-4xl">
              Agendamentos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {confirmedBookings.length} confirmado{confirmedBookings.length === 1 ? "" : "s"} ·{" "}
              {finishedBookings.length} finalizado{finishedBookings.length === 1 ? "" : "s"}
            </p>
          </header>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-12">
            <section
              className="min-w-0 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <header className="mb-4 flex items-center gap-2">
                <CalendarCheckIcon size={16} className="text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Confirmados
                </h2>
                <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
                  {confirmedBookings.length}
                </span>
              </header>
              {confirmedBookings.length > 0 ? (
                <BookingList bookings={confirmedBookings} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma reserva confirmada no momento.
                  </p>
                </div>
              )}
            </section>

            <section
              className="min-w-0 animate-slide-up"
              style={{ animationDelay: "180ms" }}
            >
              <header className="mb-4 flex items-center gap-2">
                <HistoryIcon size={16} className="text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Finalizados
                </h2>
                <span className="ml-auto text-xs font-semibold text-muted-foreground tabular-nums">
                  {finishedBookings.length}
                </span>
              </header>
              {finishedBookings.length > 0 ? (
                <BookingList bookings={finishedBookings} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">Nenhum atendimento concluído.</p>
                </div>
              )}
            </section>
          </div>
        </Container>
      </main>
    );
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return <ErrorPage />;
  }
};

export default BookingsPage;
