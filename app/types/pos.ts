import { User } from "./user";

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  discount?: number;
  category: string;
  size?: string;
  dryfood?: boolean;
  image?: string;
  stock: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface Customer {
  name?: string;
  phone?: string;
  email?: string;
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
  id: string;
  name: string;
  cart: CartItem[];
  customer: Customer;
  cashier: User;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customDiscount: number;
  appliedCoupon?: Coupon;
  kitchenNote: string;
  createdAt: Date;
  status: 'active' | 'completed';
  isDefault?: boolean;
  paymentDetails?: PaymentDetails;
  tableCharge: number;
}

export interface OrderTotals {
  subtotal: number;
  couponDiscount: number;
  customDiscount: number;
  // discount: number;
  total: number;
  tableCharge: number;
}