"use client";

import { ProductCategory } from "@prisma/client";
import { PackageOpenIcon } from "lucide-react";

import { cn } from "@/app/_lib/utils";
import type { SerializedProduct } from "@/app/_lib/serializers";

import ProductCard from "./ProductCard";
import SwitchCartShopDialog from "./SwitchCartShopDialog";

interface IBarbershopShopProps {
  shopName: string;
  products: SerializedProduct[];
  className?: string;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  DRINK: "Bebidas",
  HAIR_CARE: "Cuidados com cabelo",
  BEARD_CARE: "Cuidados com barba",
  ACCESSORY: "Acessórios",
  OTHER: "Outros",
};

const CATEGORY_ORDER: ProductCategory[] = [
  "DRINK",
  "HAIR_CARE",
  "BEARD_CARE",
  "ACCESSORY",
  "OTHER",
];

const BarbershopShop = ({ shopName, products, className }: IBarbershopShopProps) => {
  if (products.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center", className)}>
        <PackageOpenIcon size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Esta barbearia ainda não tem produtos na loja.
        </p>
      </div>
    );
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: products.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      {grouped.map(({ category, label, items }, sectionIdx) => (
        <section
          key={category}
          className="animate-slide-up"
          style={{ animationDelay: `${sectionIdx * 80}ms` }}
        >
          <header className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </h3>
            <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
              {items.length}
            </span>
          </header>

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product, i) => (
              <li
                key={product.id}
                className="animate-scale-in"
                style={{ animationDelay: `${sectionIdx * 80 + i * 40}ms` }}
              >
                <ProductCard product={product} shopName={shopName} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <SwitchCartShopDialog />
    </div>
  );
};

export default BarbershopShop;
