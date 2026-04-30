"use client";

import { useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/_components/ui/sheet";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { createBarberBlock } from "@/app/barber/_actions/blocks";

interface IProps {
  shopId: string;
}

const BlockFormSheet = ({ shopId }: IProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [reason, setReason] = useState("");

  const reset = () => {
    setStartAt("");
    setEndAt("");
    setReason("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createBarberBlock(shopId, { startAt, endAt, reason });
        toast.success("Bloqueio criado.");
        reset();
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao criar.");
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <PlusIcon size={14} className="mr-1" />
          Novo
        </Button>
      </SheetTrigger>
      <SheetContent className="px-0 overflow-y-auto">
        <SheetHeader className="px-5 pb-4 border-b border-secondary">
          <SheetTitle>Novo bloqueio</SheetTitle>
        </SheetHeader>

        <form className="px-5 py-5 flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startAt">Início</Label>
            <Input
              id="startAt"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endAt">Fim</Label>
            <Input
              id="endAt"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Almoço, folga, médico…"
              maxLength={120}
            />
          </div>

          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Salvando..." : "Salvar bloqueio"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default BlockFormSheet;
