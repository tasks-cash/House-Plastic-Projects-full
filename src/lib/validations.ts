import { z } from "zod";
import {
  DEBT_CATEGORIES,
  DEBT_DIRECTIONS,
  DEBT_STATUSES,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  EXPENSE_CATEGORIES,
  greenhouses,
  LOGIN_METHODS,
  PAYMENT_METHODS,
  products,
  REPORT_STATUSES,
  SALE_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  units,
  USER_ROLES,
} from "@/lib/constants";

const objectIdString = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id")
  .optional();

const dateString = z
  .string()
  .min(1, "Date is required")
  .refine((value: string) => !Number.isNaN(Date.parse(value)), "Invalid date");

const nonNegativeNumber = z.coerce.number().min(0);
const positiveNumber = z.coerce.number().positive();

export const loginSchema = z.object({
  method: z.enum(LOGIN_METHODS),
  identifier: z.string().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const mediaProofItemSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["image", "video"]),
  filename: z.string().min(1),
  uploadedAt: z.string().optional(),
});

const optionalGreenhouse = z
  .union([z.enum(greenhouses), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const saleSchema = z
  .object({
    date: dateString,
    client: z.string().max(200).optional().default(""),
    greenhouse: optionalGreenhouse,
    product: z.enum(products),
    weight: positiveNumber,
    unit: z.enum(units),
    pricePerUnit: nonNegativeNumber,
    paid: nonNegativeNumber.default(0),
    notes: z.string().max(2000).optional().default(""),
    status: z.enum(SALE_STATUSES).optional(),
    mediaProof: z.array(mediaProofItemSchema).default([]),
  })
  .refine((data) => data.mediaProof.length >= 1, {
    message: "Image or video proof is required.",
    path: ["mediaProof"],
  });

export const saleUpdateSchema = z
  .object({
    id: objectIdString,
    date: dateString.optional(),
    client: z.string().max(200).optional(),
    greenhouse: optionalGreenhouse,
    product: z.enum(products).optional(),
    weight: positiveNumber.optional(),
    unit: z.enum(units).optional(),
    pricePerUnit: nonNegativeNumber.optional(),
    paid: nonNegativeNumber.optional(),
    notes: z.string().max(2000).optional(),
    status: z.enum(SALE_STATUSES).optional(),
    mediaProof: z.array(mediaProofItemSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.mediaProof === undefined) return true;
      return data.mediaProof.length >= 1;
    },
    {
      message: "Image or video proof is required.",
      path: ["mediaProof"],
    }
  );

export type SaleInput = z.infer<typeof saleSchema>;
export type SaleUpdateInput = z.infer<typeof saleUpdateSchema>;

export const debtSchema = z.object({
  date: dateString,
  person: z.string().min(1, "Person is required").max(200),
  category: z.enum(DEBT_CATEGORIES),
  direction: z.enum(DEBT_DIRECTIONS),
  source: z.string().min(1, "Source is required").max(300),
  amount: positiveNumber,
  paid: nonNegativeNumber.default(0),
  dueDate: dateString.optional().nullable(),
  status: z.enum(DEBT_STATUSES).optional(),
  notes: z.string().max(2000).optional().default(""),
});

export const debtUpdateSchema = debtSchema.partial().extend({
  id: objectIdString,
});

export type DebtInput = z.infer<typeof debtSchema>;
export type DebtUpdateInput = z.infer<typeof debtUpdateSchema>;

export const expenseSchema = z.object({
  date: dateString,
  category: z.enum(EXPENSE_CATEGORIES),
  title: z.string().min(1, "Title is required").max(300),
  supplier: z.string().max(200).optional().default(""),
  amount: positiveNumber,
  payment: z.enum(PAYMENT_METHODS),
  greenhouse: z.enum(greenhouses).optional(),
  notes: z.string().max(2000).optional().default(""),
});

export const expenseUpdateSchema = expenseSchema.partial().extend({
  id: objectIdString,
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;

const optionalEmployeeGreenhouse = z
  .union([z.enum(greenhouses), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

const optionalEmail = z
  .string()
  .max(200)
  .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email");

const employeeBaseFields = {
  name: z.string().min(1, "Name is required").max(200),
  email: optionalEmail.optional().default(""),
  username: z.string().max(50).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  password: z.string().max(200).optional().default(""),
  role: z.enum(EMPLOYEE_ROLES),
  status: z.enum(EMPLOYEE_STATUSES),
  assignedGreenhouse: optionalEmployeeGreenhouse,
  notes: z.string().max(2000).optional().default(""),
  userId: objectIdString,
};

const employeeIdentifierRefine = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine(
      (data: { email?: string; username?: string; phone?: string }) => {
        const email = data.email?.trim();
        const username = data.username?.trim();
        const phone = data.phone?.trim();
        return Boolean(email || username || phone);
      },
      {
        message: "At least one of email, username, or phone is required.",
        path: ["email"],
      }
    )
    .refine(
      (data: { password?: string; email?: string; username?: string; phone?: string }) => {
        const password = data.password?.trim();
        if (!password) return true;
        return password.length >= 8;
      },
      { message: "Password must be at least 8 characters", path: ["password"] }
    )
    .refine(
      (data: { username?: string }) => {
        const username = data.username?.trim();
        if (!username) return true;
        return username.length >= 2;
      },
      { message: "Username must be at least 2 characters", path: ["username"] }
    );

export const employeeSchema = employeeIdentifierRefine(z.object(employeeBaseFields));

export const employeeUpdateSchema = z
  .object({
    id: objectIdString,
    name: z.string().min(1, "Name is required").max(200).optional(),
    email: optionalEmail.optional(),
    username: z.string().max(50).optional(),
    phone: z.string().max(30).optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
    role: z.enum(EMPLOYEE_ROLES).optional(),
    status: z.enum(EMPLOYEE_STATUSES).optional(),
    assignedGreenhouse: optionalEmployeeGreenhouse,
    notes: z.string().max(2000).optional(),
    userId: objectIdString,
  })
  .partial();

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().max(5000).optional().default(""),
  assignedTo: z.string().min(1, "Assignee is required").max(200),
  assignedToId: objectIdString,
  greenhouse: z.enum(greenhouses),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  status: z.enum(TASK_STATUSES).default("pending"),
  dueTime: z
    .string()
    .min(1, "Due time is required")
    .refine((value: string) => !Number.isNaN(Date.parse(value)), "Invalid due time"),
  createdBy: z.string().max(200).optional(),
  createdById: objectIdString,
});

export const taskUpdateSchema = taskSchema.partial().extend({
  id: objectIdString,
});

export type TaskInput = z.infer<typeof taskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export const dailyReportSchema = z.object({
  date: dateString,
  employee: z.string().min(1, "Employee is required").max(200),
  employeeId: objectIdString,
  greenhouse: z.enum(greenhouses),
  workDone: z.string().max(10000).optional().default(""),
  problems: z.string().max(10000).optional().default(""),
  productionNotes: z.string().max(10000).optional().default(""),
  photosCount: z.coerce.number().int().min(0).default(0),
  status: z.enum(REPORT_STATUSES).default("submitted"),
});

export const dailyReportUpdateSchema = dailyReportSchema.partial().extend({
  id: objectIdString,
});

export type DailyReportInput = z.infer<typeof dailyReportSchema>;
export type DailyReportUpdateInput = z.infer<typeof dailyReportUpdateSchema>;

export const userCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  username: z.string().min(2).max(50).optional(),
  phone: z.string().min(3).max(30).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(USER_ROLES),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.errors.map((issue: z.ZodIssue) => issue.message).join("; ");
}
