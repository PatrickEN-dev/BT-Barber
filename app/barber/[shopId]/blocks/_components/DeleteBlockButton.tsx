"use client";

import { useState, useTransition } from "react";
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
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { deleteBarberBlock } from "@/app/barber/_actions/blocks";

interface IProps {
  shopId: string;
  blockId: string;
}

const DeleteBlockButton = ({ shopId, blockId }: IProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await deleteBarberBlock(shopId, blockId);
        toast.success("Bloqueio removido.");
        setOpen(false);
      } catch {
        toast.error("Erro ao remover.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="text-gray-500 hover:text-rose-400 transition-colors p-2 shrink-0"
          aria-label="Remover bloqueio"
        >
          <Trash2Icon size={14} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover bloqueio?</AlertDialogTitle>
          <AlertDialogDescription>
            O período voltará a ficar disponível para agendamentos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={pending}>
            {pending ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBlockButton;
