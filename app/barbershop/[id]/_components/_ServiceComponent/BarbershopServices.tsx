"use client";

import { ChevronLeft, ScissorsIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/app/_components/ui/button";
import { Sheet } from "@/app/_components/ui/sheet";
import { formatPrice } from "@/app/_utils/formatPrices";

import BookingMenu from "../_BookingMenu/BookingMenu";
import BarberSelectStep from "../_BarberStep/BarberSelectStep";
import BarbershopServiceCardList from "../_ServiceCardComponents/_BarberShopServiceCard/BarbershopServiceCardList";
import useBarbershopServices from "./model";
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
  const countLabel = selectedServices.length === 1 ? "serviço" : "serviços";

  const handleBackToBarbers = () => {
    clearSelectedServices();
    clearSelectedBarber();
  };

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <section className="py-4 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:mb-6">
          <button
            type="button"
            onClick={handleBackToBarbers}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <ChevronLeft size={16} />
            Trocar barbeiro
          </button>
          <span className="truncate text-sm font-medium">com {selectedBarber.name}</span>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
          <div className="min-w-0">
            <BarbershopServiceCardList services={selectedBarber.services} />
          </div>

          {/* Desktop sticky summary */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 animate-slide-up rounded-2xl border border-border bg-card p-6 shadow-card">
              <header className="mb-4 flex items-center gap-2">
                <ScissorsIcon size={16} className="text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Resumo
                </h3>
              </header>

              {hasSelection ? (
                <ul className="mb-5 flex flex-col gap-2.5 border-b border-border pb-5">
                  {selectedServices.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-center justify-between gap-2 text-sm animate-fade-in"
                    >
                      <span className="truncate">{service.name}</span>
                      <span className="shrink-0 font-semibold text-foreground">
                        {formatPrice(String(service.price))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-5 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  Selecione um ou mais serviços para reservar
                </p>
              )}

              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total
                </span>
                <span className="text-xl font-bold tracking-tight">
                  {formatPrice(String(totalPrice))}
                </span>
              </div>

              <Button
                type="button"
                variant="accent"
                size="lg"
                disabled={!hasSelection}
                onClick={openSheetAndVerifyUser}
                className="w-full"
              >
                Reservar
              </Button>

              {hasSelection && (
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  {selectedServices.length} {countLabel} · com {selectedBarber.name}
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile sticky bottom bar */}
      <div className="sticky bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur-md lg:hidden">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {hasSelection
              ? `${selectedServices.length} ${countLabel} selecionado${
                  selectedServices.length === 1 ? "" : "s"
                }`
              : "Nenhum serviço selecionado"}
          </span>
          <span className="text-base font-bold">{formatPrice(String(totalPrice))}</span>
        </div>

        <Button
          type="button"
          variant="accent"
          disabled={!hasSelection}
          onClick={openSheetAndVerifyUser}
          className="w-40"
        >
          Reservar
        </Button>
      </div>

      <BookingMenu barbershop={barbershopData} />
    </Sheet>
  );
};

export default BarbershopServices;
