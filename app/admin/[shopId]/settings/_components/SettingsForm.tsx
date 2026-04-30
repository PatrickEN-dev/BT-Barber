"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { toast } from "sonner";
import { updateShopSettings } from "@/app/admin/_actions/settings";

interface IProps {
  shopId: string;
  initial: { name: string; address: string; phone: string; imageUrl: string };
}

const SettingsForm = ({ shopId, initial }: IProps) => {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  const set = <K extends keyof typeof form>(key: K, value: string) =>
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
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
        <p className="text-[10px] text-gray-500">Use uma URL de utfs.io.</p>
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
};

export default SettingsForm;
