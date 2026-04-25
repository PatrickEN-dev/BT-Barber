import type { Prisma, Service } from "@prisma/client";

export type SerializedService = Omit<Service, "price"> & { price: string };

export const serializeService = (service: Service): SerializedService => ({
  ...service,
  price: service.price.toString(),
});

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: { service: true; barbershop: true };
}>;

export type SerializedBookingWithRelations = Omit<BookingWithRelations, "service"> & {
  service: SerializedService;
};

export const serializeBookingWithRelations = (
  booking: BookingWithRelations
): SerializedBookingWithRelations => ({
  ...booking,
  service: serializeService(booking.service),
});
