"use server";

import { OrderStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";
import {
  serializeOrderWithRelations,
  type SerializedOrderWithRelations,
} from "@/app/_lib/serializers";

import {
  EmptyCartError,
  OrderNotCancellableError,
  OutOfStockError,
  UnauthorizedError,
} from "./_errors";

interface CreateOrderInput {
  barbershopId: string;
  items: Array<{ productId: string; quantity: number }>;
  notes?: string;
}

const ORDER_INCLUDE = {
  barbershop: true,
  items: { include: { product: true } },
} as const;

export const createOrder = async (
  input: CreateOrderInput
): Promise<SerializedOrderWithRelations> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  const items = input.items.filter((i) => i.quantity > 0);
  if (items.length === 0) throw new EmptyCartError();

  const userId = session.user.id;

  await rateLimit(`user:${userId}:createOrder`, { max: 15, windowMs: 60_000 });

  const order = await db.$transaction(async (tx) => {
    const productIds = items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, barbershopId: input.barbershopId, active: true },
    });

    if (products.length !== productIds.length) {
      throw new Error("Algum produto não existe ou está indisponível.");
    }

    let total = new Prisma.Decimal(0);
    const orderItemsData = items.map((line) => {
      const product = products.find((p) => p.id === line.productId)!;
      if (product.stock < line.quantity) throw new OutOfStockError(product.name);
      total = total.plus(product.price.mul(line.quantity));
      return {
        productId: product.id,
        quantity: line.quantity,
        unitPrice: product.price,
      };
    });

    for (const line of items) {
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
      });
    }

    return tx.order.create({
      data: {
        userId,
        barbershopId: input.barbershopId,
        total,
        notes: input.notes?.trim() || null,
        items: { create: orderItemsData },
      },
      include: ORDER_INCLUDE,
    });
  });

  revalidatePath("/orders");
  revalidatePath(`/admin/${input.barbershopId}/orders`);

  await audit({
    userId,
    action: "ORDER_CREATE",
    barbershopId: input.barbershopId,
    targetType: "Order",
    targetId: order.id,
    metadata: { total: order.total.toString(), itemCount: items.length },
  });

  return serializeOrderWithRelations(order);
};

export const findUserOrders = async (
  userId: string
): Promise<SerializedOrderWithRelations[]> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    throw new UnauthorizedError();
  }
  const orders = await db.order.findMany({
    where: { userId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(serializeOrderWithRelations);
};

export const findShopOrders = async (
  barbershopId: string
): Promise<SerializedOrderWithRelations[]> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  const shop = await db.barbershop.findFirst({
    where: { id: barbershopId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!shop) throw new UnauthorizedError();

  const orders = await db.order.findMany({
    where: { barbershopId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return orders.map(serializeOrderWithRelations);
};

const CANCELLABLE_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED"];

export const cancelOrder = async (orderId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  await rateLimit(`user:${session.user.id}:cancelOrder`, {
    max: 20,
    windowMs: 60_000,
  });

  const cancelledOrder = await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true, barbershop: true },
    });

    if (!order) throw new Error("Pedido não encontrado.");

    const isOwner = order.barbershop.ownerId === session.user.id;
    const isClient = order.userId === session.user.id;
    if (!isOwner && !isClient) throw new UnauthorizedError();

    if (!CANCELLABLE_STATUSES.includes(order.status) && order.status !== "READY") {
      throw new OrderNotCancellableError();
    }
    if (order.status === "READY" && !isOwner) {
      throw new OrderNotCancellableError();
    }

    if (order.status !== "CANCELLED" && order.status !== "COMPLETED") {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return { barbershopId: order.barbershopId };
  });

  revalidatePath("/orders");
  revalidatePath("/admin");

  await audit({
    userId: session.user.id,
    action: "ORDER_CANCEL",
    barbershopId: cancelledOrder.barbershopId,
    targetType: "Order",
    targetId: orderId,
  });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  await rateLimit(`user:${session.user.id}:updateOrderStatus`, {
    max: 60,
    windowMs: 60_000,
  });

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { barbershop: { select: { ownerId: true } } },
  });
  if (!order) throw new Error("Pedido não encontrado.");
  if (order.barbershop.ownerId !== session.user.id) throw new UnauthorizedError();

  if (status === "CANCELLED") return cancelOrder(orderId);

  await db.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath(`/admin/${order.barbershopId}/orders`);
  revalidatePath("/orders");

  await audit({
    userId: session.user.id,
    action: "ORDER_STATUS_UPDATE",
    barbershopId: order.barbershopId,
    targetType: "Order",
    targetId: orderId,
    metadata: { from: order.status, to: status },
  });
};
