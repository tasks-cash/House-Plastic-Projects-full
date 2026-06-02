import type { NextRequest } from "next/server";
import {
  isValidObjectId,
  parseJsonBody,
  requireAuth,
  requireDelete,
  requireModuleWrite,
  resolveRouteId,
  type ApiContext,
} from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { mapExpense } from "@/lib/mappers";
import { formatZodError, expenseUpdateSchema } from "@/lib/validations";
import Expense from "@/models/Expense";

export const GET = requireAuth(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Expense not found", { status: 404 });
  }

  const expense = await Expense.findById(id).lean();
  if (!expense) {
    return jsonError("Expense not found", { status: 404 });
  }

  return jsonSuccess(mapExpense(expense));
});

export const PUT = requireModuleWrite("expenses", async (request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Expense not found", { status: 404 });
  }

  const expense = await Expense.findById(id);
  if (!expense) {
    return jsonError("Expense not found", { status: 404 });
  }

  const body = await parseJsonBody(request);
  const parsed = expenseUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  if (data.date) expense.date = new Date(data.date);
  if (data.category !== undefined) expense.category = data.category;
  if (data.title !== undefined) expense.title = data.title;
  if (data.supplier !== undefined) expense.supplier = data.supplier;
  if (data.amount !== undefined) expense.amount = data.amount;
  if (data.payment !== undefined) expense.payment = data.payment;
  if (data.greenhouse !== undefined) expense.greenhouse = data.greenhouse;
  if (data.notes !== undefined) expense.notes = data.notes;

  await expense.save();

  return jsonSuccess(mapExpense(expense));
});

export const DELETE = requireDelete(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Expense not found", { status: 404 });
  }

  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) {
    return jsonError("Expense not found", { status: 404 });
  }

  return jsonSuccess({ id });
});
