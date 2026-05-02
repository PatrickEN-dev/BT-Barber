"use server";

import { OrderStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/_lib/auth";
import { audit } from "@/app/_lib/audit";
import { logError } from "@/app/_lib/log";
import { db } from "@/app/_lib/prisma";
import { rateLimit } from "@/app/_lib/rateLimit";
import {
  serializeOrderWithRelations,
  type SerializedOrderWithRelations,
} from "@/app/_lib/serializers";
import { stripe, toStripeAmount } from "@/app/_lib/stripe";

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
  payment: true,
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

/**
 * Cancel an order. Restocks the line items and, if the customer had already
 * paid, issues a Stripe refund for the shop's portion (subtotal). The platform
 * fee is always retained.
 *
 * Refund is issued BEFORE the local DB mutation so a Stripe failure aborts
 * the cancel and the customer can retry. If the local mutation later fails
 * after a successful refund, we have an audited refund-without-cancel state
 * that operators can reconcile via Stripe Dashboard + AuditLog.
 */
export const cancelOrder = async (
  orderId: string
): Promise<{ refundedCents: number }> => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new UnauthorizedError();

  await rateLimit(`user:${session.user.id}:cancelOrder`, {
    max: 20,
    windowMs: 60_000,
  });

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, barbershop: true, payment: true },
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
  if (order.status === "CANCELLED") return { refundedCents: 0 }; // idempotent

  // If the order was paid, refund the subtotal (shop's portion). Platform fee
  // is always retained. Webhook will flip Payment.status to REFUNDED.
  let refundedCents = 0;
  if (
    order.payment &&
    order.payment.status === "PAID" &&
    order.payment.externalId
  ) {
    const subtotalCents = toStripeAmount(order.payment.subtotalAmount.toString());
    const alreadyRefundedCents = toStripeAmount(order.payment.refundedAmount.toString());
    refundedCents = Math.max(0, subtotalCents - alreadyRefundedCents);
    if (refundedCents > 0) {
      try {
        await stripe.refunds.create(
          {
            payment_intent: order.payment.externalId,
            amount: refundedCents,
            reason: "requested_by_customer",
            metadata: {
              orderId,
              cancelledBy: isOwner ? "owner" : "customer",
            },
          },
          { idempotencyKey: `order-cancel-${orderId}` }
        );
      } catch (err) {
        logError("order-cancel", err, { orderId, paymentId: order.payment.id });
        throw new Error(
          "Não foi possível processar o estorno. Tente novamente em instantes."
        );
      }
    }
  }

  // Conditional update: only restock if WE are the ones flipping status to
  // CANCELLED. Prevents double-restock if two parallel cancel calls race
  // (e.g., customer + owner clicking simultaneously). updateMany returns
  // count=0 if status was already CANCELLED.
  const flipped = await db.$transaction(async (tx) => {
    const update = await tx.order.updateMany({
      where: { id: orderId, status: { not: "CANCELLED" } },
      data: { status: "CANCELLED" },
    });
    if (update.count === 0) return false; // someone else already cancelled

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return true;
  });

  if (!flipped) return { refundedCents }; // idempotent path — already cancelled

  revalidatePath("/orders");
  revalidatePath(`/admin/${order.barbershopId}/orders`);

  await audit({
    userId: session.user.id,
    action: "ORDER_CANCEL",
    barbershopId: order.barbershopId,
    targetType: "Order",
    targetId: orderId,
    metadata: {
      cancelledBy: isOwner ? "owner" : "customer",
      refundedCents,
      hadPaidPayment: order.payment?.status === "PAID",
    },
  });

  return { refundedCents };
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
