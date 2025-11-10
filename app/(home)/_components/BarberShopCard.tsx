"use client";

import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Barbershop } from "@prisma/client";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/_hooks/useAuthGuard";

interface IBarberShopCardProps {
  barberShop: Barbershop;
}

const BarberShopCard = ({ barberShop }: IBarberShopCardProps) => {
  const { push } = useRouter();
  const { isAuthenticated, redirectToLogin } = useAuthGuard({ requireAuth: false });

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }
    push(`/barbershop/${barberShop.id}`);
  };

  return (
    <Link href={`/barbershop/${barberShop.id}`}>
      <Card className="min-w-[167px] max-w-[167px] rounded-2xl pb-3">
        <CardContent className="px-1 py-0">
          <div className="relative w-full h-[159px]">
            <div className="absolute top-2 left-2 z-50">
              <Badge
                className=" flex item-center gap-2 opacity-90 bg-indigo-950"
                variant={"secondary"}
              >
                <StarIcon size={12} className="fill-primary text-primary" />
                <span className="text-xs">5.0</span>
              </Badge>
            </div>
            <Image
              src={barberShop.imageUrl}
              alt={barberShop.name}
              width={0}
              fill
              height={0}
              sizes="100vw"
              className="h-[159px] w-full rounded-2xl object-cover"
            />
          </div>

          <div className="pb-0 px-2">
            <h2 className="font-bold mt-2 overflow-hidden text-ellipsis text-nowrap">
              {barberShop.name}
            </h2>
            <p className="text-sm text-gray-400 overflow-hidden text-ellipsis text-nowrap">
              {barberShop.address}
            </p>
            <Button
              type="button"
              variant={"secondary"}
              onClick={handleBookingClick}
              className="w-full mt-3"
            >
              Reservar
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BarberShopCard;
