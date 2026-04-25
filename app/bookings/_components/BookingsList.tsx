import React from "react";
import BookingCard from "./BookingCard";
import type { SerializedBookingWithRelations } from "@/app/_lib/serializers";

export interface IBookingListProps {
  title?: string;
  bookings: SerializedBookingWithRelations[];
}

const BookingList = ({ title, bookings }: IBookingListProps) => {
  return (
    <>
      {title && <h1 className="text-xl font-bold mb-6">{title}</h1>}

      {bookings.length > 0 && (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </ul>
      )}
    </>
  );
};

export default BookingList;
