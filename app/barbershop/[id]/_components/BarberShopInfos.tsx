"use client";

import { Button } from "@/app/_components/ui/button";
import { Barbershop } from "@prisma/client";
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IBarberShopInfosProps {
  barbershopData?: Barbershop;
}

const BarberShopInfos = ({ barbershopData }: IBarberShopInfosProps) => {
  const { replace } = useRouter();
  return (
    <section>
      <div className="h-[250px] w-full relative">
        <Button
          type="button"
          size={"icon"}
          variant={"outline"}
          onClick={() => replace("/")}
          className="z-50 absolute top-4 left-4"
        >
          <ChevronLeftIcon />
        </Button>

        <Button
          type="button"
          size={"icon"}
          variant={"outline"}
          className="z-50 absolute top-4 right-4"
        >
          <MenuIcon />
        </Button>
        <Image
          src={barbershopData?.imageUrl as any}
          alt={barbershopData?.name as any}
          fill
          className="object-cover opacity-75"
          sizes="100vw"
        />
        <h1>{barbershopData?.name}</h1>
      </div>

      <div className="px-5 pt-3 pb-6 border-b border-solid border-secondary">
        <h1 className="text-xl font-bold">{barbershopData?.name}</h1>

        <div className="flex item-center gap-1 mt-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershopData?.address}</p>
        </div>

        <div className="flex item-center gap-1 mt-2">
          <StarIcon className="text-primary" size={18} />
          <p className="text-sm">5,0 (899 pessoas)</p>
        </div>
      </div>
    </section>
  );
};

export default BarberShopInfos;
