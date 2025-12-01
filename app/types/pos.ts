import { User as UserModel } from "./user";

export interface Product {
  _id: string;
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
  supplier?: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface Customer {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  applicableItems?: string[];
  description: string;
}

export interface PaymentDetails {
  method: 'cash' | 'card';
  cashGiven?: number;
  change?: number;
  invoiceId?: string;
  bankServiceCharge?: number;
  bankName?: string;
}

export interface Order {
  _id: string;
  name: string;
  cart: CartItem[];
  customer: Customer;
  cashier: UserModel;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  appliedCoupon?: Coupon;
  kitchenNote: string;
  createdAt: Date;
  status: 'active' | 'completed';
  isDefault?: boolean;
  paymentDetails?: PaymentDetails;
  tableCharge: number;
  deliveryCharge?: number;
  discountAmount: number;
  discountPercentage: number;
  totalAmount: number;
}

export interface OrderTotals {
  subtotal: number;
  couponDiscount: number;
  discountAmount: number;
  discountPercentage: number;
  total: number;
  tableCharge: number;
  deliveryCharge?: number;
  productDiscountTotal?: number;
  originalSubtotal?: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface ReceiptTemplate {
  logoUrl?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  footerGreeting?: string;
};