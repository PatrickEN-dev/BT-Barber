"use client";

import { ProductCategory } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { createProduct, updateProduct } from "@/app/_actions/product";
import type { SerializedProduct } from "@/app/_lib/serializers";

interface ProductFormDialogProps {
  shopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: SerializedProduct | null;
}

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "DRINK", label: "Bebida" },
  { value: "HAIR_CARE", label: "Cuidados com cabelo" },
  { value: "BEARD_CARE", label: "Cuidados com barba" },
  { value: "ACCESSORY", label: "Acessório" },
  { value: "OTHER", label: "Outros" },
];

const blankForm = {
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  stock: "",
  category: "DRINK" as ProductCategory,
};

const ProductFormDialog = ({
  shopId,
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) => {
  const editing = !!product;
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              name: product.name,
              description: product.description ?? "",
              imageUrl: product.imageUrl,
              price: product.price,
              stock: String(product.stock),
              category: product.category,
            }
          : blankForm
      );
    }
  }, [open, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      description: form.description || undefined,
      imageUrl: form.imageUrl,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await updateProduct(product!.id, payload);
          toast.success("Produto atualizado");
        } else {
          await createProduct(shopId, payload);
          toast.success("Produto criado");
        }
        onOpenChange(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao salvar";
        toast.error(msg);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Atualize as informações do produto da loja."
              : "Adicione um produto à lojinha da barbearia."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Cerveja Heineken 350ml"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              maxLength={240}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ex: Long neck gelado"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="imageUrl">URL da imagem</Label>
            <Input
              id="imageUrl"
              required
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
            {form.imageUrl && (
              <div className="relative mt-1 h-32 w-32 overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={form.imageUrl}
                  alt="Pré-visualização"
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                required
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))
              }
              className="flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm shadow-soft ring-offset-background transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-ring"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="accent" disabled={pending}>
              {pending ? "Salvando..." : editing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
