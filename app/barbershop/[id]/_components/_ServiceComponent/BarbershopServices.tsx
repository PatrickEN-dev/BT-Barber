"use client";

import { Barbershop, Service } from "@prisma/client";
import { Button } from "@/app/_components/ui/button";
import { Session } from "next-auth";
import useBarbershopServices from "./model";
import BarbershopServiceCardList from "../_ServiceCardComponents/_BarberShopServiceCard/BarbershopServiceCardList";

interface IBarbershopServicesProps {
  session: Session;
  barbershopData: Barbershop & {
    Service: Service[];
  };
}

const BarbershopServices = ({ session, barbershopData }: IBarbershopServicesProps) => {
  const { openSheetAndVerifyUser } = useBarbershopServices();

  return (
    <>
      <BarbershopServiceCardList {...{ barbershopData }} />

      <div className="items-center w-full flex justify-center pb-8 pt-2">
        <Button className="w-56" type="button" onClick={openSheetAndVerifyUser}>
          Reservar
        </Button>
      </div>
    </>
  );
};

export default BarbershopServices;
