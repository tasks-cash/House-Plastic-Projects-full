import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IVoiceHistory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  page: string;
  fieldName: string;
  recognizedText: string;
  audioFile: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const VoiceHistorySchema = new Schema<IVoiceHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    page: { type: String, required: true, trim: true, index: true },
    fieldName: { type: String, required: true, trim: true },
    recognizedText: { type: String, default: "", trim: true },
    audioFile: { type: String, default: "", trim: true },
    language: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

VoiceHistorySchema.index({ user: 1, createdAt: -1 });

const VoiceHistory: Model<IVoiceHistory> =
  mongoose.models.VoiceHistory ??
  mongoose.model<IVoiceHistory>("VoiceHistory", VoiceHistorySchema);

export default VoiceHistory;
