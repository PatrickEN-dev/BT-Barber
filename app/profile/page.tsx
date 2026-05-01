import { CalendarCheckIcon, ChevronRightIcon, HistoryIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import Container from "@/app/_components/Container";
import Header from "@/app/_components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Card, CardContent } from "@/app/_components/ui/card";
import { findConfirmedBookings, findFinishedBookings } from "@/app/_actions/booking";
import { authOptions } from "@/app/_lib/auth";
import BookingCard from "@/app/bookings/_components/BookingCard";
import { requireCustomer } from "@/app/_utils/redirectIfOwner";

import SignOutButton from "./_components/SignOutButton";

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
    <main className="pb-16">
      <Header />

      <Container className="py-6 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] xl:gap-12">
          {/* Profile + Account column */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="animate-slide-up overflow-hidden">
              <CardContent className="flex flex-col items-center p-6 text-center lg:p-8">
                <Avatar className="h-24 w-24 ring-4 ring-accent/20 lg:h-28 lg:w-28">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                  <AvatarFallback>{initials || "U"}</AvatarFallback>
                </Avatar>
                <h1 className="mt-4 text-xl font-bold tracking-tight lg:text-2xl">
                  {user.name ?? "Sem nome"}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </CardContent>
            </Card>

            <div
              className="mt-4 animate-slide-up"
              style={{ animationDelay: "100ms" }}
            >
              <header className="mb-3 flex items-center gap-2">
                <UserIcon size={16} className="text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Conta
                </h2>
              </header>
              <Card>
                <CardContent className="flex flex-col gap-1 p-4">
                  <span className="text-xs text-muted-foreground">E-mail</span>
                  <span className="truncate text-sm">{user.email ?? "—"}</span>
                </CardContent>
              </Card>

              <div className="mt-4">
                <SignOutButton />
              </div>
            </div>
          </aside>

          {/* Bookings column */}
          <div className="flex min-w-0 flex-col gap-10">
            <section
              className="animate-slide-up"
              style={{ animationDelay: "120ms" }}
            >
              <header className="mb-4 flex items-center gap-2">
                <CalendarCheckIcon size={16} className="text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Próximos agendamentos
                </h2>
                {confirmedBookings.length > PREVIEW_COUNT && (
                  <Link
                    href="/bookings"
                    className="ml-auto inline-flex items-center text-xs font-semibold text-accent hover:underline"
                  >
                    Ver todos
                    <ChevronRightIcon size={14} />
                  </Link>
                )}
              </header>

              {upcomingPreview.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    Você ainda não tem agendamentos.{" "}
                    <Link href="/" className="font-semibold text-accent hover:underline">
                      Reservar agora
                    </Link>
                  </p>
                </div>
              ) : (
                <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {upcomingPreview.map((booking) => (
                    <li key={booking.id}>
                      <BookingCard booking={booking} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {historyPreview.length > 0 && (
              <section
                className="animate-slide-up"
                style={{ animationDelay: "200ms" }}
              >
                <header className="mb-4 flex items-center gap-2">
                  <HistoryIcon size={16} className="text-accent" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Histórico
                  </h2>
                  {finishedBookings.length > PREVIEW_COUNT && (
                    <Link
                      href="/bookings"
                      className="ml-auto inline-flex items-center text-xs font-semibold text-accent hover:underline"
                    >
                      Ver todos
                      <ChevronRightIcon size={14} />
                    </Link>
                  )}
                </header>
                <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {historyPreview.map((booking) => (
                    <li key={booking.id}>
                      <BookingCard booking={booking} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ProfilePage;
