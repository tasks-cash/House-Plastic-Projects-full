import type { NextRequest } from "next/server";
import { requireAuth, requireModuleWrite, parseJsonBody } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { calculateSaleAmounts } from "@/lib/calculations";
import { mapSale } from "@/lib/mappers";
import { formatZodError, saleSchema } from "@/lib/validations";
import Sale from "@/models/Sale";

export const GET = requireAuth(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) (filter.date as Record<string, Date>)["$gte"] = new Date(from);
    if (to) (filter.date as Record<string, Date>)["$lte"] = new Date(to);
  }
  if (search) {
    filter.$or = [
      { client: { $regex: search, $options: "i" } },
      { product: { $regex: search, $options: "i" } },
    ];
  }

  const sales = await Sale.find(filter).sort({ date: -1 }).lean();
  return jsonSuccess(sales.map((s) => mapSale(s)));
});

export const POST = requireModuleWrite("sales", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = saleSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;
  const amounts = calculateSaleAmounts({
    weight: data.weight,
    pricePerUnit: data.pricePerUnit,
    paid: data.paid,
  });

  const sale = await Sale.create({
    date: new Date(data.date),
    client: data.client ?? "",
    greenhouse: data.greenhouse,
    product: data.product,
    weight: data.weight,
    unit: data.unit,
    pricePerUnit: data.pricePerUnit,
    total: amounts.total,
    paid: data.paid,
    remaining: amounts.remaining,
    status: amounts.status,
    notes: data.notes,
    mediaProof: data.mediaProof.map((m) => ({
      url: m.url,
      type: m.type,
      filename: m.filename,
      uploadedAt: m.uploadedAt ? new Date(m.uploadedAt) : new Date(),
    })),
    createdBy: session.userId,
  });

  return jsonSuccess(mapSale(sale), { status: 201 });
});
