import mongoose, { Document, Schema } from "mongoose";
import { CartItem, Coupon, Customer, PaymentDetails, Product } from '@/app/types/pos'
import { User } from "./User";

export interface Order extends Document {
    name: string; // Live Bill, Table 1, ...
    cart: CartItem[];
    customer?: Customer;
    cashier: User;
    orderType: 'dine-in' | 'takeaway' | 'delivery';
    customDiscount?: number;
    appliedCoupon?: Coupon;
    kitchenNote?: string;
    createdAt: Date;
    status: 'active' | 'completed';
    isDefault?: boolean;
    paymentDetails: PaymentDetails;
    tableCharge: number;
    discountPercentage: number;
    totalAmount: number;
}

const orderSchema = new Schema<Order>({
    name: { type: String, required: true },
    cart: { type: [Object], required: true },
    customer: { type: Object, default: {} },
    cashier: { type: Object, required: true },
    orderType: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], required: true },
    customDiscount: { type: Number, default: 0 },
    appliedCoupon: { type: Object },
    kitchenNote: { type: String },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    isDefault: { type: Boolean, default: false },
    paymentDetails: { type: Object, required: true },
    tableCharge: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model<Order>('Order', orderSchema);