import {
  DEBT_CATEGORIES,
  DEBT_DIRECTIONS,
  DEBT_STATUSES,
  type DebtCategory,
  type DebtDirection,
  type DebtStatus,
} from "@/lib/constants";
import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IDebt extends Document {
  date: Date;
  person: string;
  category: DebtCategory;
  direction: DebtDirection;
  source: string;
  amount: number;
  paid: number;
  remaining: number;
  dueDate?: Date;
  status: DebtStatus;
  notes: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    date: { type: Date, required: true },
    person: { type: String, required: true, trim: true },
    category: { type: String, enum: DEBT_CATEGORIES, required: true },
    direction: { type: String, enum: DEBT_DIRECTIONS, required: true },
    source: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paid: { type: Number, required: true, min: 0, default: 0 },
    remaining: { type: Number, required: true, min: 0, default: 0 },
    dueDate: { type: Date },
    status: { type: String, enum: DEBT_STATUSES, required: true, default: "active" },
    notes: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

DebtSchema.index({ date: -1 });
DebtSchema.index({ direction: 1 });
DebtSchema.index({ status: 1 });

const Debt: Model<IDebt> =
  mongoose.models.Debt ?? mongoose.model<IDebt>("Debt", DebtSchema);

export default Debt;
