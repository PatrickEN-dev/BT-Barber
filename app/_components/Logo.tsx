import { ScissorsIcon } from "lucide-react";

import { cn } from "@/app/_lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

const sizes = {
  sm: { box: "h-7 w-7", icon: 14, text: "text-sm" },
  md: { box: "h-9 w-9", icon: 18, text: "text-base" },
  lg: { box: "h-12 w-12", icon: 22, text: "text-xl" },
};

const Logo = ({ className, size = "md", showWordmark = true }: LogoProps) => {
  const s = sizes[size];

  return (
    <span className={cn("group/logo inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "relative grid place-items-center rounded-xl bg-gradient-primary shadow-soft ring-1 ring-white/10 transition-all duration-300 ease-smooth group-hover/logo:shadow-glow",
          s.box
        )}
        aria-hidden
      >
        <ScissorsIcon
          size={s.icon}
          strokeWidth={2.5}
          className="text-white drop-shadow-sm transition-transform duration-500 ease-smooth group-hover/logo:rotate-[-12deg]"
        />
      </span>

      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight leading-none whitespace-nowrap",
            s.text
          )}
        >
          <span className="text-foreground">BT</span>
          <span className="text-muted-foreground/60">-</span>
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Barber
          </span>
        </span>
      )}
    </span>
  );
};

export default Logo;
