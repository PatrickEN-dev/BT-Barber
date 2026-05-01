import type { Prisma, Product, Service } from "@prisma/client";

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

export type SerializedProduct = Omit<Product, "price"> & { price: string };

export const serializeProduct = (product: Product): SerializedProduct => ({
  ...product,
  price: product.price.toString(),
});

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    barbershop: true;
    items: { include: { product: true } };
  };
}>;

export type SerializedOrderItem = Omit<
  OrderWithRelations["items"][number],
  "unitPrice" | "product"
> & {
  unitPrice: string;
  product: SerializedProduct;
};

export type SerializedOrderWithRelations = Omit<OrderWithRelations, "total" | "items"> & {
  total: string;
  items: SerializedOrderItem[];
};

export const serializeOrderWithRelations = (
  order: OrderWithRelations
): SerializedOrderWithRelations => ({
  ...order,
  total: order.total.toString(),
  items: order.items.map((item) => ({
    ...item,
    unitPrice: item.unitPrice.toString(),
    product: serializeProduct(item.product),
  })),
});
