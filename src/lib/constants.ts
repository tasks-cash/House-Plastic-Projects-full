/** Shared option lists — DB values (snake_case) with display labels for UI/mappers. */

export const USER_ROLES = [
  "owner",
  "admin",
  "manager",
  "worker",
  "accountant",
  "viewer",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  worker: "Worker",
  accountant: "Accountant",
  viewer: "Viewer",
};

export const SALE_STATUSES = ["paid", "partial", "unpaid"] as const;
export type SaleStatus = (typeof SALE_STATUSES)[number];

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
};

export const DEBT_DIRECTIONS = ["we_owe", "owed_to_us"] as const;
export type DebtDirection = (typeof DEBT_DIRECTIONS)[number];

export const DEBT_DIRECTION_LABELS: Record<DebtDirection, string> = {
  we_owe: "We Owe",
  owed_to_us: "Owed To Us",
};

export const DEBT_CATEGORIES = ["investment", "private"] as const;
export type DebtCategory = (typeof DEBT_CATEGORIES)[number];

export const DEBT_CATEGORY_LABELS: Record<DebtCategory, string> = {
  investment: "Investment",
  private: "Private",
};

export const DEBT_STATUSES = ["active", "paid", "overdue"] as const;
export type DebtStatus = (typeof DEBT_STATUSES)[number];

export const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  active: "Active",
  paid: "Paid",
  overdue: "Overdue",
};

export const DEBT_SOURCE_TYPES = [
  "land",
  "greenhouse",
  "irrigation",
  "medicine",
  "fertilizer",
  "worker",
  "personal",
  "other",
] as const;
export type DebtSourceType = (typeof DEBT_SOURCE_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  "medicine",
  "fertilizer",
  "workers",
  "water",
  "electricity",
  "transport",
  "maintenance",
  "fuel",
  "greenhouse",
  "irrigation",
  "plastic",
  "strings",
  "boxes",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  medicine: "Medicine",
  fertilizer: "Fertilizer",
  workers: "Workers",
  water: "Water",
  electricity: "Electricity",
  transport: "Transport",
  maintenance: "Maintenance",
  fuel: "Fuel",
  greenhouse: "Greenhouse",
  irrigation: "Irrigation",
  plastic: "Plastic",
  strings: "Strings",
  boxes: "Boxes",
  other: "Other",
};

/** Categories treated as capitalized / asset-related expenses in reports. */
export const CAPITALIZED_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "greenhouse",
  "irrigation",
  "maintenance",
];

export const PAYMENT_METHODS = ["cash", "bank", "debt", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank: "Bank",
  debt: "Debt",
  other: "Other",
};

export const greenhouses = ["GH-A", "GH-B", "GH-C", "All"] as const;

export const products = ["Tomato", "Tomatoes", "Cucumbers", "Peppers", "Lettuce", "Herbs"] as const;

export const units = ["kg", "quintal"] as const;

export const expenseCategoriesDisplay = EXPENSE_CATEGORIES.map(
  (value) => EXPENSE_CATEGORY_LABELS[value]
);

export const EMPLOYEE_STATUSES = ["active", "inactive"] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const EMPLOYEE_ROLES = [
  "owner",
  "manager",
  "worker",
  "accountant",
  "viewer",
] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  owner: "Owner",
  manager: "Manager",
  worker: "Worker",
  accountant: "Accountant",
  viewer: "Viewer",
};

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TASK_STATUSES = ["pending", "in_progress", "done", "late"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  late: "Late",
};

export const REPORT_STATUSES = [
  "submitted",
  "missing",
  "needs_review",
  "approved",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  submitted: "Submitted",
  missing: "Missing",
  needs_review: "Needs Review",
  approved: "Approved",
};

export const LOGIN_METHODS = ["phone", "email", "username"] as const;
export type LoginMethod = (typeof LOGIN_METHODS)[number];
