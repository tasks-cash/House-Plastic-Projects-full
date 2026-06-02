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
import { mapDailyReport } from "@/lib/mappers";
import { formatZodError, dailyReportUpdateSchema } from "@/lib/validations";
import DailyReport from "@/models/DailyReport";

export const GET = requireAuth(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Report not found", { status: 404 });
  }

  const report = await DailyReport.findById(id).lean();
  if (!report) {
    return jsonError("Report not found", { status: 404 });
  }

  return jsonSuccess(mapDailyReport(report));
});

export const PUT = requireModuleWrite("daily-reports", async (request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Report not found", { status: 404 });
  }

  const report = await DailyReport.findById(id);
  if (!report) {
    return jsonError("Report not found", { status: 404 });
  }

  const body = await parseJsonBody(request);
  const parsed = dailyReportUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  if (data.date) report.date = new Date(data.date);
  if (data.employee !== undefined) report.employee = data.employee;
  if (data.greenhouse !== undefined) report.greenhouse = data.greenhouse;
  if (data.workDone !== undefined) report.workDone = data.workDone;
  if (data.problems !== undefined) report.problems = data.problems;
  if (data.productionNotes !== undefined) report.productionNotes = data.productionNotes;
  if (data.photosCount !== undefined) report.photosCount = data.photosCount;
  if (data.status !== undefined) report.status = data.status;

  await report.save();

  return jsonSuccess(mapDailyReport(report));
});

export const DELETE = requireDelete(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Report not found", { status: 404 });
  }

  const report = await DailyReport.findByIdAndDelete(id);
  if (!report) {
    return jsonError("Report not found", { status: 404 });
  }

  return jsonSuccess({ id });
});
