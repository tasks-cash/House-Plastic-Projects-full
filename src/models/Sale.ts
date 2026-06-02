import {
  greenhouses,
  products,
  SALE_STATUSES,
  type SaleStatus,
  units,
} from "@/lib/constants";
import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface ISaleMediaProof {
  url: string;
  type: "image" | "video";
  filename: string;
  uploadedAt: Date;
}

export interface ISale extends Document {
  date: Date;
  client: string;
  greenhouse?: string;
  product: string;
  weight: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  paid: number;
  remaining: number;
  status: SaleStatus;
  notes: string;
  mediaProof: ISaleMediaProof[];
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SaleMediaProofSchema = new Schema<ISaleMediaProof>(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISale>(
  {
    date: { type: Date, required: true },
    client: { type: String, default: "", trim: true },
    greenhouse: { type: String, enum: greenhouses },
    product: { type: String, enum: products, required: true },
    weight: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: units, required: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paid: { type: Number, required: true, min: 0, default: 0 },
    remaining: { type: Number, required: true, min: 0, default: 0 },
    status: { type: String, enum: SALE_STATUSES, required: true, default: "unpaid" },
    notes: { type: String, default: "" },
    mediaProof: { type: [SaleMediaProofSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SaleSchema.index({ date: -1 });
SaleSchema.index({ client: 1 });
SaleSchema.index({ status: 1 });

const Sale: Model<ISale> =
  mongoose.models.Sale ?? mongoose.model<ISale>("Sale", SaleSchema);

export default Sale;
