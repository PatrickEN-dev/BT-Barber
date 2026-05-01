import { OrderStatus } from "@prisma/client";

import { Badge } from "@/app/_components/ui/badge";
import { cn } from "@/app/_lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Aguardando",
  CONFIRMED: "Confirmado",
  READY: "Pronto",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  CONFIRMED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  READY: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
};

const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => (
  <Badge
    variant="outline"
    className={cn("border-transparent font-semibold", STATUS_STYLES[status], className)}
  >
    {STATUS_LABELS[status]}
  </Badge>
);

export const orderStatusLabel = (status: OrderStatus) => STATUS_LABELS[status];

export default OrderStatusBadge;
