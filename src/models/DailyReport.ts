import {
  greenhouses,
  REPORT_STATUSES,
  type ReportStatus,
} from "@/lib/constants";
import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IDailyReport extends Document {
  date: Date;
  employee: string;
  employeeId?: Types.ObjectId;
  greenhouse: string;
  workDone: string;
  problems: string;
  productionNotes: string;
  photosCount: number;
  status: ReportStatus;
  submittedById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DailyReportSchema = new Schema<IDailyReport>(
  {
    date: { type: Date, required: true },
    employee: { type: String, required: true, trim: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
    greenhouse: { type: String, enum: greenhouses, required: true },
    workDone: { type: String, default: "" },
    problems: { type: String, default: "" },
    productionNotes: { type: String, default: "" },
    photosCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: REPORT_STATUSES, default: "submitted" },
    submittedById: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

DailyReportSchema.index({ date: -1 });
DailyReportSchema.index({ employeeId: 1 });
DailyReportSchema.index({ status: 1 });

const DailyReport: Model<IDailyReport> =
  mongoose.models.DailyReport ??
  mongoose.model<IDailyReport>("DailyReport", DailyReportSchema);

export default DailyReport;
