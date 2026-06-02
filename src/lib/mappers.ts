import {
  CAPITALIZED_EXPENSE_CATEGORIES,
  DEBT_CATEGORY_LABELS,
  DEBT_DIRECTION_LABELS,
  DEBT_STATUS_LABELS,
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_STATUS_LABELS,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  REPORT_STATUS_LABELS,
  SALE_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type DebtCategory,
  type DebtDirection,
  type EmployeeRole,
  type EmployeeStatus,
  type ExpenseCategory,
  type PaymentMethod,
  type ReportStatus,
  type DebtStatus,
  type SaleStatus,
  type TaskPriority,
  type TaskStatus,
  type UserRole,
  USER_ROLE_LABELS,
} from "@/lib/constants";
import type { Types } from "mongoose";

type DocWithId = {
  _id: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
};

function toId(doc: DocWithId): string {
  return typeof doc._id === "string" ? doc._id : doc._id.toString();
}

function toIsoDate(value: Date | string | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function toIsoDateTime(value: Date | string | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

export interface MappedSaleMediaProof {
  url: string;
  type: "image" | "video";
  filename: string;
  uploadedAt: string;
}

export interface MappedSale {
  id: string;
  date: string;
  client: string;
  product: string;
  greenhouse: string;
  weight: number;
  unit: string;
  price: number;
  total: number;
  paid: number;
  remaining: number;
  status: SaleStatus;
  statusLabel: string;
  notes: string;
  mediaProof: MappedSaleMediaProof[];
  createdAt?: string;
  updatedAt?: string;
}

export function mapSale(doc: {
  _id: Types.ObjectId | string;
  date: Date | string;
  client: string;
  product: string;
  greenhouse?: string;
  weight: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  paid: number;
  remaining: number;
  status: SaleStatus;
  notes?: string;
  mediaProof?: {
    url: string;
    type: "image" | "video";
    filename: string;
    uploadedAt?: Date | string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}): MappedSale {
  return {
    id: toId(doc),
    date: toIsoDate(doc.date),
    client: doc.client ?? "",
    product: doc.product,
    greenhouse: doc.greenhouse ?? "",
    weight: doc.weight,
    unit: doc.unit,
    price: doc.pricePerUnit,
    total: doc.total,
    paid: doc.paid,
    remaining: doc.remaining,
    status: doc.status,
    statusLabel: SALE_STATUS_LABELS[doc.status],
    notes: doc.notes ?? "",
    mediaProof: (doc.mediaProof ?? []).map((m) => ({
      url: m.url,
      type: m.type,
      filename: m.filename,
      uploadedAt:
        m.uploadedAt instanceof Date
          ? m.uploadedAt.toISOString()
          : m.uploadedAt
            ? String(m.uploadedAt)
            : new Date().toISOString(),
    })),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export interface MappedDebt {
  id: string;
  date: string;
  person: string;
  category: DebtCategory;
  categoryLabel: string;
  direction: DebtDirection;
  directionLabel: string;
  source: string;
  amount: number;
  paid: number;
  remaining: number;
  dueDate: string;
  status: DebtStatus;
  statusLabel: string;
  notes: string;
}

export function mapDebt(doc: {
  _id: Types.ObjectId | string;
  date: Date | string;
  person: string;
  category: DebtCategory;
  direction: DebtDirection;
  source: string;
  amount: number;
  paid: number;
  remaining: number;
  dueDate?: Date | string;
  status: DebtStatus;
  notes?: string;
}): MappedDebt {
  return {
    id: toId(doc),
    date: toIsoDate(doc.date),
    person: doc.person,
    category: doc.category,
    categoryLabel: DEBT_CATEGORY_LABELS[doc.category],
    direction: doc.direction,
    directionLabel: DEBT_DIRECTION_LABELS[doc.direction],
    source: doc.source,
    amount: doc.amount,
    paid: doc.paid,
    remaining: doc.remaining,
    dueDate: doc.dueDate ? toIsoDate(doc.dueDate) : "",
    status: doc.status,
    statusLabel: DEBT_STATUS_LABELS[doc.status],
    notes: doc.notes ?? "",
  };
}

export interface MappedExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  categoryLabel: string;
  isCapitalized: boolean;
  title: string;
  supplier: string;
  amount: number;
  payment: PaymentMethod;
  paymentLabel: string;
  greenhouse: string;
  notes: string;
}

export function mapExpense(doc: {
  _id: Types.ObjectId | string;
  date: Date | string;
  category: ExpenseCategory;
  title: string;
  supplier: string;
  amount: number;
  payment: PaymentMethod;
  greenhouse: string;
  notes?: string;
}): MappedExpense {
  return {
    id: toId(doc),
    date: toIsoDate(doc.date),
    category: doc.category,
    categoryLabel: EXPENSE_CATEGORY_LABELS[doc.category],
    isCapitalized: CAPITALIZED_EXPENSE_CATEGORIES.includes(doc.category),
    title: doc.title,
    supplier: doc.supplier,
    amount: doc.amount,
    payment: doc.payment,
    paymentLabel: PAYMENT_METHOD_LABELS[doc.payment],
    greenhouse: doc.greenhouse,
    notes: doc.notes ?? "",
  };
}

export interface MappedEmployee {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: EmployeeRole;
  roleLabel: string;
  status: EmployeeStatus;
  statusLabel: string;
  assignedGreenhouse: string;
  notes: string;
  dailyTasksCount?: number;
  lastActivity?: string;
}

export function mapEmployee(
  doc: {
    _id: Types.ObjectId | string;
    name: string;
    email?: string;
    username?: string;
    phone?: string;
    role: EmployeeRole;
    status: EmployeeStatus;
    assignedGreenhouse?: string;
    notes?: string;
    updatedAt?: Date;
  },
  extras?: { dailyTasksCount?: number }
): MappedEmployee {
  return {
    id: toId(doc),
    name: doc.name,
    email: doc.email ?? "",
    username: doc.username ?? "",
    phone: doc.phone ?? "",
    role: doc.role,
    roleLabel: EMPLOYEE_ROLE_LABELS[doc.role],
    status: doc.status,
    statusLabel: EMPLOYEE_STATUS_LABELS[doc.status],
    assignedGreenhouse: doc.assignedGreenhouse ?? "",
    notes: doc.notes ?? "",
    dailyTasksCount: extras?.dailyTasksCount ?? 0,
    lastActivity: doc.updatedAt ? toIsoDateTime(doc.updatedAt) : undefined,
  };
}

export interface MappedTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  greenhouse: string;
  priority: TaskPriority;
  priorityLabel: string;
  status: TaskStatus;
  statusLabel: string;
  dueTime: string;
  createdBy: string;
}

export function mapTask(doc: {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  assignedTo: string;
  greenhouse: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: Date | string;
  createdBy?: string;
}): MappedTask {
  return {
    id: toId(doc),
    title: doc.title,
    description: doc.description ?? "",
    assignedTo: doc.assignedTo,
    greenhouse: doc.greenhouse,
    priority: doc.priority,
    priorityLabel: TASK_PRIORITY_LABELS[doc.priority],
    status: doc.status,
    statusLabel: TASK_STATUS_LABELS[doc.status],
    dueTime: toIsoDateTime(doc.dueTime),
    createdBy: doc.createdBy ?? "",
  };
}

export interface MappedDailyReport {
  id: string;
  date: string;
  employee: string;
  greenhouse: string;
  workDone: string;
  problems: string;
  productionNotes: string;
  photosCount: number;
  status: ReportStatus;
  statusLabel: string;
}

export function mapDailyReport(doc: {
  _id: Types.ObjectId | string;
  date: Date | string;
  employee: string;
  greenhouse: string;
  workDone?: string;
  problems?: string;
  productionNotes?: string;
  photosCount: number;
  status: ReportStatus;
}): MappedDailyReport {
  return {
    id: toId(doc),
    date: toIsoDate(doc.date),
    employee: doc.employee,
    greenhouse: doc.greenhouse,
    workDone: doc.workDone ?? "",
    problems: doc.problems ?? "",
    productionNotes: doc.productionNotes ?? "",
    photosCount: doc.photosCount,
    status: doc.status,
    statusLabel: REPORT_STATUS_LABELS[doc.status],
  };
}

export interface MappedUser {
  id: string;
  name: string;
  email?: string;
  username?: string;
  phone?: string;
  role: UserRole;
  roleLabel: string;
  isActive: boolean;
}

export function mapUser(doc: {
  _id: Types.ObjectId | string;
  name: string;
  email?: string;
  username?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
}): MappedUser {
  return {
    id: toId(doc),
    name: doc.name,
    email: doc.email,
    username: doc.username,
    phone: doc.phone,
    role: doc.role,
    roleLabel: USER_ROLE_LABELS[doc.role],
    isActive: doc.isActive,
  };
}
