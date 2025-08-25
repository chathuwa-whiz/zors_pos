export interface User {
  _id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
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
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customDiscount: number;
  appliedCoupon?: Coupon;
  kitchenNote: string;
  createdAt: Date;
  status: 'active' | 'completed';
  isDefault?: boolean;
  paymentDetails?: PaymentDetails;
}

export interface OrderTotals {
  subtotal: number;
  couponDiscount: number;
  customDiscount: number;
  tax: number;
  total: number;
}