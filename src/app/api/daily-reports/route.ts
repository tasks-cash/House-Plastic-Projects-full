import type { NextRequest } from "next/server";
import { parseJsonBody, requireAuth, requireModuleWrite } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { mapDailyReport } from "@/lib/mappers";
import { formatZodError, dailyReportSchema } from "@/lib/validations";
import DailyReport from "@/models/DailyReport";

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
      { employee: { $regex: search, $options: "i" } },
      { greenhouse: { $regex: search, $options: "i" } },
    ];
  }

  const reports = await DailyReport.find(filter).sort({ date: -1 }).lean();
  return jsonSuccess(reports.map((r) => mapDailyReport(r)));
});

export const POST = requireModuleWrite("daily-reports", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = dailyReportSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  const report = await DailyReport.create({
    date: new Date(data.date),
    employee: data.employee,
    employeeId: data.employeeId,
    greenhouse: data.greenhouse,
    workDone: data.workDone,
    problems: data.problems,
    productionNotes: data.productionNotes,
    photosCount: data.photosCount,
    status: data.status,
    createdBy: session.userId,
  });

  return jsonSuccess(mapDailyReport(report), { status: 201 });
});
