"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, LayoutDashboardIcon, ScissorsIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";

interface IProps {
  shopId: string;
}

const AdminBottomNav = ({ shopId }: IProps) => {
  const pathname = usePathname();
  const base = `/admin/${shopId}`;

  const items = [
    { href: `${base}/dashboard`, label: "Início", icon: LayoutDashboardIcon },
    { href: `${base}/bookings`, label: "Agenda", icon: CalendarIcon },
    { href: `${base}/barbers`, label: "Equipe", icon: ScissorsIcon },
    { href: `${base}/clients`, label: "Clientes", icon: UsersIcon },
    { href: `${base}/services`, label: "Ajustes", icon: SettingsIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-secondary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative">
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary" />
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.06em] font-medium transition-colors",
                  active ? "text-primary" : "text-gray-500 hover:text-foreground"
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AdminBottomNav;
