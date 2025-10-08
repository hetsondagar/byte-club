import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-primary hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)]",
        secondary: "border-secondary/30 bg-secondary/10 text-secondary hover:shadow-[0_0_15px_hsl(var(--secondary)/0.4)]",
        accent: "border-accent/30 bg-accent/10 text-accent hover:shadow-[0_0_15px_hsl(var(--accent)/0.4)]",
        success: "border-[hsl(140_100%_50%/0.3)] bg-[hsl(140_100%_50%/0.1)] text-[hsl(140_100%_50%)] hover:shadow-[0_0_15px_hsl(140_100%_50%/0.4)]",
        easy: "border-[hsl(140_100%_50%/0.3)] bg-[hsl(140_100%_50%/0.1)] text-[hsl(140_100%_50%)]",
        medium: "border-[hsl(45_100%_50%/0.3)] bg-[hsl(45_100%_50%/0.1)] text-[hsl(45_100%_50%)]",
        hard: "border-[hsl(0_100%_50%/0.3)] bg-[hsl(0_100%_50%/0.1)] text-[hsl(0_100%_50%)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface NeonBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const NeonBadge = forwardRef<HTMLDivElement, NeonBadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    );
  }
);

NeonBadge.displayName = "NeonBadge";

export { NeonBadge, badgeVariants };
