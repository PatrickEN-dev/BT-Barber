import { Prisma } from "@prisma/client";

import { db } from "./prisma";

export type AuditAction =
  | "BOOKING_CREATE"
  | "BOOKING_CANCEL"
  | "ORDER_CREATE"
  | "ORDER_STATUS_UPDATE"
  | "ORDER_CANCEL"
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_TOGGLE_ACTIVE"
  | "PRODUCT_DELETE"
  | "SHOP_SETTINGS_UPDATE"
  | "SERVICE_CREATE"
  | "SERVICE_UPDATE"
  | "SERVICE_DELETE";

interface AuditInput {
  userId: string;
  action: AuditAction;
  barbershopId?: string | null;
  targetType?: "Order" | "Product" | "Booking" | "Service" | "Barbershop";
  targetId?: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Records a security-relevant mutation for forensics. Never throws — audit
 * failures must not break the underlying action. The cost is one async insert
 * per mutation, fire-and-forget.
 */
export const audit = async (input: AuditInput): Promise<void> => {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        barbershopId: input.barbershopId ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (err) {
    console.error("[audit] failed to record event", input.action, err);
  }
};
