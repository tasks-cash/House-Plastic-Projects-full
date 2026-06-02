import {
  greenhouses,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: string;
  assignedToId?: Types.ObjectId;
  greenhouse: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueTime: Date;
  createdBy: string;
  createdById?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: { type: String, required: true, trim: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: "Employee" },
    greenhouse: { type: String, enum: greenhouses, required: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: "medium" },
    status: { type: String, enum: TASK_STATUSES, default: "pending" },
    dueTime: { type: Date, required: true },
    createdBy: { type: String, default: "" },
    createdById: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

TaskSchema.index({ status: 1 });
TaskSchema.index({ dueTime: 1 });
TaskSchema.index({ assignedToId: 1 });

const Task: Model<ITask> =
  mongoose.models.Task ?? mongoose.model<ITask>("Task", TaskSchema);

export default Task;
