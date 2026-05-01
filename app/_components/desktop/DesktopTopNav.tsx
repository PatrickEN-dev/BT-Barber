"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/app/_lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  exact?: boolean;
  matchPaths?: string[];
}

interface DesktopTopNavProps {
  brand: React.ReactNode;
  items?: NavItem[];
  trailing?: React.ReactNode;
  centerSlot?: React.ReactNode;
  className?: string;
}

const isActive = (pathname: string, item: NavItem) => {
  if (item.matchPaths && item.matchPaths.length > 0) {
    return item.matchPaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
  }
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
};

const DesktopTopNav = ({
  brand,
  items = [],
  trailing,
  centerSlot,
  className,
}: DesktopTopNavProps) => {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 hidden w-full animate-slide-down border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 lg:block",
        className
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-8">
        <div className="flex shrink-0 items-center">{brand}</div>

        {items.length > 0 && (
          <nav className="flex items-center gap-1">
            {items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors duration-200",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {Icon ? <Icon size={16} /> : null}
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[17px] h-[2px] rounded-full bg-gradient-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {centerSlot && <div className="flex flex-1 justify-center">{centerSlot}</div>}
        {!centerSlot && <div className="flex-1" />}

        {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
      </div>
    </header>
  );
};

export default DesktopTopNav;
