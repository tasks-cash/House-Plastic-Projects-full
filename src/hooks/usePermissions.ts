"use client";

import {
  canDelete,
  canWrite,
  canWriteModule,
  type AppModule,
} from "@/lib/permissions";
import type { UserRole } from "@/lib/constants";
import { useSession } from "./useSession";

function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ar)(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || "/";
}

function hrefToModule(href: string): AppModule | null {
  const normalized = stripLocale(href);
  if (normalized === "/dashboard") return "dashboard";
  if (normalized.startsWith("/sales")) return "sales";
  if (normalized.startsWith("/debts")) return "debts";
  if (normalized.startsWith("/expenses")) return "expenses";
  if (normalized.startsWith("/employees")) return "employees";
  if (normalized.startsWith("/tasks")) return "tasks";
  if (normalized.startsWith("/daily-reports")) return "daily-reports";
  return null;
}

export function usePermissions() {
  const { user, loading } = useSession();

  const role = user?.role as UserRole | undefined;

  return {
    user,
    loading,
    role,
    roleLabel: user?.roleLabel,
    canWrite: role ? canWrite(role) : false,
    canDelete: role ? canDelete(role) : false,
    canWriteModule: (module: AppModule) => (role ? canWriteModule(role, module) : false),
    canWritePage: (pathname: string) => {
      const pageModule = hrefToModule(pathname);
      if (!pageModule || !role) return false;
      return canWriteModule(role, pageModule);
    },
  };
}
