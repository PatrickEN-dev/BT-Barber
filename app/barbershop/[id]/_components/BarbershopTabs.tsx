"use client";

import { CalendarCheckIcon, StoreIcon } from "lucide-react";

import Container from "@/app/_components/Container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import type { SerializedProduct } from "@/app/_lib/serializers";

import BarbershopShop from "./_ShopComponent/BarbershopShop";
import { FloatingCartButton } from "./_ShopComponent/CartSheet";
import BarbershopServices from "./_ServiceComponent/BarbershopServices";
import type { BarbershopWithBarbers } from "../_actions/findBarbershopWithBarbers";

interface IBarbershopTabsProps {
  barbershopData: BarbershopWithBarbers;
  products: SerializedProduct[];
}

const BarbershopTabs = ({ barbershopData, products }: IBarbershopTabsProps) => {
  const showShop = barbershopData.hasShop;

  if (!showShop) {
    return (
      <Container className="pt-4 lg:pt-6">
        <BarbershopServices barbershopData={barbershopData} />
      </Container>
    );
  }

  return (
    <>
      <Container className="pt-4 lg:pt-6">
        <Tabs defaultValue="services">
          <TabsList className="w-full max-w-md sm:w-auto">
            <TabsTrigger value="services" className="flex-1">
              <CalendarCheckIcon size={16} />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex-1">
              <StoreIcon size={16} />
              Loja
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="services"
            forceMount
            className="mt-2 data-[state=inactive]:hidden"
          >
            <BarbershopServices barbershopData={barbershopData} />
          </TabsContent>

          <TabsContent
            value="shop"
            forceMount
            className="mt-4 pb-12 data-[state=inactive]:hidden"
          >
            <BarbershopShop shopName={barbershopData.name} products={products} />
          </TabsContent>
        </Tabs>
      </Container>

      <FloatingCartButton shopId={barbershopData.id} shopName={barbershopData.name} />
    </>
  );
};

export default BarbershopTabs;
