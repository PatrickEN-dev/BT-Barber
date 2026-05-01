"use client";

import { Undo2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { refundPaymentByOwner } from "@/app/_actions/payment";
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
import { formatPrice } from "@/app/_utils/formatPrices";

interface IProps {
  paymentId: string;
  amount: string;
  refundedAmount: string;
}

const RefundButton = ({ paymentId, amount, refundedAmount }: IProps) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const remaining = (Number(amount) - Number(refundedAmount)).toFixed(2);

  const onConfirm = () => {
    startTransition(async () => {
      try {
        await refundPaymentByOwner(paymentId);
        toast.success("Estorno solicitado", {
          description: `Stripe processará ${formatPrice(remaining)} em até 7 dias úteis.`,
        });
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao estornar.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:bg-purple-500/10 dark:text-purple-400"
        >
          <Undo2Icon size={14} className="mr-1" />
          Estornar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Estornar {formatPrice(remaining)}?</AlertDialogTitle>
          <AlertDialogDescription>
            Override manual da política de cancelamento — o cliente recebe o valor restante de
            volta. Estorno automático cai em 7 dias úteis. Operação irreversível.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={pending}>
            {pending ? "Processando..." : "Confirmar estorno"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RefundButton;
