import { Loader2 } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";

interface IAlertBookingCancelDialogProps {
  isDeleteLoading: boolean;
  handleCancelClick: () => Promise<void>;
}

const AlertBookingCancelDialog = ({
  isDeleteLoading,
  handleCancelClick,
}: IAlertBookingCancelDialogProps) => {
  return (
    <AlertDialogContent className="w-[90%]">
      <AlertDialogHeader>
        <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
        <AlertDialogDescription className="space-y-2">
          <span className="block">Política de estorno (paga online):</span>
          <span className="block rounded-lg bg-muted/40 p-3 text-xs">
            <strong>24h+ antes:</strong> reembolso de 100% do valor do serviço
            <br />
            <strong>2-24h antes:</strong> reembolso de 50% (multa de 50%)
            <br />
            <strong>menos de 2h:</strong> sem reembolso
            <br />
            <span className="mt-1 block opacity-80">
              A taxa de serviço da plataforma é retida em todos os casos.
            </span>
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-row gap-3">
        <AlertDialogCancel className="w-full mt-0">Voltar</AlertDialogCancel>
        <AlertDialogAction
          disabled={isDeleteLoading}
          className="w-full"
          onClick={handleCancelClick}
        >
          {isDeleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default AlertBookingCancelDialog;
