"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { SheetHeader, SheetTitle } from "./ui/sheet";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  ScissorsIcon,
  ShoppingBagIcon,
  StoreIcon,
  UserIcon,
  UserCircleIcon,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const SideMenu = () => {
  const { data } = useSession();

  const handleLogoutClick = () => signOut();

  const handleLoginClick = () => signIn("google");

  return (
    <>
      <SheetHeader className="border-b border-border p-5 text-left">
        <SheetTitle className="text-lg font-bold tracking-tight">Menu</SheetTitle>
      </SheetHeader>

      {data?.user ? (
        <section className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <Avatar className="ring-2 ring-accent/30">
              <AvatarImage src={data.user?.image ?? ""} />
            </Avatar>

            <h2 className="font-semibold tracking-tight">{data.user?.name}</h2>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleLogoutClick}
            aria-label="Sair"
          >
            <LogOutIcon size={18} />
          </Button>
        </section>
      ) : (
        <section className="flex flex-col gap-4 px-5 py-6">
          <div className="flex items-center gap-2">
            <UserIcon size={28} />
            <h2 className="font-semibold tracking-tight">Olá, faça seu login!</h2>
          </div>
          <Button
            type="button"
            variant="accent"
            className="w-full justify-start"
            onClick={handleLoginClick}
          >
            <LogInIcon className="mr-2" size={18} />
            Fazer Login
          </Button>
        </section>
      )}

      <section className="flex flex-col gap-2 px-5">
        <Button type="button" variant="outline" className="justify-start" asChild>
          <Link href="/">
            <HomeIcon size={18} className="mr-2" />
            Início
          </Link>
        </Button>

        {data?.user && (
          <>
            <Button type="button" variant="outline" className="justify-start" asChild>
              <Link href="/profile">
                <UserCircleIcon size={18} className="mr-2" />
                Meu perfil
              </Link>
            </Button>

            <Button type="button" variant="outline" className="justify-start" asChild>
              <Link href="/bookings">
                <CalendarIcon size={18} className="mr-2" />
                Agendamentos
              </Link>
            </Button>

            <Button type="button" variant="outline" className="justify-start" asChild>
              <Link href="/orders">
                <ShoppingBagIcon size={18} className="mr-2" />
                Meus pedidos
              </Link>
            </Button>

            {data.user.role === "OWNER" && (
              <Button type="button" variant="default" className="justify-start" asChild>
                <Link href="/admin">
                  <StoreIcon size={18} className="mr-2" />
                  Painel da barbearia
                </Link>
              </Button>
            )}

            {data.user.role === "BARBER" && (
              <Button type="button" variant="default" className="justify-start" asChild>
                <Link href="/barber">
                  <ScissorsIcon size={18} className="mr-2" />
                  Painel do barbeiro
                </Link>
              </Button>
            )}
          </>
        )}

        <ThemeToggle variant="full" />
      </section>
    </>
  );
};

export default SideMenu;
