import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ITextHistory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  page: string;
  fieldName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const TextHistorySchema = new Schema<ITextHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    page: { type: String, required: true, trim: true, index: true },
    fieldName: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

TextHistorySchema.index({ user: 1, createdAt: -1 });

const TextHistory: Model<ITextHistory> =
  mongoose.models.TextHistory ??
  mongoose.model<ITextHistory>("TextHistory", TextHistorySchema);

export default TextHistory;
