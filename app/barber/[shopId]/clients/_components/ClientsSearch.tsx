"use client";

import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "@/app/_components/ui/input";
import { useEffect, useState } from "react";

interface IProps {
  shopId: string;
  initial: string;
}

const ClientsSearch = ({ shopId, initial }: IProps) => {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("search", value.trim());
      router.push(`/barber/${shopId}/clients?${params.toString()}`);
    }, 300);
    return () => clearTimeout(t);
  }, [value, router, shopId]);

  return (
    <div className="relative">
      <SearchIcon
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nome ou e-mail"
        className="pl-9"
      />
    </div>
  );
};

export default ClientsSearch;
