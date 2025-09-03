import mongoose, { Document, Schema } from "mongoose";

export interface Product extends Document {
  name: string;
  costPrice: number;
  sellingPrice: number;
  discount?: number;
  category: string;
  size?: string;
  dryfood?: boolean;
  image?: string;
  imagePublicId?: string;
  stock: number;
  description?: string;
  barcode?: string;
}

const ProductSchema = new Schema<Product>({
    name: { type: String, required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String, required: true },
    size: { type: String },
    dryfood: { type: Boolean, default: false },
    image: { type: String },
    imagePublicId: { type: String },
    stock: { type: Number, required: true, min: 0 },
    description: { type: String },
    barcode: { type: String }
}, { timestamps: true })

export default mongoose.models.Product || mongoose.model<Product>('Product', ProductSchema);