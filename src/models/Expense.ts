import {
  EXPENSE_CATEGORIES,
  greenhouses,
  PAYMENT_METHODS,
  type ExpenseCategory,
  type PaymentMethod,
} from "@/lib/constants";
import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IExpense extends Document {
  date: Date;
  category: ExpenseCategory;
  title: string;
  supplier: string;
  amount: number;
  payment: PaymentMethod;
  greenhouse: string;
  notes: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    date: { type: Date, required: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    title: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    payment: { type: String, enum: PAYMENT_METHODS, required: true },
    greenhouse: { type: String, enum: greenhouses, required: true },
    notes: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense ?? mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
