import {
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  greenhouses,
  type EmployeeRole,
  type EmployeeStatus,
} from "@/lib/constants";
import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  email?: string;
  username?: string;
  phone?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  assignedGreenhouse?: string;
  notes: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    username: { type: String, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: EMPLOYEE_ROLES, required: true },
    status: { type: String, enum: EMPLOYEE_STATUSES, default: "active" },
    assignedGreenhouse: { type: String, enum: greenhouses },
    notes: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EmployeeSchema.index({ name: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ email: 1 }, { sparse: true });
EmployeeSchema.index({ username: 1 }, { sparse: true });
EmployeeSchema.index({ phone: 1 }, { sparse: true });

const Employee: Model<IEmployee> =
  mongoose.models.Employee ?? mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
