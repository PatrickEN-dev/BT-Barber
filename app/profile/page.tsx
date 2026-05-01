import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { findConfirmedBookings, findFinishedBookings } from "@/app/_actions/booking";
import { requireCustomer } from "@/app/_utils/redirectIfOwner";
import Header from "@/app/_components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Card, CardContent } from "@/app/_components/ui/card";
import BookingCard from "@/app/bookings/_components/BookingCard";
import SignOutButton from "./_components/SignOutButton";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

const PREVIEW_COUNT = 3;

const ProfilePage = async () => {
  await requireCustomer();
  const session = await getServerSession(authOptions);
  const user = session!.user;

  const [confirmedBookings, finishedBookings] = await Promise.all([
    findConfirmedBookings(user.id),
    findFinishedBookings(user.id),
  ]);

  const initials = (user.name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const upcomingPreview = confirmedBookings.slice(0, PREVIEW_COUNT);
  const historyPreview = finishedBookings.slice(0, PREVIEW_COUNT);

  return (
    <main className="pb-12">
      <Header />

      <section className="px-5 pt-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
          <AvatarFallback>{initials || "U"}</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-xl font-bold">{user.name ?? "Sem nome"}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </section>

      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase text-muted-foreground font-bold">Próximos agendamentos</h2>
          {confirmedBookings.length > PREVIEW_COUNT && (
            <Link
              href="/bookings"
              className="text-xs text-primary inline-flex items-center hover:underline"
            >
              Ver todos
              <ChevronRightIcon size={14} />
            </Link>
          )}
        </div>

        {upcomingPreview.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              Você ainda não tem agendamentos.{" "}
              <Link href="/" className="text-primary hover:underline">
                Reservar agora
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcomingPreview.map((booking) => (
              <li key={booking.id}>
                <BookingCard booking={booking} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {historyPreview.length > 0 && (
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase text-muted-foreground font-bold">Histórico</h2>
            {finishedBookings.length > PREVIEW_COUNT && (
              <Link
                href="/bookings"
                className="text-xs text-primary inline-flex items-center hover:underline"
              >
                Ver todos
                <ChevronRightIcon size={14} />
              </Link>
            )}
          </div>
          <ul className="flex flex-col gap-3">
            {historyPreview.map((booking) => (
              <li key={booking.id}>
                <BookingCard booking={booking} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-5 mt-10">
        <h2 className="text-xs uppercase text-muted-foreground font-bold mb-3">Conta</h2>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">E-mail</span>
            <span className="text-sm">{user.email ?? "—"}</span>
          </CardContent>
        </Card>

        <div className="mt-4">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
