"use client";

import { OrderStatus } from "@prisma/client";
import {
  CheckCircle2Icon,
  CheckIcon,
  PackageCheckIcon,
  XIcon,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { cancelOrder, updateOrderStatus } from "@/app/_actions/order";

interface OrderActionsProps {
  orderId: string;
  status: OrderStatus;
}

const OrderActions = ({ orderId, status }: OrderActionsProps) => {
  const [pending, startTransition] = useTransition();

  const run = (next: OrderStatus, label: string) => () => {
    startTransition(async () => {
      try {
        if (next === "CANCELLED") {
          await cancelOrder(orderId);
          toast.success("Pedido cancelado");
          return;
        }
        await updateOrderStatus(orderId, next);
        toast.success(label);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro";
        toast.error(msg);
      }
    });
  };

  const isCancelled = status === "CANCELLED";
  const isCompleted = status === "COMPLETED";
  const isFinal = isCancelled || isCompleted;

  return (
    <div className="flex items-center gap-1.5">
      {status === "PENDING" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={run("CONFIRMED", "Pedido confirmado")}
          className="text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
        >
          <CheckIcon size={14} className="mr-1" />
          Confirmar
        </Button>
      )}
      {status === "CONFIRMED" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={run("READY", "Pedido pronto pra retirada")}
          className="text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
        >
          <PackageCheckIcon size={14} className="mr-1" />
          Pronto
        </Button>
      )}
      {status === "READY" && (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={run("COMPLETED", "Pedido concluído")}
          className="text-foreground hover:bg-muted"
        >
          <CheckCircle2Icon size={14} className="mr-1" />
          Concluir
        </Button>
      )}
      {!isFinal && (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={run("CANCELLED", "Pedido cancelado")}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <XIcon size={14} />
        </Button>
      )}
    </div>
  );
};

export default OrderActions;
