import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  barcode?: string; // New barcode field
  image?: string;
  supplier?: string;
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
  barcode: { type: String, unique: true, sparse: true }, // Unique but optional
  image: { type: String },
  supplier: { type: String },
}, {
  timestamps: true
});

// Add index for barcode for faster lookups
ProductSchema.index({ barcode: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);