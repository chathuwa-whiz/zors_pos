import mongoose, { Document, Schema } from "mongoose";
import User from "./User";

export interface Discount extends Document {
  name: string;
  percentage: number;
  isGlobal: boolean;
  createdBy: typeof User;
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<Discount>({
    name: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    isGlobal: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.models.Discount || mongoose.model<Discount>('Discount', DiscountSchema);