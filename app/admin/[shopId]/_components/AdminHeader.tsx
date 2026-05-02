"use client";

import {
  ArrowLeftIcon,
  CalendarIcon,
  CoinsIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  ScissorsIcon,
  SettingsIcon,
  ShoppingBagIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Button } from "@/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import DesktopTopNav, { type NavItem } from "@/app/_components/desktop/DesktopTopNav";
import ThemeToggle from "@/app/_components/ThemeToggle";

interface IProps {
  shopName: string;
  shopId: string;
  shopImageUrl?: string | null;
}

const adminNavItems = (shopId: string): NavItem[] => {
  const base = `/admin/${shopId}`;
  return [
    { href: `${base}/dashboard`, label: "Início", icon: LayoutDashboardIcon },
    { href: `${base}/bookings`, label: "Agenda", icon: CalendarIcon },
    {
      href: `${base}/orders`,
      label: "Loja",
      icon: ShoppingBagIcon,
      matchPaths: [`${base}/orders`, `${base}/products`],
    },
    { href: `${base}/barbers`, label: "Equipe", icon: ScissorsIcon },
    { href: `${base}/clients`, label: "Clientes", icon: UsersIcon },
    { href: `${base}/payouts`, label: "Repasses", icon: CoinsIcon },
    { href: `${base}/settings`, label: "Ajustes", icon: SettingsIcon },
  ];
};

const AdminHeader = ({ shopName, shopId, shopImageUrl }: IProps) => {
  const { data } = useSession();
  const user = data?.user;
  const initials = (user?.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const items = adminNavItems(shopId);

  const ShopBadge = (
    <Link
      href={`/admin/${shopId}/dashboard`}
      className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
    >
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-secondary">
        {shopImageUrl ? (
          <Image
            src={shopImageUrl}
            alt={shopName}
            fill
            sizes="36px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <StoreIcon size={14} className="text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase leading-none tracking-[0.1em] text-muted-foreground">
          Painel · admin
        </p>
        <h1 className="mt-0.5 truncate text-[13px] font-bold leading-tight">{shopName}</h1>
      </div>
    </Link>
  );

  const adminMenu = (
    <SheetContent className="flex flex-col p-0">
      <SheetHeader className="border-b border-border p-5 text-left">
        <SheetTitle>Menu</SheetTitle>
      </SheetHeader>

      {user && (
        <section className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2 px-5 py-4">
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/admin">
            <ArrowLeftIcon size={16} className="mr-2" />
            Trocar barbearia
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href={`/admin/${shopId}/payouts`}>
            <CoinsIcon size={16} className="mr-2" />
            Repasses
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href={`/admin/${shopId}/settings`}>
            <SettingsIcon size={16} className="mr-2" />
            Configurações
          </Link>
        </Button>
        {user?.capabilities?.isBarber && (
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/barber">
              <ScissorsIcon size={16} className="mr-2" />
              Painel do barbeiro
            </Link>
          </Button>
        )}
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/">
            <HomeIcon size={16} className="mr-2" />
            Site do cliente
          </Link>
        </Button>
        <ThemeToggle variant="full" />
      </section>

      <section className="mt-auto border-t border-border px-5 py-4">
        <Button
          variant="destructive"
          className="w-full justify-center"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOutIcon size={16} className="mr-2" />
          Sair
        </Button>
      </section>
    </SheetContent>
  );

  return (
    <>
      {/* Desktop top nav */}
      <DesktopTopNav
        brand={ShopBadge}
        items={items}
        trailing={
          <>
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu"
                  className="rounded-full transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-accent/30">
                    <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              {adminMenu}
            </Sheet>
          </>
        }
      />

      {/* Mobile sticky header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          {ShopBadge}

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="h-9 w-9" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MenuIcon size={16} />
                </Button>
              </SheetTrigger>
              {adminMenu}
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
