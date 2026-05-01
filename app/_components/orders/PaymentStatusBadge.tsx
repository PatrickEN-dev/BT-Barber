import { PaymentMethod, PaymentStatus } from "@prisma/client";

import { Badge } from "@/app/_components/ui/badge";
import { cn } from "@/app/_lib/utils";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  method?: PaymentMethod;
  className?: string;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Aguardando",
  PAID: "Pago",
  FAILED: "Falhou",
  EXPIRED: "Expirado",
  REFUNDED: "Estornado",
  PARTIAL_REFUND: "Estorno parcial",
  CANCELED: "Cancelado",
};

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  FAILED: "bg-destructive/15 text-destructive",
  EXPIRED: "bg-muted text-muted-foreground",
  REFUNDED: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  PARTIAL_REFUND: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  CANCELED: "bg-muted text-muted-foreground",
};

const PaymentStatusBadge = ({ status, method, className }: PaymentStatusBadgeProps) => (
  <Badge
    variant="outline"
    className={cn(
      "border-transparent font-semibold tabular-nums",
      STATUS_STYLES[status],
      className
    )}
  >
    {STATUS_LABELS[status]}
    {method && status === "PAID" ? ` · ${method}` : null}
  </Badge>
);

export default PaymentStatusBadge;
