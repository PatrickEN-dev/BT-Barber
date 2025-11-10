"use client";

import verifyToSignIn from "@/app/_utils/verifyAuthentication";
import { Service } from "@prisma/client";
import { Session } from "next-auth";
import { create } from "zustand";
import { useDateStore, useHourStore } from "../_hooks/useDate";
import { findUniqueBarberShop } from "@/app/_actions/barberShop";
import { useAuthGuard } from "@/app/_hooks/useAuthGuard";

interface IStore {
  sheetIsOpen: boolean;
  setSheetIsOpen: (value: boolean) => void;
}

interface IServiceStore {
  selectedServices: Service[];
  setSelectedServices: (services: Service[]) => void;
}

const useStore = create<IStore>((set) => ({
  sheetIsOpen: false,
  setSheetIsOpen: (value: boolean) => set(() => ({ sheetIsOpen: value })),
}));

const useSelectedServices = create<IServiceStore>((set) => ({
  selectedServices: [],
  setSelectedServices: (services: Service[] | ((prevServices: Service[]) => Service[])) =>
    set((state) => ({
      selectedServices:
        typeof services === "function" ? services(state.selectedServices) : services,
    })),
}));

const useBarbershopServices = () => {
  const { sheetIsOpen, setSheetIsOpen } = useStore();
  const { selectedServices, setSelectedServices } = useSelectedServices();
  const { hour, setHour } = useHourStore();
  const { date, setDate } = useDateStore();
  const { isAuthenticated, redirectToLogin } = useAuthGuard({ requireAuth: false });

  const handleVerifyToSignInClick = async (session: Session): Promise<void> => {
    await verifyToSignIn({ value: !!session?.user, signInValue: "google" });
  };

  const findUniqueBarberShopInfo = async (params: any) => {
    const result = await findUniqueBarberShop({ id: params.id });
    return result;
  };

  const openSheetAndVerifyUser = () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }
    setSheetIsOpen(true);
  };

  const handleServiceSelect = (selectedService: Service | undefined, currentService: Service) => {
    if (selectedService) {
      setSelectedServices([...selectedServices, selectedService]);
    } else {
      setSelectedServices(
        selectedServices.filter((service: Service) => service.id !== currentService.id)
      );
    }
  };

  const handleCheckboxChange = (isChecked: boolean, service: Service) => {
    if (isChecked) {
      handleServiceSelect(service, service);
    } else {
      handleServiceSelect(undefined, service);
    }
  };

  return {
    findUniqueBarberShopInfo,
    sheetIsOpen,
    setSheetIsOpen,
    selectedServices,
    setSelectedServices,
    handleServiceSelect,
    openSheetAndVerifyUser,
    handleCheckboxChange,
    hour,
    setHour,
    date,
    setDate,
  };
};

export default useBarbershopServices;
