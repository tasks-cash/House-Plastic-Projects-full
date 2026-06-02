import type { UserRole } from "@/lib/constants";

export type AppModule =
  | "dashboard"
  | "sales"
  | "debts"
  | "expenses"
  | "employees"
  | "tasks"
  | "daily-reports";

const READ_ROLES: UserRole[] = [
  "owner",
  "admin",
  "manager",
  "worker",
  "accountant",
  "viewer",
];

/** Daily operations modules managers may create/update */
const MANAGER_WRITE_MODULES: AppModule[] = [
  "sales",
  "tasks",
  "daily-reports",
  "expenses",
  "dashboard",
];

/** Only owner and admin may delete records */
const DELETE_ROLES: UserRole[] = ["owner", "admin"];

export function canRead(role: UserRole): boolean {
  return READ_ROLES.includes(role);
}

/** Broad write check (any module). Prefer canWriteModule when scoped. */
export function canWrite(role: UserRole): boolean {
  if (role === "owner" || role === "admin" || role === "accountant") return true;
  if (role === "manager") return true;
  return false;
}

export function canWriteModule(role: UserRole, module: AppModule): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "accountant") return true;
  if (role === "manager") return MANAGER_WRITE_MODULES.includes(module);
  return false;
}

export function canDelete(role: UserRole): boolean {
  return DELETE_ROLES.includes(role);
}

/** Owner-only settings (e.g. assigning owner role to users) */
export function canManageOwnerSettings(role: UserRole): boolean {
  return role === "owner";
}

export function canAssignUserRole(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === "owner") return true;
  if (actorRole === "admin") return targetRole !== "owner";
  return false;
}

export function assertCanRead(role: UserRole): void {
  if (!canRead(role)) {
    throw new PermissionError("You do not have permission to view this resource");
  }
}

export function assertCanWrite(role: UserRole): void {
  if (!canWrite(role)) {
    throw new PermissionError("You do not have permission to modify this resource");
  }
}

export function assertCanWriteModule(role: UserRole, module: AppModule): void {
  if (!canWriteModule(role, module)) {
    throw new PermissionError("You do not have permission to modify this resource");
  }
}

export function assertCanDelete(role: UserRole): void {
  if (!canDelete(role)) {
    throw new PermissionError("You do not have permission to delete this resource");
  }
}

export function assertCanManageOwnerSettings(role: UserRole): void {
  if (!canManageOwnerSettings(role)) {
    throw new PermissionError("Only the owner can manage owner-level settings");
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}
