import {
  DEBT_CATEGORIES,
  DEBT_CATEGORY_LABELS,
  DEBT_DIRECTIONS,
  DEBT_DIRECTION_LABELS,
  EMPLOYEE_ROLES,
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_STATUSES,
  EMPLOYEE_STATUS_LABELS,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  SALE_STATUSES,
  SALE_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  greenhouses,
  products,
  units,
} from "@/lib/constants";

export function toOptions<T extends string>(
  values: readonly T[],
  labels: Record<T, string>
): { value: T; label: string }[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

export const greenhouseOptions = greenhouses.map((g) => ({ value: g, label: g }));
export const productOptions = products.map((p) => ({ value: p, label: p }));
export const unitOptions = units.map((u) => ({ value: u, label: u }));
export const saleStatusOptions = toOptions(SALE_STATUSES, SALE_STATUS_LABELS);
export const debtCategoryOptions = toOptions(DEBT_CATEGORIES, DEBT_CATEGORY_LABELS);
export const debtDirectionOptions = toOptions(DEBT_DIRECTIONS, DEBT_DIRECTION_LABELS);
export const expenseCategoryOptions = toOptions(EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS);
export const paymentMethodOptions = toOptions(PAYMENT_METHODS, PAYMENT_METHOD_LABELS);
export const employeeRoleOptions = toOptions(EMPLOYEE_ROLES, EMPLOYEE_ROLE_LABELS);
export const employeeStatusOptions = toOptions(EMPLOYEE_STATUSES, EMPLOYEE_STATUS_LABELS);
export const taskPriorityOptions = toOptions(TASK_PRIORITIES, TASK_PRIORITY_LABELS);
export const taskStatusOptions = toOptions(TASK_STATUSES, TASK_STATUS_LABELS);
export const reportStatusOptions = toOptions(REPORT_STATUSES, REPORT_STATUS_LABELS);
