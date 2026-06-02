import { cn } from "@/lib/utils";

type BadgeVariant =
  | "paid"
  | "partial"
  | "pending"
  | "unpaid"
  | "active"
  | "overdue"
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  unpaid: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  overdue: "bg-red-500/15 text-red-400 border-red-500/30",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  danger: "bg-red-500/15 text-red-400 border-red-500/30",
  default: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    paid: "paid",
    partial: "partial",
    pending: "pending",
    unpaid: "unpaid",
    active: "active",
    overdue: "overdue",
    inactive: "default",
    submitted: "info",
    missing: "danger",
    "needs review": "warning",
    approved: "success",
    "in progress": "info",
    done: "success",
    late: "danger",
    low: "default",
    medium: "info",
    high: "warning",
    urgent: "danger",
  };
  return map[status.toLowerCase()] || "default";
}
