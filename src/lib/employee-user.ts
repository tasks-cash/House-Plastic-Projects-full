import bcrypt from "bcryptjs";
import type { EmployeeRole } from "@/lib/constants";
import User from "@/models/User";
import type { Types } from "mongoose";

const EMPLOYEE_ROLE_TO_USER_ROLE: Record<
  EmployeeRole,
  "owner" | "admin" | "manager" | "worker" | "accountant" | "viewer"
> = {
  owner: "owner",
  manager: "manager",
  worker: "worker",
  accountant: "accountant",
  viewer: "viewer",
};

export async function syncEmployeeUser(params: {
  name: string;
  email?: string;
  username?: string;
  phone?: string;
  password?: string;
  employeeRole: EmployeeRole;
  existingUserId?: Types.ObjectId | string | null;
}): Promise<Types.ObjectId | undefined> {
  const email = params.email?.trim() || undefined;
  const username = params.username?.trim() || undefined;
  const phone = params.phone?.trim() || undefined;

  if (!email && !username && !phone) {
    return params.existingUserId
      ? typeof params.existingUserId === "string"
        ? (params.existingUserId as unknown as Types.ObjectId)
        : params.existingUserId
      : undefined;
  }

  const userRole = EMPLOYEE_ROLE_TO_USER_ROLE[params.employeeRole] ?? "worker";

  if (params.existingUserId) {
    const user = await User.findById(params.existingUserId).select("+passwordHash");
    if (user) {
      user.name = params.name;
      if (email !== undefined) user.email = email;
      if (username !== undefined) user.username = username;
      if (phone !== undefined) user.phone = phone;
      if (params.password) {
        user.passwordHash = await bcrypt.hash(params.password, 12);
      }
      user.role = userRole;
      await user.save();
      return user._id;
    }
  }

  if (!params.password) {
    return undefined;
  }

  const passwordHash = await bcrypt.hash(params.password, 12);
  const user = await User.create({
    name: params.name,
    email,
    username,
    phone,
    passwordHash,
    role: userRole,
    isActive: true,
  });

  return user._id;
}
