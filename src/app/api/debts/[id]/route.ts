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
import { calculateDebtAmounts } from "@/lib/calculations";
import { mapDebt } from "@/lib/mappers";
import { formatZodError, debtUpdateSchema } from "@/lib/validations";
import Debt from "@/models/Debt";

export const GET = requireAuth(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Debt not found", { status: 404 });
  }

  const debt = await Debt.findById(id).lean();
  if (!debt) {
    return jsonError("Debt not found", { status: 404 });
  }

  return jsonSuccess(mapDebt(debt));
});

export const PUT = requireModuleWrite("debts", async (request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Debt not found", { status: 404 });
  }

  const debt = await Debt.findById(id);
  if (!debt) {
    return jsonError("Debt not found", { status: 404 });
  }

  const body = await parseJsonBody(request);
  const parsed = debtUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  if (data.date) debt.date = new Date(data.date);
  if (data.person !== undefined) debt.person = data.person;
  if (data.category !== undefined) debt.category = data.category;
  if (data.direction !== undefined) debt.direction = data.direction;
  if (data.source !== undefined) debt.source = data.source;
  if (data.amount !== undefined) debt.amount = data.amount;
  if (data.paid !== undefined) debt.paid = data.paid;
  if (data.notes !== undefined) debt.notes = data.notes;
  if (data.dueDate !== undefined) {
    debt.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
  }

  const amounts = calculateDebtAmounts({
    amount: debt.amount,
    paid: debt.paid,
    dueDate: debt.dueDate,
  });

  debt.remaining = amounts.remaining;
  debt.status = amounts.status;

  await debt.save();

  return jsonSuccess(mapDebt(debt));
});

export const DELETE = requireDelete(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Debt not found", { status: 404 });
  }

  const debt = await Debt.findByIdAndDelete(id);
  if (!debt) {
    return jsonError("Debt not found", { status: 404 });
  }

  return jsonSuccess({ id });
});
