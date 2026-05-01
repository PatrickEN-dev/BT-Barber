"use client";

import { create } from "zustand";
import { useDateStore, useHourStore } from "../_hooks/useDate";
import { useAuthGuard } from "@/app/_hooks/useAuthGuard";
import type { BarberWithServices } from "../../_actions/findBarbershopWithBarbers";
import type { SerializedService } from "@/app/_lib/serializers";

interface IStore {
  sheetIsOpen: boolean;
  setSheetIsOpen: (value: boolean) => void;
}

interface IServiceStore {
  selectedServices: SerializedService[];
  setSelectedServices: (
    services: SerializedService[] | ((prev: SerializedService[]) => SerializedService[])
  ) => void;
  toggleService: (service: SerializedService) => void;
  clearSelectedServices: () => void;
}

interface IBarberStore {
  selectedBarber: BarberWithServices | null;
  setSelectedBarber: (barber: BarberWithServices | null) => void;
  clearSelectedBarber: () => void;
}

const useStore = create<IStore>((set) => ({
  sheetIsOpen: false,
  setSheetIsOpen: (value: boolean) => set(() => ({ sheetIsOpen: value })),
}));

const useSelectedServices = create<IServiceStore>((set) => ({
  selectedServices: [],
  setSelectedServices: (services) =>
    set((state) => ({
      selectedServices:
        typeof services === "function" ? services(state.selectedServices) : services,
    })),
  toggleService: (service) =>
    set((state) => {
      const exists = state.selectedServices.some((s) => s.id === service.id);
      return {
        selectedServices: exists
          ? state.selectedServices.filter((s) => s.id !== service.id)
          : [...state.selectedServices, service],
      };
    }),
  clearSelectedServices: () => set({ selectedServices: [] }),
}));

const useSelectedBarberStore = create<IBarberStore>((set) => ({
  selectedBarber: null,
  setSelectedBarber: (barber) => set({ selectedBarber: barber }),
  clearSelectedBarber: () => set({ selectedBarber: null }),
}));

const useBarbershopServices = () => {
  const { sheetIsOpen, setSheetIsOpen } = useStore();
  const { selectedServices, setSelectedServices, toggleService, clearSelectedServices } =
    useSelectedServices();
  const { selectedBarber, setSelectedBarber, clearSelectedBarber } = useSelectedBarberStore();
  const { hour, setHour } = useHourStore();
  const { date, setDate } = useDateStore();
  const { ensureAuth } = useAuthGuard();

  const isServiceSelected = (serviceId: string) =>
    selectedServices.some((s) => s.id === serviceId);

  const selectBarber = (barber: BarberWithServices) => {
    setSelectedBarber(barber);
    clearSelectedServices();
  };

  const openSheetAndVerifyUser = () => {
    if (!ensureAuth()) return;
    setSheetIsOpen(true);
  };

  return {
    sheetIsOpen,
    setSheetIsOpen,
    selectedServices,
    setSelectedServices,
    toggleService,
    clearSelectedServices,
    isServiceSelected,
    selectedBarber,
    setSelectedBarber,
    selectBarber,
    clearSelectedBarber,
    openSheetAndVerifyUser,
    hour,
    setHour,
    date,
    setDate,
  };
};

export default useBarbershopServices;
