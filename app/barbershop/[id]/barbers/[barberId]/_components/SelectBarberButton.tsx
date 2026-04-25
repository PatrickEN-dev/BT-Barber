"use client";

import { Button } from "@/app/_components/ui/button";
import { useRouter } from "next/navigation";
import useBarbershopServices from "../../../_components/_ServiceComponent/model";
import type { BarberWithServices } from "../../../_actions/findBarbershopWithBarbers";

interface ISelectBarberButtonProps {
  barber: BarberWithServices;
  shopId: string;
}

const SelectBarberButton = ({ barber, shopId }: ISelectBarberButtonProps) => {
  const { selectBarber } = useBarbershopServices();
  const router = useRouter();

  const handleSelect = () => {
    selectBarber(barber);
    router.push(`/barbershop/${shopId}`);
  };

  return (
    <Button type="button" onClick={handleSelect} className="w-full">
      Selecionar este barbeiro
    </Button>
  );
};

export default SelectBarberButton;
