"use client";

import { useMemo } from "react";
import useBarbershopServices from "../../_ServiceComponent/model";
import { useLoading } from "@/app/_providers/loading";
import { useAuthGuard } from "@/app/_hooks/useAuthGuard";
import { Booking } from "@prisma/client";
import { generateDayTimeList } from "../../../_helpers/hours";
import { setHours, setMinutes } from "date-fns";
import { create } from "zustand";

interface IDayBookingsStore {
  dayBookings: Booking[];
  setDayBookings: (dayBookings: Booking[]) => void;
}

interface IHourStore {
  hour: string | undefined;
  setHour: (hour: string | undefined) => void;
}

export const useHourStoreBookingMenu = create<IHourStore>((set) => ({
  hour: undefined,
  setHour: (hour: string | undefined) => set(() => ({ hour })),
}));

export const dayBookingsStore = create<IDayBookingsStore>((set) => ({
  dayBookings: [],
  setDayBookings: (dayBookings: Booking[]) => set(() => ({ dayBookings })),
}));

const useBookingMenu = () => {
  const { user, isAuthenticated, checkAuthAndRedirect } = useAuthGuard({
    requireAuth: false, // Não redireciona automaticamente, apenas verifica
  });
  const { isLoading } = useLoading();

  const { hour, setHour, date, setDate } = useBarbershopServices();

  const { dayBookings, setDayBookings } = dayBookingsStore();

  const handleHourClick = (time: string) => setHour(time);

  const newDate = new Date();
  const hourSplitted = hour ? Number(hour?.split(":")[0]) : 0;
  const minuteSplitted = hour ? Number(hour?.split(":")[1]) : 0;

  const handleDateClick = (date: Date | undefined) => {
    setDate(date);
    setHour(undefined);
  };

  const timeList = useMemo(
    () =>
      date
        ? generateDayTimeList(date).filter((time) => {
            const hourSplitted = time ? Number(time?.split(":")[0]) : 0;
            const minuteSplitted = time ? Number(time?.split(":")[1]) : 0;

            const booking = dayBookings.find((booking) => {
              const bookingHour = booking.date.getHours();
              const bookingMinutes = booking.date.getMinutes();

              return bookingHour === hourSplitted && bookingMinutes === minuteSplitted;
            });

            if (!booking) return true;

            return false;
          })
        : [],
    [date, dayBookings]
  );

  const validateBookingData = () => {
    if (!hour || !date || !user) {
      console.error("ERROR: handleBookingSubmit values not found");
      return false;
    }
    return true;
  };

  const formatBookingDate = (date: Date, hour: string): Date =>
    setMinutes(setHours(date, hourSplitted), minuteSplitted);

  return {
    hour,
    date,
    dayBookings,
    setDayBookings,
    handleHourClick,
    handleDateClick,
    timeList,
    isLoading,
    validateBookingData,
    formatBookingDate,
    user,
    isAuthenticated,
    checkAuthAndRedirect,
  };
};

export default useBookingMenu;
