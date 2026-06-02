import type { DebtStatus, SaleStatus } from "@/lib/constants";

export interface SaleAmountsInput {
  weight: number;
  pricePerUnit: number;
  paid: number;
}

export interface SaleAmounts {
  total: number;
  remaining: number;
  status: SaleStatus;
}

export interface DebtAmountsInput {
  amount: number;
  paid: number;
  dueDate?: Date | string | null;
}

export interface DebtAmounts {
  remaining: number;
  status: DebtStatus;
}

/** Round currency to 2 decimal places. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Sale total = weight × price per unit. */
export function calculateSaleTotal(weight: number, pricePerUnit: number): number {
  return roundMoney(weight * pricePerUnit);
}

/** Remaining balance after payments. */
export function calculateRemaining(total: number, paid: number): number {
  return roundMoney(Math.max(0, total - paid));
}

/**
 * paid — fully settled
 * partial — some payment received
 * unpaid — no payment yet
 */
export function calculateSalePaymentStatus(total: number, paid: number): SaleStatus {
  const remaining = calculateRemaining(total, paid);

  if (remaining <= 0) {
    return "paid";
  }

  if (paid > 0) {
    return "partial";
  }

  return "unpaid";
}

/**
 * paid — fully settled
 * overdue — due date passed with balance remaining
 * active — otherwise
 */
export function calculateDebtStatus(
  amount: number,
  paid: number,
  dueDate?: Date | string | null
): DebtStatus {
  const remaining = calculateRemaining(amount, paid);

  if (remaining <= 0) {
    return "paid";
  }

  if (dueDate) {
    const due = dueDate instanceof Date ? dueDate : new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    if (due < today) {
      return "overdue";
    }
  }

  return "active";
}

export function calculateSaleAmounts(input: SaleAmountsInput): SaleAmounts {
  const total = calculateSaleTotal(input.weight, input.pricePerUnit);
  const paid = roundMoney(Math.max(0, input.paid));
  const remaining = calculateRemaining(total, paid);
  const status = calculateSalePaymentStatus(total, paid);

  return { total, remaining, status };
}

export function calculateDebtAmounts(input: DebtAmountsInput): DebtAmounts {
  const amount = roundMoney(Math.max(0, input.amount));
  const paid = roundMoney(Math.max(0, input.paid));
  const remaining = calculateRemaining(amount, paid);
  const status = calculateDebtStatus(amount, paid, input.dueDate);

  return { remaining, status };
}

export interface DashboardTotalsInput {
  sales: Array<{ total: number; paid: number; remaining: number; weight: number; date: string }>;
  expenses: Array<{ amount: number; date: string }>;
  debts: Array<{ direction: "we_owe" | "owed_to_us"; remaining: number }>;
}

export interface DashboardTotals {
  totalSales: number;
  totalPaidSales: number;
  remainingCustomerDebts: number;
  totalExpenses: number;
  debtsWeOwe: number;
  debtsOwedToUs: number;
  netProfit: number;
  totalWeight: number;
  todayRevenue: number;
  todayExpenses: number;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function calculateDashboardTotals(input: DashboardTotalsInput): DashboardTotals {
  const totalSales = roundMoney(input.sales.reduce((sum, s) => sum + s.total, 0));
  const totalPaidSales = roundMoney(input.sales.reduce((sum, s) => sum + s.paid, 0));
  const remainingCustomerDebts = roundMoney(
    input.sales.reduce((sum, s) => sum + s.remaining, 0)
  );
  const totalExpenses = roundMoney(input.expenses.reduce((sum, e) => sum + e.amount, 0));
  const debtsWeOwe = roundMoney(
    input.debts.filter((d) => d.direction === "we_owe").reduce((sum, d) => sum + d.remaining, 0)
  );
  const debtsOwedToUs = roundMoney(
    input.debts.filter((d) => d.direction === "owed_to_us").reduce((sum, d) => sum + d.remaining, 0)
  );
  const netProfit = roundMoney(totalPaidSales - totalExpenses - debtsWeOwe);
  const totalWeight = roundMoney(input.sales.reduce((sum, s) => sum + s.weight, 0));
  const todayRevenue = roundMoney(
    input.sales.filter((s) => isToday(s.date)).reduce((sum, s) => sum + s.paid, 0)
  );
  const todayExpenses = roundMoney(
    input.expenses.filter((e) => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0)
  );

  return {
    totalSales,
    totalPaidSales,
    remainingCustomerDebts,
    totalExpenses,
    debtsWeOwe,
    debtsOwedToUs,
    netProfit,
    totalWeight,
    todayRevenue,
    todayExpenses,
  };
}
