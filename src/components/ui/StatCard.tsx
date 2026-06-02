import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
  accent?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-zinc-900 p-5 shadow-card transition-all duration-200",
        "hover:border-emerald-500/20 hover:shadow-glow",
        accent
          ? "border-emerald-500/30 bg-emerald-950/30"
          : "border-zinc-800",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              accent
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-800 text-emerald-500"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
