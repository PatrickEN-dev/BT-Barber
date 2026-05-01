"use client";

import { isFuture } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

import { cancelBookingWithRefund } from "@/app/_actions/payment";
import { Button } from "@/app/_components/ui/button";
import { AlertDialog, AlertDialogTrigger } from "@/app/_components/ui/alert-dialog";
import { SheetClose, SheetFooter } from "@/app/_components/ui/sheet";

import AlertBookingCancelDialog from "../_Modals/AlertBookingCancelDialog";
import { IBookingProps } from "../interfaces";

const formatRefund = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const BookingFooter = ({ booking }: IBookingProps) => {
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const isBookingConfirmed = isFuture(booking.date);

  const handleCancelClick = async () => {
    setIsDeleteLoading(true);

    try {
      const result = await cancelBookingWithRefund(booking.id);

      if (result.refundedCents > 0) {
        const tierLabel =
          result.tier === "FULL" ? "integral" : result.tier === "HALF" ? "parcial (50%)" : "";
        toast.success("Reserva cancelada", {
          description: `Estorno ${tierLabel} de ${formatRefund(
            result.refundedCents
          )} processado.`,
        });
      } else {
        toast.success("Reserva cancelada", {
          description:
            "Cancelamento em cima da hora — não há estorno conforme política da barbearia.",
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao cancelar.";
      toast.error(msg);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <SheetFooter className="flex-row gap-3 mt-6">
      <SheetClose asChild>
        <Button className="w-full" variant="secondary">
          Voltar
        </Button>
      </SheetClose>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={!isBookingConfirmed || isDeleteLoading}
            className="w-full"
            variant="destructive"
          >
            Cancelar Reserva
          </Button>
        </AlertDialogTrigger>
        <AlertBookingCancelDialog {...{ isDeleteLoading, handleCancelClick }} />
      </AlertDialog>
    </SheetFooter>
  );
};

export default BookingFooter;
