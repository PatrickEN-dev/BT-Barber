"use client";

import { Button } from "@/app/_components/ui/button";
import { Sheet } from "@/app/_components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import useBarbershopServices from "./model";
import BarbershopServiceCardList from "../_ServiceCardComponents/_BarberShopServiceCard/BarbershopServiceCardList";
import BookingMenu from "../_BookingMenu/BookingMenu";
import BarberSelectStep from "../_BarberStep/BarberSelectStep";
import { formatPrice } from "@/app/_utils/formatPrices";
import type { BarbershopWithBarbers } from "../../_actions/findBarbershopWithBarbers";

interface IBarbershopServicesProps {
  barbershopData: BarbershopWithBarbers;
}

const BarbershopServices = ({ barbershopData }: IBarbershopServicesProps) => {
  const {
    sheetIsOpen,
    setSheetIsOpen,
    selectedServices,
    clearSelectedServices,
    selectedBarber,
    clearSelectedBarber,
    openSheetAndVerifyUser,
  } = useBarbershopServices();

  useEffect(() => {
    if (selectedBarber && selectedBarber.barbershopId !== barbershopData.id) {
      clearSelectedBarber();
      clearSelectedServices();
    }
  }, [
    barbershopData.id,
    selectedBarber,
    clearSelectedBarber,
    clearSelectedServices,
  ]);

  if (!selectedBarber) {
    return <BarberSelectStep shopId={barbershopData.id} barbers={barbershopData.Barbers} />;
  }

  const totalPrice = selectedServices.reduce((acc, s) => acc + Number(s.price), 0);
  const hasSelection = selectedServices.length > 0;

  const handleBackToBarbers = () => {
    clearSelectedServices();
    clearSelectedBarber();
  };

  return (
    <>
      <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBackToBarbers}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} />
          Trocar barbeiro
        </button>
        <span className="text-sm font-medium truncate">com {selectedBarber.name}</span>
      </div>

      <BarbershopServiceCardList services={selectedBarber.services} />

      <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-secondary px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase">
            {hasSelection
              ? `${selectedServices.length} ${
                  selectedServices.length === 1 ? "serviço" : "serviços"
                } selecionado${selectedServices.length === 1 ? "" : "s"}`
              : "Nenhum serviço selecionado"}
          </span>
          <span className="font-bold">{formatPrice(String(totalPrice))}</span>
        </div>

        <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
          <Button
            type="button"
            disabled={!hasSelection}
            onClick={openSheetAndVerifyUser}
            className="w-40"
          >
            Reservar
          </Button>

          <BookingMenu barbershop={barbershopData} />
        </Sheet>
      </div>
    </>
  );
};

export default BarbershopServices;
