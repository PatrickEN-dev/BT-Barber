"use client";

import { CalendarIcon, HomeIcon, MenuIcon, ScissorsIcon, UserIcon } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import DesktopTopNav, { type NavItem } from "./desktop/DesktopTopNav";
import Logo from "./Logo";
import SideMenu from "./SideMenu";
import ThemeToggle from "./ThemeToggle";

const customerNav: NavItem[] = [
  { label: "Início", href: "/", icon: HomeIcon, exact: true },
  { label: "Buscar", href: "/barbershop", icon: ScissorsIcon },
];

const authedNav: NavItem[] = [
  ...customerNav,
  { label: "Agendamentos", href: "/bookings", icon: CalendarIcon },
];

const Header = () => {
  const { data, status } = useSession();
  const user = data?.user;
  const initials = (user?.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const items = user ? authedNav : customerNav;

  const desktopTrailing = (
    <>
      <ThemeToggle />
      {user ? (
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Abrir menu"
              className="rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar className="h-10 w-10 ring-2 ring-accent/30">
                <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </SheetTrigger>
          <SheetContent className="p-0">
            <SideMenu />
          </SheetContent>
        </Sheet>
      ) : (
        <Button
          variant="accent"
          size="sm"
          onClick={() => signIn("google")}
          disabled={status === "loading"}
        >
          <UserIcon size={16} className="mr-2" />
          Entrar
        </Button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop */}
      <DesktopTopNav
        brand={
          <Link
            href="/"
            aria-label="BT-Barber — início"
            className="flex items-center transition-transform duration-300 ease-smooth hover:scale-[1.03]"
          >
            <Logo size="md" />
          </Link>
        }
        items={items}
        trailing={desktopTrailing}
      />

      {/* Mobile */}
      <header className="sticky top-0 z-40 w-full animate-slide-down border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 lg:hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/"
            aria-label="BT-Barber — início"
            className="flex items-center transition-transform duration-300 ease-smooth hover:scale-[1.03]"
          >
            <Logo size="md" />
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menu">
                  <MenuIcon size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent className="p-0">
                <SideMenu />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
