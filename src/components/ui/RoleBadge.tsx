"use client";

import { Badge } from "@/components/ui/Badge";
import type { UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

const roleVariant: Record<UserRole, "success" | "info" | "warning" | "default"> = {
  owner: "success",
  admin: "info",
  manager: "warning",
  worker: "default",
  accountant: "default",
  viewer: "default",
};

interface RoleBadgeProps {
  role: UserRole;
  label: string;
  className?: string;
}

export function RoleBadge({ role, label, className }: RoleBadgeProps) {
  return (
    <Badge variant={roleVariant[role] ?? "default"} className={cn("shrink-0", className)}>
      {label}
    </Badge>
  );
}
