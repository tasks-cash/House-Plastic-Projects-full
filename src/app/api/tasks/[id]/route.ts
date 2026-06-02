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
import { mapTask } from "@/lib/mappers";
import { formatZodError, taskUpdateSchema } from "@/lib/validations";
import Task from "@/models/Task";

export const GET = requireAuth(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Task not found", { status: 404 });
  }

  const task = await Task.findById(id).lean();
  if (!task) {
    return jsonError("Task not found", { status: 404 });
  }

  return jsonSuccess(mapTask(task));
});

export const PUT = requireModuleWrite("tasks", async (request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Task not found", { status: 404 });
  }

  const task = await Task.findById(id);
  if (!task) {
    return jsonError("Task not found", { status: 404 });
  }

  const body = await parseJsonBody(request);
  const parsed = taskUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.assignedTo !== undefined) task.assignedTo = data.assignedTo;
  if (data.greenhouse !== undefined) task.greenhouse = data.greenhouse;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.status !== undefined) task.status = data.status;
  if (data.dueTime) task.dueTime = new Date(data.dueTime);

  await task.save();

  return jsonSuccess(mapTask(task));
});

export const DELETE = requireDelete(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Task not found", { status: 404 });
  }

  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    return jsonError("Task not found", { status: 404 });
  }

  return jsonSuccess({ id });
});
