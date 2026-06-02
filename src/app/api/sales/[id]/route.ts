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
import { calculateSaleAmounts } from "@/lib/calculations";
import { mapSale } from "@/lib/mappers";
import { formatZodError, saleUpdateSchema } from "@/lib/validations";
import Sale from "@/models/Sale";

export const GET = requireAuth(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Sale not found", { status: 404 });
  }

  const sale = await Sale.findById(id).lean();
  if (!sale) {
    return jsonError("Sale not found", { status: 404 });
  }

  return jsonSuccess(mapSale(sale));
});

export const PUT = requireModuleWrite("sales", async (request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Sale not found", { status: 404 });
  }

  const sale = await Sale.findById(id);
  if (!sale) {
    return jsonError("Sale not found", { status: 404 });
  }

  const body = await parseJsonBody(request);
  const parsed = saleUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  if (data.date) sale.date = new Date(data.date);
  if (data.client !== undefined) sale.client = data.client;
  if (data.greenhouse !== undefined) sale.greenhouse = data.greenhouse;
  if (data.product !== undefined) sale.product = data.product;
  if (data.weight !== undefined) sale.weight = data.weight;
  if (data.unit !== undefined) sale.unit = data.unit;
  if (data.pricePerUnit !== undefined) sale.pricePerUnit = data.pricePerUnit;
  if (data.paid !== undefined) sale.paid = data.paid;
  if (data.notes !== undefined) sale.notes = data.notes;
  if (data.mediaProof !== undefined) {
    sale.mediaProof = data.mediaProof.map((m) => ({
      url: m.url,
      type: m.type,
      filename: m.filename,
      uploadedAt: m.uploadedAt ? new Date(m.uploadedAt) : new Date(),
    }));
  }

  if (sale.mediaProof.length < 1) {
    return jsonError("Image or video proof is required.", { status: 400 });
  }

  const amounts = calculateSaleAmounts({
    weight: sale.weight,
    pricePerUnit: sale.pricePerUnit,
    paid: sale.paid,
  });

  sale.total = amounts.total;
  sale.remaining = amounts.remaining;
  sale.status = amounts.status;

  await sale.save();

  return jsonSuccess(mapSale(sale));
});

export const DELETE = requireDelete(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Sale not found", { status: 404 });
  }

  const sale = await Sale.findByIdAndDelete(id);
  if (!sale) {
    return jsonError("Sale not found", { status: 404 });
  }

  return jsonSuccess({ id });
});
