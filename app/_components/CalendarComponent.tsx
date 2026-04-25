"use client";

import React from "react";
import { Calendar } from "./ui/calendar";
import { ptBR } from "date-fns/locale";
import useBarbershopServices from "../barbershop/[id]/_components/_ServiceComponent/model";

interface ICalendarComponentProps {
  // date: Date | undefined;
  // setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  // newDate: Date;
  handleDateClick: (date: Date | undefined) => void;
}

const CalendarComponent = ({ handleDateClick }: ICalendarComponentProps) => {
  const { date } = useBarbershopServices();
  const newDate = new Date();
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleDateClick}
      fromDate={newDate}
      locale={ptBR}
      className="mt-6"
      styles={{
        head_cell: {
          width: "100%",
          textTransform: "capitalize",
        },
        cell: {
          width: "100%",
        },
        button: {
          width: "100%",
        },
        nav_button_previous: {
          width: "32px",
          height: "32px",
        },
        nav_button_next: {
          width: "32px",
          height: "32px",
        },
        caption: {
          textTransform: "capitalize",
        },
      }}
    />
  );
};

export default CalendarComponent;
