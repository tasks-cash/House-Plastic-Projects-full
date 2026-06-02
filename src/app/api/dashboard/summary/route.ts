import { requireAuth } from "@/lib/api-handler";
import { jsonSuccess } from "@/lib/api-response";
import { calculateDashboardTotals } from "@/lib/calculations";
import { mapDailyReport, mapDebt, mapExpense, mapSale, mapTask } from "@/lib/mappers";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import Debt from "@/models/Debt";
import Task from "@/models/Task";
import DailyReport from "@/models/DailyReport";

export const GET = requireAuth(async () => {
  const [sales, expenses, debts, tasks, reports] = await Promise.all([
    Sale.find().sort({ date: -1 }).lean(),
    Expense.find().sort({ date: -1 }).lean(),
    Debt.find().sort({ date: -1 }).lean(),
    Task.find({
      status: { $in: ["pending", "in_progress", "late"] },
    })
      .sort({ dueTime: 1 })
      .limit(10)
      .lean(),
    DailyReport.find({ status: "missing" }).sort({ date: -1 }).limit(10).lean(),
  ]);

  const totals = calculateDashboardTotals({
    sales: sales.map((s) => ({
      total: s.total,
      paid: s.paid,
      remaining: s.remaining,
      weight: s.weight,
      date: new Date(s.date).toISOString().slice(0, 10),
    })),
    expenses: expenses.map((e) => ({
      amount: e.amount,
      date: new Date(e.date).toISOString().slice(0, 10),
    })),
    debts: debts.map((d) => ({
      direction: d.direction,
      remaining: d.remaining,
    })),
  });

  return jsonSuccess({
    ...totals,
    recentSales: sales.slice(0, 5).map((s) => mapSale(s)),
    recentExpenses: expenses.slice(0, 5).map((e) => mapExpense(e)),
    recentDebts: debts.slice(0, 5).map((d) => mapDebt(d)),
    pendingTasks: tasks.map((t) => mapTask(t)),
    missingReports: reports.map((r) => mapDailyReport(r)),
  });
});
