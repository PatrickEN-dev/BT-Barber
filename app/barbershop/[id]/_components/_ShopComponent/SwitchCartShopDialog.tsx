"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { useCartStore } from "@/app/_stores/cart";

const SwitchCartShopDialog = () => {
  const pendingShop = useCartStore((s) => s.pendingShop);
  const confirmSwitchShop = useCartStore((s) => s.confirmSwitchShop);
  const cancelSwitchShop = useCartStore((s) => s.cancelSwitchShop);

  const open = !!pendingShop;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) cancelSwitchShop();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Trocar barbearia do carrinho?</AlertDialogTitle>
          <AlertDialogDescription>
            Seu carrinho tem itens de outra barbearia. Para adicionar produtos da{" "}
            <strong className="text-foreground">{pendingShop?.name}</strong> precisamos limpar o
            carrinho atual. Tudo bem?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelSwitchShop}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmSwitchShop}>
            Limpar e adicionar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SwitchCartShopDialog;
