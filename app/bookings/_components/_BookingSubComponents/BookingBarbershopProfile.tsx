import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { IBookingBarberShopServiceProps } from "../interfaces";

const BookingBarberShopProfile = ({ booking }: IBookingBarberShopServiceProps) => {
  const fallbackImage = booking.services[0]?.service.imageUrl ?? booking.barbershop.imageUrl;

  return (
    <>
      <Avatar className="h-6 w-6">
        <AvatarImage src={fallbackImage} />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>

      <h3 className="text-sm">{booking.barbershop.name}</h3>
    </>
  );
};

export default BookingBarberShopProfile;
