import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ISearchHistory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  query: string;
  page: string;
  source?: "text" | "voice";
  createdAt: Date;
  updatedAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    query: { type: String, required: true, trim: true },
    page: { type: String, required: true, trim: true, index: true },
    source: { type: String, enum: ["text", "voice"], default: "text" },
  },
  { timestamps: true }
);

SearchHistorySchema.index({ user: 1, createdAt: -1 });

const SearchHistory: Model<ISearchHistory> =
  mongoose.models.SearchHistory ??
  mongoose.model<ISearchHistory>("SearchHistory", SearchHistorySchema);

export default SearchHistory;
