"use client";

import { CheckIcon, MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/app/_components/ui/button";
import { useCartStore } from "@/app/_stores/cart";
import { cn } from "@/app/_lib/utils";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { SerializedProduct } from "@/app/_lib/serializers";

interface IProductCardProps {
  product: SerializedProduct;
  shopName: string;
}

const ProductCard = ({ product, shopName }: IProductCardProps) => {
  const items = useCartStore((s) => s.items);
  const cartShopId = useCartStore((s) => s.barbershopId);
  const addItem = useCartStore((s) => s.addItem);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

  const cartLine =
    cartShopId === product.barbershopId
      ? items.find((i) => i.productId === product.id)
      : undefined;
  const inCart = !!cartLine;
  const quantity = cartLine?.quantity ?? 0;

  const outOfStock = product.stock === 0;
  const reachedStockLimit = quantity >= product.stock;

  const handleAdd = () => addItem(product, shopName);
  const handleInc = () => {
    if (reachedStockLimit) return;
    increment(product.id);
  };
  const handleDec = () => decrement(product.id);

  return (
    <article
      className={cn(
        "group/product relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-card shadow-inset-highlight transition-all duration-300 ease-smooth",
        inCart
          ? "border-accent shadow-glow"
          : "border-border hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover"
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
          className="object-cover transition-transform duration-500 ease-smooth group-hover/product:scale-105"
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground">
              Esgotado
            </span>
          </div>
        )}
        {inCart && !outOfStock && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-glow">
            <CheckIcon size={16} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex flex-col gap-0.5">
          <h3 className="line-clamp-2 text-sm font-bold leading-tight tracking-tight">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span
            className={cn(
              "text-base font-bold tracking-tight transition-colors",
              inCart ? "text-accent" : "text-foreground"
            )}
          >
            {formatPrice(product.price)}
          </span>

          {inCart ? (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleDec}
                aria-label="Diminuir"
                className="h-7 w-7 text-foreground hover:bg-accent/10"
              >
                <MinusIcon size={14} />
              </Button>
              <span className="w-6 text-center text-sm font-bold tabular-nums">{quantity}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleInc}
                disabled={reachedStockLimit}
                aria-label="Aumentar"
                className="h-7 w-7 text-foreground hover:bg-accent/10"
              >
                <PlusIcon size={14} />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="accent"
              onClick={handleAdd}
              disabled={outOfStock}
              className="px-3"
            >
              <PlusIcon size={14} className="mr-1" />
              Adicionar
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
