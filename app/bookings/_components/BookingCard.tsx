import { Card, CardContent } from "@/app/_components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import BookingBarberShopProfile from "./_BookingSubComponents/BookingBarbershopProfile";
import BookingBody from "./_BookingSubComponents/BookingBody";
import BookingDetails from "./_BookingSubComponents/BookingDetails";
import BookingFooter from "./_BookingSubComponents/BookingFooter";
import BookingHeader from "./_BookingSubComponents/BookingHeader";
import BookingLocationMap from "./_BookingSubComponents/BookingLocationMap";
import { IBookingBarberShopServiceProps } from "./interfaces";

const BookingCard = ({ booking }: IBookingBarberShopServiceProps) => {
  const serviceNames = booking.services.map((bs) => bs.service.name);
  const summary =
    serviceNames.length === 0
      ? "Reserva"
      : serviceNames.length === 1
      ? serviceNames[0]
      : `${serviceNames[0]} +${serviceNames.length - 1}`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card className="min-w-full">
          <CardContent className="py-0 flex px-0">
            <header className="flex flex-col gap-2 py-5 flex-[3] pl-5">
              <BookingHeader {...{ booking }} />
              <h2 className="font-bold">{summary}</h2>
              <div className="flex items-center gap-2">
                <BookingBarberShopProfile {...{ booking }} />
              </div>
            </header>
            <div className="flex flex-col items-center justify-center flex-1 border-l border-solid border-secondary">
              <BookingBody {...{ booking }} />
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="px-0">
        <SheetHeader className="px-5 text-left pb-6 border-b border-solid border-secondary">
          <SheetTitle>Informações da Reserva</SheetTitle>
        </SheetHeader>

        <div className="px-5">
          <BookingLocationMap {...{ booking }} />

          <div className="mt-6">
            <BookingHeader {...{ booking }} />
          </div>

          <div className="mt-7">
            <BookingDetails {...{ booking }} />
          </div>

          <div className="mt-10">
            <BookingFooter {...{ booking }} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingCard;
