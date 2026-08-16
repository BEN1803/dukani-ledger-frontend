"use client"
import { cn } from "@/lib/utils";

interface LowStockBadgeProps {
  quantity: number;
  threshold?: number;
  className?: string;
}

export function LowStockBadge({ quantity, threshold = 5, className }: LowStockBadgeProps) {
  const isLow = quantity < threshold;
  const isOut = quantity <= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        isOut
          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          : isLow
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "bg-forest-50 text-forest-700 dark:bg-forest-800 dark:text-mint-300",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOut
            ? "bg-red-600"
            : isLow
            ? "bg-amber-500"
            : "bg-forest-600 dark:bg-mint-400"
        )}
      />
      {isOut ? "Out of stock" : isLow ? `${quantity} left` : "In stock"}
    </span>
  );
}