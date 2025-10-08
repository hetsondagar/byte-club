import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface NeonCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "cyan" | "violet" | "blue";
  glow?: boolean;
}

const NeonCard = forwardRef<HTMLDivElement, NeonCardProps>(
  ({ className, variant = "default", glow = false, ...props }, ref) => {
    const glowClasses = {
      default: glow ? "hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]" : "",
      cyan: glow ? "hover:shadow-[0_0_30px_hsl(180_100%_50%/0.5)]" : "",
      violet: glow ? "hover:shadow-[0_0_30px_hsl(270_100%_62%/0.5)]" : "",
      blue: glow ? "hover:shadow-[0_0_30px_hsl(220_100%_51%/0.5)]" : "",
    };

    const borderClasses = {
      default: "border-primary/20",
      cyan: "border-[hsl(180_100%_50%/0.3)]",
      violet: "border-[hsl(270_100%_62%/0.3)]",
      blue: "border-[hsl(220_100%_51%/0.3)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card p-6 transition-all duration-300 hover:border-opacity-80 hover:-translate-y-1",
          borderClasses[variant],
          glowClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);

NeonCard.displayName = "NeonCard";

export { NeonCard };
