import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface XPBarProps {
  current: number;
  max: number;
  level?: number;
  className?: string;
  showLabel?: boolean;
}

export function XPBar({ current, max, level, className, showLabel = true }: XPBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {level !== undefined && `Level ${level} • `}
            {current.toLocaleString()} / {max.toLocaleString()} XP
          </span>
          <span className="text-primary font-semibold">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-3 bg-muted rounded-full overflow-hidden border border-primary/30">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            boxShadow: "0 0 10px hsl(var(--primary) / 0.5)",
          }}
        />
      </div>
    </div>
  );
}
