"use client";

import { OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

import OrderStatusBadge, {
  orderStatusLabel,
} from "@/app/_components/orders/OrderStatusBadge";
import PaymentStatusBadge from "@/app/_components/orders/PaymentStatusBadge";
import { Card, CardContent } from "@/app/_components/ui/card";
import { cn } from "@/app/_lib/utils";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { SerializedOrderWithRelations } from "@/app/_lib/serializers";

import OrderActions from "./OrderActions";
import RefundButton from "./RefundButton";

interface AdminOrdersListProps {
  orders: SerializedOrderWithRelations[];
}

type FilterValue = "ALL" | OrderStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Aguardando" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "READY", label: "Prontos" },
  { value: "COMPLETED", label: "Concluídos" },
  { value: "CANCELLED", label: "Cancelados" },
];

const AdminOrdersList = ({ orders }: AdminOrdersListProps) => {
  const [filter, setFilter] = useState<FilterValue>("ALL");

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const counts: Record<FilterValue, number> = {
    ALL: orders.length,
    PENDING: 0,
    CONFIRMED: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const o of orders) counts[o.status] += 1;

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count = counts[f.value];
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                active
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] tabular-nums",
                  active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum pedido {filter === "ALL" ? "" : orderStatusLabel(filter as OrderStatus).toLowerCase()}.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Quando</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 text-sm tabular-nums">
                      {format(order.createdAt, "dd/MM HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-semibold">{order.userId.slice(0, 8)}…</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <span className="line-clamp-1 max-w-md">
                        {order.items
                          .map((i) => `${i.quantity}× ${i.product.name}`)
                          .join(", ")}
                      </span>
                      {order.notes && (
                        <span className="mt-1 block text-[11px] italic text-muted-foreground/80">
                          “{order.notes}”
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <OrderStatusBadge status={order.status} />
                        {order.payment && (
                          <PaymentStatusBadge
                            status={order.payment.status}
                            method={order.payment.method}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <OrderActions orderId={order.id} status={order.status} />
                        {order.payment &&
                          (order.payment.status === "PAID" ||
                            order.payment.status === "PARTIAL_REFUND") && (
                            <RefundButton
                              paymentId={order.payment.id}
                              amount={order.payment.amount}
                              refundedAmount={order.payment.refundedAmount}
                            />
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((order) => (
              <li key={order.id}>
                <Card>
                  <CardContent className="space-y-3 p-4">
                    <header className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {format(order.createdAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold">
                          {order.userId.slice(0, 8)}…
                        </p>
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

                    <ul className="space-y-1 text-xs">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2">
                          <span className="truncate">
                            <span className="text-muted-foreground">{item.quantity}×</span>{" "}
                            {item.product.name}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {formatPrice(String(Number(item.unitPrice) * item.quantity))}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {order.notes && (
                      <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs italic text-muted-foreground">
                        “{order.notes}”
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                      <span className="text-base font-bold tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                      <div className="flex items-center gap-1">
                        <OrderActions orderId={order.id} status={order.status} />
                        {order.payment &&
                          (order.payment.status === "PAID" ||
                            order.payment.status === "PARTIAL_REFUND") && (
                            <RefundButton
                              paymentId={order.payment.id}
                              amount={order.payment.amount}
                              refundedAmount={order.payment.refundedAmount}
                            />
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default AdminOrdersList;
