"use client";

import { useState, useTransition } from "react";
import { Button } from "@/app/_components/ui/button";
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
import { deleteShopService } from "@/app/admin/_actions/services";

interface IProps {
  shopId: string;
  serviceId: string;
  serviceName: string;
}

const DeleteServiceButton = ({ shopId, serviceId, serviceName }: IProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await deleteShopService(shopId, serviceId);
        toast.success("Serviço excluído.");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível excluir.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" className="px-3">
          <Trash2Icon size={12} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir “{serviceName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Se houver agendamentos vinculados, a exclusão será bloqueada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={pending}>
            {pending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteServiceButton;
