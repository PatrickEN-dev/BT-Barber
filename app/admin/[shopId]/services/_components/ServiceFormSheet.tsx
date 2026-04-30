"use client";

import { useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/_components/ui/sheet";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { createShopService, updateShopService } from "@/app/admin/_actions/services";
import type { SerializedService } from "@/app/_lib/serializers";

interface IProps {
  shopId: string;
  mode: "create" | "edit";
  service?: SerializedService;
}

const ServiceFormSheet = ({ shopId, mode, service }: IProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(service?.price ?? "");
  const [imageUrl, setImageUrl] = useState(service?.imageUrl ?? "");

  const reset = () => {
    if (mode === "create") {
      setName("");
      setDescription("");
      setPrice("");
      setImageUrl("");
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = { name, description, price, imageUrl };
        if (mode === "create") {
          await createShopService(shopId, payload);
          toast.success("Serviço criado.");
        } else {
          await updateShopService(shopId, service!.id, payload);
          toast.success("Serviço atualizado.");
        }
        reset();
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {mode === "create" ? (
          <Button size="sm">
            <PlusIcon size={14} className="mr-1" />
            Novo
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1">
            <PencilIcon size={12} className="mr-1" />
            Editar
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="px-0 overflow-y-auto">
        <SheetHeader className="px-5 pb-4 border-b border-secondary">
          <SheetTitle>{mode === "create" ? "Novo serviço" : "Editar serviço"}</SheetTitle>
        </SheetHeader>

        <form className="px-5 py-5 flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="imageUrl">URL da imagem</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
            <p className="text-[10px] text-gray-500">Use uma URL de utfs.io.</p>
          </div>

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ServiceFormSheet;
