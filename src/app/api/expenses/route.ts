import type { NextRequest } from "next/server";
import { parseJsonBody, requireAuth, requireModuleWrite } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { mapExpense } from "@/lib/mappers";
import { formatZodError, expenseSchema } from "@/lib/validations";
import Expense from "@/models/Expense";

export const GET = requireAuth(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) (filter.date as Record<string, Date>)["$gte"] = new Date(from);
    if (to) (filter.date as Record<string, Date>)["$lte"] = new Date(to);
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { supplier: { $regex: search, $options: "i" } },
    ];
  }

  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
  return jsonSuccess(expenses.map((e) => mapExpense(e)));
});

export const POST = requireModuleWrite("expenses", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = expenseSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  const expense = await Expense.create({
    date: new Date(data.date),
    category: data.category,
    title: data.title,
    supplier: data.supplier ?? "",
    amount: data.amount,
    payment: data.payment,
    greenhouse: data.greenhouse ?? "All",
    notes: data.notes,
    createdBy: session.userId,
  });

  return jsonSuccess(mapExpense(expense), { status: 201 });
});
