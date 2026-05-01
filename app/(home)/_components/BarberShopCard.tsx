import { Badge } from "@/app/_components/ui/badge";
import { buttonVariants } from "@/app/_components/ui/button";
import { Barbershop } from "@prisma/client";
import { MapPinIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface IBarberShopCardProps {
  barberShop: Barbershop;
}

const BarberShopCard = ({ barberShop }: IBarberShopCardProps) => {
  return (
    <Link href={`/barbershop/${barberShop.id}`} className="group block h-full w-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card shadow-inset-highlight transition-all duration-500 ease-smooth hover:-translate-y-1.5 hover:border-accent/50 hover:shadow-card-hover">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={barberShop.imageUrl}
            alt={barberShop.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/75" />

          <div className="absolute left-3 top-3 transition-transform duration-300 ease-smooth group-hover:scale-105">
            <Badge variant="glass" className="gap-1.5">
              <StarIcon size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[11px] font-bold">5.0</span>
            </Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-col gap-1.5">
            <h3 className="truncate text-base font-bold tracking-tight">{barberShop.name}</h3>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPinIcon size={12} className="shrink-0" />
              <span className="truncate">{barberShop.address}</span>
            </p>
          </div>

          <span
            aria-hidden
            className={`${buttonVariants({ variant: "accent", size: "sm" })} mt-auto w-full`}
          >
            Reservar
          </span>
        </div>
      </article>
    </Link>
  );
};

export default BarberShopCard;
