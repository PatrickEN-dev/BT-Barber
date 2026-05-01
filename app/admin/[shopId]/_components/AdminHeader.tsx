"use client";

import { Button } from "@/app/_components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/_components/ui/sheet";
import { ArrowLeftIcon, LogOutIcon, MenuIcon, StoreIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import ThemeToggle from "@/app/_components/ThemeToggle";

interface IProps {
  shopName: string;
  shopId: string;
  shopImageUrl?: string | null;
}

const AdminHeader = ({ shopName, shopId, shopImageUrl }: IProps) => {
  const { data } = useSession();
  const user = data?.user;
  const initials = (user?.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-secondary ring-1 ring-secondary shrink-0">
            {shopImageUrl ? (
              <Image src={shopImageUrl} alt={shopName} fill sizes="36px" className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <StoreIcon size={14} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.1em] text-gray-500 leading-none font-semibold">
              Painel · admin
            </p>
            <h1 className="text-[13px] font-bold truncate leading-tight mt-0.5">{shopName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle className="h-9 w-9" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MenuIcon size={16} />
              </Button>
            </SheetTrigger>
          <SheetContent className="p-0 flex flex-col">
            <SheetHeader className="text-left border-b border-secondary p-5">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            {user && (
              <section className="px-5 py-4 flex items-center gap-3 border-b border-secondary">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
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
                <Link href={`/admin/${shopId}/settings`}>Configurações</Link>
              </Button>
              <ThemeToggle variant="full" />
            </section>

            <section className="mt-auto px-5 py-4 border-t border-secondary">
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
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
