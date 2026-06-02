import type { NextRequest } from "next/server";
import { parseJsonBody, requireAuth, requireModuleWrite } from "@/lib/api-handler";
import { canAssignUserRole } from "@/lib/permissions";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { syncEmployeeUser } from "@/lib/employee-user";
import { mapEmployee } from "@/lib/mappers";
import { formatZodError, employeeSchema } from "@/lib/validations";
import Employee from "@/models/Employee";
import Task from "@/models/Task";

export const GET = requireAuth(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }

  const employees = await Employee.find(filter).sort({ name: 1 }).lean();

  const mapped = await Promise.all(
    employees.map(async (emp) => {
      const taskCount = await Task.countDocuments({
        assignedTo: emp.name,
        status: { $in: ["pending", "in_progress"] },
      });
      return mapEmployee(emp, { dailyTasksCount: taskCount });
    })
  );

  return jsonSuccess(mapped);
});

export const POST = requireModuleWrite("employees", async (request, _context, session) => {
  const body = await parseJsonBody(request);
  const parsed = employeeSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(formatZodError(parsed.error), { status: 400 });
  }

  const data = parsed.data;

  if (!canAssignUserRole(session.role, data.role)) {
    return jsonError("You cannot assign the owner role", { status: 403 });
  }
  const email = data.email?.trim() || undefined;
  const username = data.username?.trim() || undefined;
  const phone = data.phone?.trim() || undefined;
  const password = data.password?.trim() || undefined;

  const userId = await syncEmployeeUser({
    name: data.name,
    email,
    username,
    phone,
    password,
    employeeRole: data.role,
  });

  const employee = await Employee.create({
    name: data.name,
    email,
    username,
    phone,
    role: data.role,
    status: data.status,
    assignedGreenhouse: data.assignedGreenhouse,
    notes: data.notes,
    userId,
  });

  return jsonSuccess(mapEmployee(employee), { status: 201 });
});
