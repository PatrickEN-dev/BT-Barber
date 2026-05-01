"use client";

import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import CheckoutDialog from "@/app/_components/checkout/CheckoutDialog";
import { Input } from "@/app/_components/ui/input";
import { useAuthGuard } from "@/app/_hooks/useAuthGuard";
import { cn } from "@/app/_lib/utils";
import { formatPrice } from "@/app/_utils/formatPrices";
import { createOrder } from "@/app/_actions/order";
import { useCartStore, useCartTotals } from "@/app/_stores/cart";

interface ICartSheetProps {
  shopId: string;
  shopName: string;
  trigger: React.ReactNode;
}

const CartSheet = ({ shopId, shopName, trigger }: ICartSheetProps) => {
  const router = useRouter();
  const { ensureAuth } = useAuthGuard();
  const items = useCartStore((s) => s.items);
  const cartShopId = useCartStore((s) => s.barbershopId);
  const decrement = useCartStore((s) => s.decrement);
  const increment = useCartStore((s) => s.increment);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const { count, total } = useCartTotals();

  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<{ id: string; total: string } | null>(
    null
  );

  const isThisShop = cartShopId === shopId;
  const showItems = isThisShop && items.length > 0;

  const handleCheckout = async () => {
    if (!ensureAuth()) return;
    if (!showItems) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        barbershopId: shopId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        notes,
      });
      // Cart is preserved until payment completes (in case user closes the
      // checkout and wants to retry). It's cleared by handlePaid().
      setOpen(false);
      setCheckoutOrder({ id: order.id, total: order.total });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível concluir o pedido.";
      toast.error("Erro ao reservar", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaid = () => {
    clear();
    setNotes("");
    setCheckoutOrder(null);
    toast.success("Pedido confirmado!", {
      description: `${shopName} já recebeu o pagamento.`,
      action: { label: "Ver pedidos", onClick: () => router.push("/orders") },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 pb-4 pt-6 text-left">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBagIcon size={18} className="text-accent" />
            Seu carrinho
          </SheetTitle>
          <SheetDescription>
            {showItems ? `${count} ${count === 1 ? "item" : "itens"} de ${shopName}` : "Sem itens"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!showItems ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBagIcon size={36} className="text-muted-foreground" />
              <div>
                <p className="font-semibold">Seu carrinho está vazio</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Adicione produtos da loja pra reservar.
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="64px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.price)} · un
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5 rounded-lg border border-border">
                        <button
                          type="button"
                          onClick={() => decrement(item.productId)}
                          aria-label="Diminuir"
                          className="grid h-7 w-7 place-items-center text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                        >
                          <MinusIcon size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.productId)}
                          aria-label="Aumentar"
                          className="grid h-7 w-7 place-items-center text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
                        >
                          <PlusIcon size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remover do carrinho"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2Icon size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-sm font-bold tabular-nums">
                      {formatPrice(String(Number(item.price) * item.quantity))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showItems && (
          <div className="border-t border-border bg-card/50 px-6 py-4 backdrop-blur-sm">
            <div className="mb-3">
              <label
                htmlFor="cart-notes"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Observação (opcional)
              </label>
              <Input
                id="cart-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: levo durante o corte"
                className="h-9 text-sm"
                maxLength={200}
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="text-xl font-bold tabular-nums">
                {formatPrice(String(total))}
              </span>
            </div>

            <Button
              type="button"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={submitting}
              onClick={handleCheckout}
            >
              {submitting ? "Reservando..." : "Reservar pedido"}
            </Button>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Você paga e retira na barbearia. Acompanhe em{" "}
              <Link href="/orders" className="font-semibold text-accent hover:underline">
                meus pedidos
              </Link>
              .
            </p>
          </div>
        )}
      </SheetContent>

      {checkoutOrder && (
        <CheckoutDialog
          open={!!checkoutOrder}
          onOpenChange={(next) => {
            if (!next) setCheckoutOrder(null);
          }}
          kind="order"
          targetId={checkoutOrder.id}
          totalBRL={checkoutOrder.total}
          onPaid={handlePaid}
        />
      )}
    </Sheet>
  );
};

export const FloatingCartButton = ({
  shopId,
  shopName,
  className,
}: {
  shopId: string;
  shopName: string;
  className?: string;
}) => {
  const cartShopId = useCartStore((s) => s.barbershopId);
  const { count } = useCartTotals();
  const isThisShop = cartShopId === shopId;
  const visible = isThisShop && count > 0;

  if (!visible) return null;

  return (
    <CartSheet
      shopId={shopId}
      shopName={shopName}
      trigger={
        <button
          type="button"
          aria-label={`Abrir carrinho com ${count} ${count === 1 ? "item" : "itens"}`}
          className={cn(
            "fixed bottom-6 right-6 z-30 flex h-14 items-center gap-3 rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-floating transition-all duration-300 ease-smooth hover:scale-105 hover:shadow-glow active:scale-95 lg:bottom-8 lg:right-8",
            className
          )}
        >
          <span className="relative">
            <ShoppingBagIcon size={22} strokeWidth={2.5} />
            <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-card px-1 text-[10px] font-bold text-foreground ring-2 ring-background">
              {count}
            </span>
          </span>
          <span className="text-sm font-bold tracking-tight">Ver carrinho</span>
        </button>
      }
    />
  );
};

export default CartSheet;
