"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";

import { updateUserTheme } from "@/app/_actions/user";
import { cn } from "@/app/_lib/utils";
import { Button } from "./ui/button";

interface ThemeToggleProps {
  variant?: "icon" | "full";
  className?: string;
}

const ThemeToggle = ({ variant = "icon", className }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const persistRemote = (next: "light" | "dark") => {
    if (!session?.user) return;
    startTransition(() => {
      updateUserTheme(next.toUpperCase() as "LIGHT" | "DARK").catch(() => {});
    });
  };

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    persistRemote(next);
  };

  const label = isDark ? "Mudar para modo claro" : "Mudar para modo escuro";

  if (variant === "full") {
    if (!mounted) {
      return (
        <Button
          type="button"
          variant="outline"
          className={cn("justify-start", className)}
          disabled
        >
          <MoonIcon size={18} className="mr-2 text-accent opacity-50" />
          Tema
        </Button>
      );
    }
    return (
      <Button
        type="button"
        variant="outline"
        className={cn("justify-start", className)}
        onClick={toggle}
        aria-label={label}
      >
        {isDark ? (
          <SunIcon size={18} className="mr-2 text-accent" />
        ) : (
          <MoonIcon size={18} className="mr-2 text-accent" />
        )}
        {isDark ? "Modo claro" : "Modo escuro"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={label}
      className={cn("relative overflow-hidden", className)}
    >
      <MoonIcon
        size={18}
        className="absolute text-accent transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
      />
      <SunIcon
        size={18}
        className="absolute text-accent transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100"
      />
      <span className="sr-only">{label}</span>
    </Button>
  );
};

export default ThemeToggle;
