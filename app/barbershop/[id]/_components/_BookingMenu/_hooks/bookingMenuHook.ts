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

export const dayBookingsStore = create<IDayBookingsStore>((set) => ({
  dayBookings: [],
  setDayBookings: (dayBookings) => set({ dayBookings }),
}));

const useBookingMenu = () => {
  const { user, isAuthenticated, ensureAuth } = useAuthGuard();
  const { isLoading } = useLoading();
  const { hour, setHour, date, setDate, selectedServices, selectedBarber } =
    useBarbershopServices();
  const { dayBookings, setDayBookings } = dayBookingsStore();

  const handleHourClick = (time: string) => setHour(time);

  const handleDateClick = (next: Date | undefined) => {
    setDate(next);
    setHour(undefined);
  };

  const timeList = useMemo(
    () =>
      date
        ? generateDayTimeList(date).filter((time) => {
            const [hh, mm] = time.split(":").map(Number);
            return !dayBookings.some(
              (b) => b.date.getHours() === hh && b.date.getMinutes() === mm
            );
          })
        : [],
    [date, dayBookings]
  );

  const validateBookingData = () => {
    if (!hour || !date || !user || !selectedBarber || selectedServices.length === 0) {
      console.error("ERROR: handleBookingSubmit values not found");
      return false;
    }
    return true;
  };

  const formatBookingDate = (d: Date, h: string): Date => {
    const [hh, mm] = h.split(":").map(Number);
    return setMinutes(setHours(d, hh), mm);
  };

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
    ensureAuth,
  };
};

export default useBookingMenu;
