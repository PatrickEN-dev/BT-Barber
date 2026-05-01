"use client";

import { CalendarXIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { markBookingNoShow } from "@/app/_actions/payment";
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
import { Button } from "@/app/_components/ui/button";

interface IProps {
  bookingId: string;
  clientName: string;
}

const NoShowButton = ({ bookingId, clientName }: IProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await markBookingNoShow(bookingId);
        toast.success("No-show registrado", {
          description: "Pagamento retido como multa, conforme política.",
        });
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao marcar.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-1 text-destructive hover:bg-destructive/10">
          <CalendarXIcon size={14} className="mr-1.5" />
          Marcar como no-show
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cliente não compareceu?</AlertDialogTitle>
          <AlertDialogDescription>
            {clientName || "O cliente"} será marcado como no-show. O pagamento online (se houver)
            permanece com a barbearia como multa de não-comparecimento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={pending}>
            {pending ? "Registrando..." : "Confirmar no-show"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NoShowButton;
