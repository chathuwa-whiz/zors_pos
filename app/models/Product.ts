import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  barcode?: string;
  image?: string;
  imagePublicId?: string;
  supplier?: string;
  discount?: number;
  size?: string;
  dryfood?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: true, default: 5 },
  barcode: { type: String, unique: true, sparse: true },
  image: { type: String },
  imagePublicId: { type: String },
  supplier: { type: String },
  discount: { type: Number, default: 0 },
  size: { type: String },
  dryfood: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);