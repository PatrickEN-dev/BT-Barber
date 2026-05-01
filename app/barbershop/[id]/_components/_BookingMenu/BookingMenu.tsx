"use client";

import CalendarComponent from "@/app/_components/CalendarComponent";
import CheckoutDialog from "@/app/_components/checkout/CheckoutDialog";
import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/app/_components/ui/sheet";
import { useEffect, useState } from "react";
import TimeListComponent from "./TimeListComponent";
import { Barbershop } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import ServiceCardDetails from "./ServiceCardDetails";
import { format } from "date-fns";
import { saveBooking } from "../../_actions/saveBooking";
import { BookingSlotTakenError } from "../../_actions/_errors";
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
}

const BookingMenu = ({ barbershop }: IBookingMenuProps) => {
  const { push } = useRouter();
  const { isLoading, setIsLoading } = useLoading();
  const [checkoutBooking, setCheckoutBooking] = useState<{
    bookingId: string;
    total: string;
    when: Date;
  } | null>(null);

  const {
    setSheetIsOpen,
    selectedServices,
    clearSelectedServices,
    selectedBarber,
    hour,
    setHour,
    date,
    setDate,
  } = useBarbershopServices();

  const {
    timeList,
    validateBookingData,
    formatBookingDate,
    setDayBookings,
    handleHourClick,
    handleDateClick,
    user,
    ensureAuth,
  } = useBookingMenu();

  useEffect(() => {
    if (!date || !selectedBarber) return;

    const refreshAvailableHours = async () => {
      const dayBookingsData = await getDayBookings(barbershop.id, date, selectedBarber.id);
      setDayBookings(dayBookingsData);
    };

    refreshAvailableHours();
  }, [date, barbershop.id, selectedBarber, setDayBookings]);

  const saveBookingAndCheckout = async (newDateFormatted: Date) => {
    if (!selectedBarber) return;

    const result = await saveBooking({
      barbershopId: barbershop.id,
      barberId: selectedBarber.id,
      userId: user!.id,
      date: newDateFormatted,
      serviceIds: selectedServices.map((s) => s.id),
    });

    setSheetIsOpen(false);
    setHour(undefined);
    setDate(undefined);
    clearSelectedServices();

    setCheckoutBooking({
      bookingId: result.bookingId,
      total: result.total,
      when: newDateFormatted,
    });
  };

  const handlePaid = () => {
    if (!checkoutBooking) return;
    const when = format(checkoutBooking.when, "dd 'de' MMMM 'às' HH':'mm", { locale: ptBR });
    setCheckoutBooking(null);
    toast.success("Reserva confirmada!", {
      description: `${selectedBarber?.name ?? "Seu barbeiro"}, ${when}.`,
      action: { label: "Visualizar", onClick: () => push("/bookings") },
    });
  };

  const handleBookingSubmit = async () => {
    if (!ensureAuth()) return;

    setIsLoading(true);
    try {
      if (!validateBookingData()) return;

      const newDateFormatted = formatBookingDate(date!, hour!);

      await saveBookingAndCheckout(newDateFormatted);
    } catch (error) {
      if (error instanceof Error && error.name === BookingSlotTakenError.name) {
        toast.error(error.message);
      } else {
        console.error(error);
        toast.error("Não foi possível concluir a reserva. Tente novamente.");
      }
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

      {checkoutBooking && (
        <CheckoutDialog
          open={!!checkoutBooking}
          onOpenChange={(next) => {
            if (!next) setCheckoutBooking(null);
          }}
          kind="booking"
          targetId={checkoutBooking.bookingId}
          totalBRL={checkoutBooking.total}
          onPaid={handlePaid}
          returnPath="/bookings"
        />
      )}
    </SheetContent>
  );
};

export default BookingMenu;
