import Header from "../_components/Header";
import ErrorPage from "../_components/errors/ErrorPage";
import { protectRoute } from "../_utils/protectRoute";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";
import { findConfirmedBookings, findFinishedBookings } from "../_actions/booking";
import BookingList from "./_components/BookingsList";
import NoBookingsMessage from "./_components/NotFoundBookings";

const BookingsPage = async () => {
  await protectRoute();
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any).id;

  try {
    const [confirmedBookings, finishedBookings] = await Promise.all([
      findConfirmedBookings(userId),
      findFinishedBookings(userId),
    ]);

    if (!confirmedBookings.length && !finishedBookings.length) {
      return <NoBookingsMessage reset={() => {}} />;
    }

    return (
      <>
        <Header />

        <section className="px-5 py-6">
          <h1 className="text-xl font-bold mb-6">Agendamentos</h1>

          {confirmedBookings.length > 1 && (
            <BookingList bookings={confirmedBookings} title="Confirmados" />
          )}

          <div className="mt-6">
            <BookingList bookings={finishedBookings} title="Finalizados" />
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);
    return <ErrorPage />;
  }
};

export default BookingsPage;
