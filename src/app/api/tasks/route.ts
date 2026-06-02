import type { NextRequest } from "next/server";
import { parseJsonBody, requireAuth, requireModuleWrite } from "@/lib/api-handler";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { mapTask } from "@/lib/mappers";
import { formatZodError, taskSchema } from "@/lib/validations";
import Task from "@/models/Task";

export const GET = requireAuth(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { assignedTo: { $regex: search, $options: "i" } },
    ];
  }

  const tasks = await Task.find(filter).sort({ dueTime: 1 }).lean();
  return jsonSuccess(tasks.map((t) => mapTask(t)));
});

export const POST = requireModuleWrite("tasks", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  const task = await Task.create({
    title: data.title,
    description: data.description,
    assignedTo: data.assignedTo,
    assignedToId: data.assignedToId,
    greenhouse: data.greenhouse,
    priority: data.priority,
    status: data.status,
    dueTime: new Date(data.dueTime),
    createdBy: data.createdBy ?? session.name,
    createdById: data.createdById ?? session.userId,
  });

  return jsonSuccess(mapTask(task), { status: 201 });
});
