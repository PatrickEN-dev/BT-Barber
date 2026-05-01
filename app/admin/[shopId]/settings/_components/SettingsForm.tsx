"use client";

import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { updateShopSettings } from "@/app/admin/_actions/settings";
import { cn } from "@/app/_lib/utils";

interface IProps {
  shopId: string;
  initial: {
    name: string;
    address: string;
    phone: string;
    imageUrl: string;
    hasShop: boolean;
  };
}

const SettingsForm = ({ shopId, initial }: IProps) => {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateShopSettings(shopId, form);
        toast.success("Configurações salvas.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          minLength={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          required
          minLength={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="imageUrl">URL da imagem</Label>
        <Input
          id="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
          required
        />
        <p className="text-[10px] text-muted-foreground">Use uma URL pública (ex: utfs.io).</p>
      </div>

      <div
        className={cn(
          "rounded-2xl border p-4 transition-colors duration-200",
          form.hasShop ? "border-accent/40 bg-accent/5" : "border-border bg-card"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors",
                form.hasShop ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <ShoppingBagIcon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight">Lojinha da barbearia</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Quando ativada, os clientes veem a aba &ldquo;Loja&rdquo; e conseguem reservar
                bebidas, produtos e acessórios.
              </p>
              {form.hasShop && (
                <Link
                  href={`/admin/${shopId}/products`}
                  className="mt-2 inline-flex text-xs font-semibold text-accent hover:underline"
                >
                  Gerenciar produtos →
                </Link>
              )}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.hasShop}
            onClick={() => set("hasShop", !form.hasShop)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              form.hasShop ? "bg-accent" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-card shadow-sm transition-transform duration-300",
                form.hasShop ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      <Button type="submit" variant="accent" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
};

export default SettingsForm;
