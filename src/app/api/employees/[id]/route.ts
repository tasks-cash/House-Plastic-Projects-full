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
import { syncEmployeeUser } from "@/lib/employee-user";
import { mapEmployee } from "@/lib/mappers";
import { canAssignUserRole } from "@/lib/permissions";
import { formatZodError, employeeUpdateSchema } from "@/lib/validations";
import Employee from "@/models/Employee";

export const GET = requireAuth(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Employee not found", { status: 404 });
  }

  const employee = await Employee.findById(id).lean();
  if (!employee) {
    return jsonError("Employee not found", { status: 404 });
  }

  return jsonSuccess(mapEmployee(employee));
});

export const PUT = requireModuleWrite("employees", async (request: NextRequest, context: ApiContext, session) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Employee not found", { status: 404 });
  }

  const employee = await Employee.findById(id);
  if (!employee) {
    return jsonError("Employee not found", { status: 404 });
  }

  const body = await parseJsonBody(request);
  const parsed = employeeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  const nextRole = data.role ?? employee.role;
  if (!canAssignUserRole(session.role, nextRole)) {
    return jsonError("You cannot assign the owner role", { status: 403 });
  }

  const mergedEmail = data.email !== undefined ? data.email.trim() : employee.email ?? "";
  const mergedUsername =
    data.username !== undefined ? data.username.trim() : employee.username ?? "";
  const mergedPhone = data.phone !== undefined ? data.phone.trim() : employee.phone ?? "";

  if (!mergedEmail && !mergedUsername && !mergedPhone) {
    return jsonError("At least one of email, username, or phone is required.", {
      status: 400,
    });
  }

  if (data.name !== undefined) employee.name = data.name;
  if (data.email !== undefined) employee.email = mergedEmail || undefined;
  if (data.username !== undefined) employee.username = mergedUsername || undefined;
  if (data.phone !== undefined) employee.phone = mergedPhone || undefined;
  if (data.role !== undefined) employee.role = data.role;
  if (data.status !== undefined) employee.status = data.status;
  if (data.assignedGreenhouse !== undefined) {
    employee.assignedGreenhouse = data.assignedGreenhouse;
  }
  if (data.notes !== undefined) employee.notes = data.notes;

  const password = data.password?.trim() || undefined;
  const userId = await syncEmployeeUser({
    name: employee.name,
    email: employee.email,
    username: employee.username,
    phone: employee.phone,
    password,
    employeeRole: employee.role,
    existingUserId: employee.userId,
  });

  if (userId) employee.userId = userId;

  await employee.save();

  return jsonSuccess(mapEmployee(employee));
});

export const DELETE = requireDelete(async (_request: NextRequest, context: ApiContext) => {
  const id = await resolveRouteId(context);
  if (!id || !isValidObjectId(id)) {
    return jsonError("Employee not found", { status: 404 });
  }

  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    return jsonError("Employee not found", { status: 404 });
  }

  return jsonSuccess({ id });
});
