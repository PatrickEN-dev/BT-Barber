import * as React from "react";

import { cn } from "@/app/_lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input bg-card px-4 py-2 text-sm shadow-soft ring-offset-background transition-all duration-300 ease-smooth file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-ring focus-visible:shadow-glow disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
