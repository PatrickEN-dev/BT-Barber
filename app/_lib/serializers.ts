import type { Prisma, Service } from "@prisma/client";

export type SerializedService = Omit<Service, "price"> & { price: string };

export const serializeService = (service: Service): SerializedService => ({
  ...service,
  price: service.price.toString(),
});

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    barbershop: true;
    barber: true;
    services: { include: { service: true } };
  };
}>;

export type SerializedBookingWithRelations = Omit<BookingWithRelations, "services"> & {
  services: Array<
    Omit<BookingWithRelations["services"][number], "service"> & { service: SerializedService }
  >;
};

export const serializeBookingWithRelations = (
  booking: BookingWithRelations
): SerializedBookingWithRelations => ({
  ...booking,
  services: booking.services.map((bs) => ({
    ...bs,
    service: serializeService(bs.service),
  })),
});
