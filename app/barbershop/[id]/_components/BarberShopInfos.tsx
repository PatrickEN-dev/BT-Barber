"use client";

import { Barbershop } from "@prisma/client";
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Container from "@/app/_components/Container";
import SideMenu from "@/app/_components/SideMenu";
import { Button } from "@/app/_components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/app/_components/ui/sheet";

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
      <div className="relative h-[250px] w-full lg:h-[420px]">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleBack}
          className={`${floatingBtn} left-4 lg:hidden`}
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
              className={`${floatingBtn} right-4 lg:hidden`}
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
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent lg:from-background/95 lg:via-background/30" />

        {/* Desktop overlay info */}
        <Container className="absolute inset-x-0 bottom-0 hidden pb-10 lg:block">
          <div className="animate-slide-up">
            <h1 className="text-4xl font-bold tracking-tight drop-shadow xl:text-5xl">
              {barbershopData?.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPinIcon className="text-accent" size={16} />
                {barbershopData?.address}
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <StarIcon className="fill-yellow-400 text-yellow-400" size={16} />
                <span className="font-semibold text-foreground">5,0</span>
                <span>(899 pessoas)</span>
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile info */}
      <div className="animate-slide-up border-b border-border px-5 pt-4 pb-6 lg:hidden">
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
