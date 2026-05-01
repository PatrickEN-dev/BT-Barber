"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRightIcon, StoreIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import OrderStatusBadge from "@/app/_components/orders/OrderStatusBadge";
import PaymentStatusBadge from "@/app/_components/orders/PaymentStatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { cancelOrder } from "@/app/_actions/order";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { SerializedOrderWithRelations } from "@/app/_lib/serializers";

interface IUserOrderCardProps {
  order: SerializedOrderWithRelations;
}

const cancellableStatuses = new Set(["PENDING", "CONFIRMED"]);

const UserOrderCard = ({ order }: IUserOrderCardProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const canCancel = cancellableStatuses.has(order.status);
  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const previewItems = order.items.slice(0, 3);

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelOrder(order.id);
        toast.success("Pedido cancelado");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao cancelar";
        toast.error(msg);
      }
    });
  };

  return (
    <Card className="transition-all duration-300 ease-smooth hover:border-accent/40 hover:shadow-card-hover">
      <CardContent className="p-4 lg:p-5">
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {format(order.createdAt, "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
            </p>
            <h3 className="mt-0.5 inline-flex items-center gap-1.5 truncate text-sm font-bold">
              <StoreIcon size={14} className="text-accent shrink-0" />
              {order.barbershop.name}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <OrderStatusBadge status={order.status} />
            {order.payment && (
              <PaymentStatusBadge
                status={order.payment.status}
                method={order.payment.method}
              />
            )}
          </div>
        </header>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="-mx-2 mb-3 flex w-[calc(100%+1rem)] items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40"
        >
          <span>
            {itemsCount} {itemsCount === 1 ? "item" : "itens"}:{" "}
            <span className="text-foreground">
              {previewItems.map((i) => i.product.name).join(", ")}
              {order.items.length > previewItems.length &&
                ` +${order.items.length - previewItems.length}`}
            </span>
          </span>
          <ChevronRightIcon
            size={14}
            className={`shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
        </button>

        {open && (
          <ul className="mb-3 space-y-1.5 border-y border-border/60 py-3 text-xs">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <span className="truncate">
                  <span className="text-muted-foreground">{item.quantity}×</span> {item.product.name}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {formatPrice(String(Number(item.unitPrice) * item.quantity))}
                </span>
              </li>
            ))}
            {order.notes && (
              <li className="mt-2 border-t border-dashed border-border/60 pt-2 text-muted-foreground">
                <span className="font-semibold text-foreground">Obs:</span> {order.notes}
              </li>
            )}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-bold tabular-nums">{formatPrice(order.total)}</span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/barbershop/${order.barbershopId}`}>
                Ver loja
              </Link>
            </Button>
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <XIcon size={14} className="mr-1" />
                    Cancelar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar pedido?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Os produtos voltam pro estoque da barbearia. Essa ação não pode ser
                      desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} disabled={pending}>
                      {pending ? "Cancelando..." : "Cancelar pedido"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserOrderCard;
