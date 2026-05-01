import Header from "../_components/Header";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";
import { db } from "../_lib/prisma";
import { findConfirmedBookings } from "../_actions/booking";
import { redirectIfOwner } from "../_utils/redirectIfOwner";
import HomeDesktop from "./_components/HomeDesktop";
import HomeMobile from "./_components/HomeMobile";

export default async function Home() {
  await redirectIfOwner();
  const session = await getServerSession(authOptions);

  const [barbershops, recommendedBarbershops, confirmedBookings] = await Promise.all([
    db.barbershop.findMany({}),
    db.barbershop.findMany({ orderBy: { id: "asc" } }),
    session?.user ? findConfirmedBookings(session.user.id) : Promise.resolve([]),
  ]);

  const props = { session, barbershops, recommendedBarbershops, confirmedBookings };

  return (
    <main>
      <Header />

      <HomeMobile {...props} className="lg:hidden" />
      <HomeDesktop {...props} className="hidden lg:block" />
    </main>
  );
}
