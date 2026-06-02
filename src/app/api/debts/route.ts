import type { NextRequest } from "next/server";
import { parseJsonBody, requireAuth, requireModuleWrite } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { calculateDebtAmounts } from "@/lib/calculations";
import { mapDebt } from "@/lib/mappers";
import { formatZodError, debtSchema } from "@/lib/validations";
import Debt from "@/models/Debt";

export const GET = requireAuth(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category");
  const direction = searchParams.get("direction");
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (direction) filter.direction = direction;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { person: { $regex: search, $options: "i" } },
      { source: { $regex: search, $options: "i" } },
    ];
  }

  const debts = await Debt.find(filter).sort({ date: -1 }).lean();
  return jsonSuccess(debts.map((d) => mapDebt(d)));
});

export const POST = requireModuleWrite("debts", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = debtSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;
  const amounts = calculateDebtAmounts({
    amount: data.amount,
    paid: data.paid,
    dueDate: data.dueDate ?? null,
  });

  const debt = await Debt.create({
    date: new Date(data.date),
    person: data.person,
    category: data.category,
    direction: data.direction,
    source: data.source,
    amount: data.amount,
    paid: data.paid,
    remaining: amounts.remaining,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    status: amounts.status,
    notes: data.notes,
    createdBy: session.userId,
  });

  return jsonSuccess(mapDebt(debt), { status: 201 });
});
