"use client"
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  accent?: "default" | "warning" | "danger" | "info";
}

const accentStyles = {
  default: "bg-forest-50 text-forest-600 dark:bg-forest-800 dark:text-mint-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  info: "bg-mint-100 text-forest-700 dark:bg-forest-800 dark:text-mint-300",
};

export function StatCard({ title, value, icon: Icon, subtitle, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accentStyles[accent])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}