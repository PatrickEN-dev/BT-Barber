import Image from "next/image";
import { Card, CardContent } from "@/app/_components/ui/card";
import { formatPrice } from "@/app/_utils/formatPrices";
import ServiceFormSheet from "./ServiceFormSheet";
import DeleteServiceButton from "./DeleteServiceButton";
import type { listShopServices } from "@/app/admin/_actions/services";

type Services = Awaited<ReturnType<typeof listShopServices>>;

interface IProps {
  services: Services;
  shopId: string;
}

const ServicesList = ({ services, shopId }: IProps) => (
  <ul className="flex flex-col gap-2">
    {services.map((s) => (
      <li key={s.id}>
        <Card>
          <CardContent className="p-3 flex gap-3">
            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary shrink-0">
              {s.imageUrl && (
                <Image src={s.imageUrl} alt={s.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <p className="text-sm font-semibold truncate">{s.name}</p>
              <p className="text-[11px] text-gray-400 line-clamp-2">{s.description}</p>
              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-[11px] text-gray-500">
                  {s.barbersCount} barbeiros • {s.bookingsCount} agendamentos
                </span>
                <span className="text-sm font-bold text-primary">{formatPrice(s.price)}</span>
              </div>
            </div>
          </CardContent>
          <div className="px-3 pb-3 flex gap-2">
            <ServiceFormSheet shopId={shopId} mode="edit" service={s} />
            <DeleteServiceButton shopId={shopId} serviceId={s.id} serviceName={s.name} />
          </div>
        </Card>
      </li>
    ))}
  </ul>
);

export default ServicesList;
