"use client";

import React from "react";
import Image from "next/image";
import { IBookingBarberShopServiceProps } from "../interfaces";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Avatar, AvatarImage } from "@/app/_components/ui/avatar";

const BookingLocationMap = ({ booking }: IBookingBarberShopServiceProps) => {
  const { name, imageUrl, address, id } = booking.barbershop;
  return (
    <section className="relative h-[180px] w-full mt-6">
      <Image src="/barbershop-map.png" fill alt={name} className="object-cover" sizes="100vw" />

      <div className="w-full absolute bottom-4 left-0 px-5">
        <Card>
          <CardContent className="p-3 flex gap-2">
            <Avatar>
              <AvatarImage src={imageUrl} />
            </Avatar>

            <div>
              <h2 className="font-bold">{name}</h2>
              <h3 className="text-xs overflow-hidden text-nowrap text-ellipsis">{address}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BookingLocationMap;
