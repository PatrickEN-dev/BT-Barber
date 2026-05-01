"use client";

import { Button } from "@/app/_components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/app/_components/ui/sheet";
import SideMenu from "@/app/_components/SideMenu";
import { Barbershop } from "@prisma/client";
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IBarberShopInfosProps {
  barbershopData?: Barbershop;
}

const floatingBtn =
  "z-50 absolute top-4 border-white/20 bg-black/40 text-white shadow-floating backdrop-blur-md transition-all duration-300 ease-smooth hover:bg-black/60 hover:text-white hover:scale-105";

const BarberShopInfos = ({ barbershopData }: IBarberShopInfosProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <section>
      <div className="relative h-[250px] w-full">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleBack}
          className={`${floatingBtn} left-4`}
          aria-label="Voltar"
        >
          <ChevronLeftIcon size={18} />
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className={`${floatingBtn} right-4`}
              aria-label="Abrir menu"
            >
              <MenuIcon size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0">
            <SideMenu />
          </SheetContent>
        </Sheet>

        <Image
          src={barbershopData?.imageUrl as any}
          alt={barbershopData?.name as any}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="animate-slide-up border-b border-border px-5 pt-4 pb-6">
        <h1 className="text-xl font-bold tracking-tight">{barbershopData?.name}</h1>

        <div className="mt-2 flex items-center gap-1.5">
          <MapPinIcon className="text-accent" size={16} />
          <p className="text-sm text-muted-foreground">{barbershopData?.address}</p>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <StarIcon className="fill-yellow-400 text-yellow-400" size={16} />
          <p className="text-sm text-muted-foreground">5,0 (899 pessoas)</p>
        </div>
      </div>
    </section>
  );
};

export default BarberShopInfos;
