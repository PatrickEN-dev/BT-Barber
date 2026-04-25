import { Booking } from "@prisma/client";
import type { SerializedBookingWithRelations } from "@/app/_lib/serializers";

export interface IBookingProps {
  booking: Booking;
}

export interface IBookingBarberShopServiceProps {
  booking: SerializedBookingWithRelations;
}
