"use client";

import { create } from "zustand";

interface IDateStore {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

interface IHourStore {
  hour: string | undefined;
  setHour: (hour: string | undefined) => void;
}

export const useDateStore = create<IDateStore>((set) => ({
  date: new Date(),
  setDate: (date: Date | undefined) => set(() => ({ date })),
}));

export const useHourStore = create<IHourStore>((set) => ({
  hour: undefined,
  setHour: (hour: string | undefined) => set(() => ({ hour })),
}));
