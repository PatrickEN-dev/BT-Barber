"use client";

import { ProductCategory } from "@prisma/client";
import {
  EditIcon,
  EyeIcon,
  EyeOffIcon,
  PackageOpenIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { deleteProduct, toggleProductActive } from "@/app/_actions/product";
import { cn } from "@/app/_lib/utils";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { SerializedProduct } from "@/app/_lib/serializers";

import ProductFormDialog from "./ProductFormDialog";

interface AdminProductsListProps {
  shopId: string;
  products: SerializedProduct[];
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  DRINK: "Bebida",
  HAIR_CARE: "Cabelo",
  BEARD_CARE: "Barba",
  ACCESSORY: "Acessório",
  OTHER: "Outros",
};

type FilterValue = "ALL" | "ACTIVE" | "INACTIVE";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "INACTIVE", label: "Inativos" },
];

const AdminProductsList = ({ shopId, products }: AdminProductsListProps) => {
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [editingProduct, setEditingProduct] = useState<SerializedProduct | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const counts = {
    ALL: products.length,
    ACTIVE: products.filter((p) => p.active).length,
    INACTIVE: products.filter((p) => !p.active).length,
  };

  const filtered =
    filter === "ALL"
      ? products
      : filter === "ACTIVE"
        ? products.filter((p) => p.active)
        : products.filter((p) => !p.active);

  const openCreate = () => {
    setEditingProduct(null);
    setOpen(true);
  };

  const openEdit = (product: SerializedProduct) => {
    setEditingProduct(product);
    setOpen(true);
  };

  const handleToggle = (product: SerializedProduct) => {
    startTransition(async () => {
      try {
        await toggleProductActive(product.id);
        toast.success(product.active ? "Produto desativado" : "Produto ativado");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro");
      }
    });
  };

  const handleDelete = (product: SerializedProduct) => {
    startTransition(async () => {
      try {
        await deleteProduct(product.id);
        toast.success("Produto removido");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro");
      }
    });
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = filter === f.value;
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
                  {counts[f.value]}
                </span>
              </button>
            );
          })}
        </div>

        <Button variant="accent" size="sm" onClick={openCreate}>
          <PlusIcon size={14} className="mr-1" />
          Novo
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <PackageOpenIcon size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="mb-4 text-sm text-muted-foreground">
            {filter === "ALL"
              ? "Sua loja ainda não tem produtos. Adicione o primeiro!"
              : "Nenhum produto nesse filtro."}
          </p>
          {filter === "ALL" && (
            <Button variant="accent" size="sm" onClick={openCreate}>
              <PlusIcon size={14} className="mr-1" />
              Criar primeiro produto
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Preço</th>
                  <th className="px-4 py-3 text-right">Estoque</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{product.name}</p>
                          {product.description && (
                            <p className="truncate text-xs text-muted-foreground">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[product.category]}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums">
                      <span
                        className={cn(
                          product.stock === 0 && "text-destructive font-semibold",
                          product.stock > 0 && product.stock < 5 && "text-amber-600 dark:text-amber-400 font-semibold"
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent",
                          product.active
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={product.active ? "Desativar" : "Ativar"}
                          disabled={pending}
                          onClick={() => handleToggle(product)}
                          className="h-8 w-8"
                        >
                          {product.active ? (
                            <EyeOffIcon size={14} />
                          ) : (
                            <EyeIcon size={14} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar"
                          onClick={() => openEdit(product)}
                          className="h-8 w-8"
                        >
                          <EditIcon size={14} />
                        </Button>
                        <DeleteProductButton
                          product={product}
                          pending={pending}
                          onConfirm={() => handleDelete(product)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {filtered.map((product) => (
              <li key={product.id}>
                <Card>
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-bold">{product.name}</p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-transparent shrink-0",
                              product.active
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {product.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {CATEGORY_LABELS[product.category]} ·{" "}
                          <span
                            className={cn(
                              product.stock === 0 && "text-destructive font-semibold"
                            )}
                          >
                            {product.stock} em estoque
                          </span>
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-base font-bold tabular-nums">
                            {formatPrice(product.price)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={product.active ? "Desativar" : "Ativar"}
                              disabled={pending}
                              onClick={() => handleToggle(product)}
                              className="h-8 w-8"
                            >
                              {product.active ? (
                                <EyeOffIcon size={14} />
                              ) : (
                                <EyeIcon size={14} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar"
                              onClick={() => openEdit(product)}
                              className="h-8 w-8"
                            >
                              <EditIcon size={14} />
                            </Button>
                            <DeleteProductButton
                              product={product}
                              pending={pending}
                              onConfirm={() => handleDelete(product)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <ProductFormDialog
        shopId={shopId}
        open={open}
        onOpenChange={setOpen}
        product={editingProduct}
      />
    </>
  );
};

const DeleteProductButton = ({
  product,
  pending,
  onConfirm,
}: {
  product: SerializedProduct;
  pending: boolean;
  onConfirm: () => void;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Remover"
        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={pending}
      >
        <Trash2Icon size={14} />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remover &ldquo;{product.name}&rdquo;?</AlertDialogTitle>
        <AlertDialogDescription>
          Se houver pedidos vinculados, o produto será desativado em vez de excluído pra
          preservar o histórico.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={pending}>
          Remover
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default AdminProductsList;
