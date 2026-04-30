"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";
import { updateBarberProfile } from "@/app/barber/_actions/profile";

interface IProps {
  shopId: string;
  initial: { name: string; description: string; imageUrl: string };
  rating: number;
}

const ProfileForm = ({ shopId, initial, rating }: IProps) => {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateBarberProfile(shopId, form);
        toast.success("Perfil atualizado.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <StarIcon size={14} className="text-yellow-500 fill-yellow-500" />
        <span className="tabular-nums">{rating.toFixed(1)}</span>
        <span className="text-[11px] text-gray-500">avaliação calculada · não editável</span>
      </div>

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
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Especialidades, estilo, experiência…"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="text-[10px] text-gray-500 tabular-nums self-end">
          {form.description.length}/500
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="imageUrl">URL da foto</Label>
        <Input
          id="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
        />
        <p className="text-[10px] text-gray-500">Deixe vazio pra usar suas iniciais.</p>
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
};

export default ProfileForm;
