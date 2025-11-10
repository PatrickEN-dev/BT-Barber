"use client";

import CalendarComponent from "@/app/_components/CalendarComponent";
import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/app/_components/ui/sheet";
import { useEffect } from "react";
import TimeListComponent from "./TimeListComponent";
import { Barbershop } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import ServiceCardDetails from "./ServiceCardDetails";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { saveBooking } from "../../_actions/saveBooking";
import { useLoading } from "@/app/_providers/loading";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { getDayBookings } from "../../_actions/getDayBookings";
import useBarbershopServices from "../_ServiceComponent/model";
import useBookingMenu from "./_hooks/bookingMenuHook";

interface IBookingMenuProps {
  barbershop: Barbershop;
  // hour: string | undefined;
  // setHour: Dispatch<SetStateAction<string | undefined>>;
  // date: Date | undefined;
  // setDate: Dispatch<SetStateAction<Date | undefined>>;
  // newDate: Date;
}

const BookingMenu = ({ barbershop }: IBookingMenuProps) => {
  const { push } = useRouter();
  const { isLoading, setIsLoading } = useLoading();

  const { setSheetIsOpen, sheetIsOpen, selectedServices, hour, setHour, date, setDate } =
    useBarbershopServices();

  const {
    timeList,
    validateBookingData,
    formatBookingDate,
    setDayBookings,
    handleHourClick,
    handleDateClick,
    user,
    checkAuthAndRedirect,
  } = useBookingMenu();

  useEffect(() => {
    if (!date) return console.error("Theren't date on useEffect getDayBookings");

    const refreshAvailableHours = async () => {
      // preciso passar barberId no futuro
      const dayBookingsData = await getDayBookings(barbershop.id, date);
      setDayBookings(dayBookingsData);
    };

    refreshAvailableHours();
  }, [date, barbershop.id, setDayBookings]);

  const saveBookingAndNotify = async (newDateFormatted: Date) => {
    for (const service of selectedServices) {
      await saveBooking({
        barbershopId: barbershop.id,
        serviceId: service.id,
        userId: (user as any).id,
        date: newDateFormatted,
      });
    }
    setSheetIsOpen(false);
    setHour(undefined);
    setDate(undefined);

    toast("Reserva realizada com sucesso!", {
      description: `${format(newDateFormatted, "'Para' dd 'de' MMMM 'às' HH':'mm'.'", {
        locale: ptBR,
      })}`,
      action: {
        label: "Visualizar",
        onClick: () => push("/bookings"),
      },
    });
  };

  const handleBookingSubmit = async () => {
    // Verifica se o usuário está autenticado antes de prosseguir
    if (!checkAuthAndRedirect()) {
      return;
    }

    setIsLoading(true);
    try {
      if (!validateBookingData()) return;

      const newDateFormatted = formatBookingDate(date!, hour!);

      await saveBookingAndNotify(newDateFormatted);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SheetContent className="p-0 max-h-[100vh] overflow-auto pb-4">
      <SheetHeader className="text-left px-5 py-6 border-solid border-secondary">
        <SheetTitle>Fazer reserva</SheetTitle>
      </SheetHeader>

      <div className="py-1">
        <CalendarComponent {...{ date, setDate, handleDateClick }} />
      </div>

      {date && <TimeListComponent {...{ hour, timeList, handleHourClick }} />}

      <div className="py-6 px-5 border-t border-solid border-secondary">
        <ServiceCardDetails {...{ date, hour, barbershop }} />
      </div>

      <SheetFooter className="px-5">
        <Button disabled={!date || !hour || isLoading} onClick={handleBookingSubmit}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmar reserva
        </Button>
      </SheetFooter>
    </SheetContent>
  );
};

export default BookingMenu;
