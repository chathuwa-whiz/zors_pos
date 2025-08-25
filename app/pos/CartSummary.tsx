"use client";

import { Percent, Tag, X, DollarSign, CreditCard } from 'lucide-react';
import { Order, OrderTotals, Coupon } from '@/app/types/pos';

interface CartSummaryProps {
  activeOrder: Order;
  totals: OrderTotals;
  availableCoupons: Coupon[];
  couponCode: string;
  setCouponCode: (code: string) => void;
  showCheckout: boolean;
  setShowCheckout: (show: boolean) => void;
  paymentMethod: 'cash' | 'card';
  setPaymentMethod: (method: 'cash' | 'card') => void;
  onUpdateActiveOrder: (updates: Partial<Order>) => void;
  onApplyCoupon: () => void;
  onCompleteOrder: () => void;
}

export default function CartSummary({
  activeOrder,
  totals,
  availableCoupons,
  couponCode,
  setCouponCode,
  showCheckout,
  setShowCheckout,
  paymentMethod,
  setPaymentMethod,
  onUpdateActiveOrder,
  onApplyCoupon,
  onCompleteOrder
}: CartSummaryProps) {
  const { subtotal, couponDiscount, customDiscount, tax, total } = totals;

  return (
    <div className="border-t border-gray-200 p-4 flex-shrink-0">
      {/* Coupon and Discount Section */}
      <div className="space-y-3 mb-4">
        {/* Coupon Code */}
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={onApplyCoupon}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            Apply
          </button>
        </div>

        {/* Custom Discount */}
        <div className="flex items-center space-x-2">
          <Percent className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Custom Discount:</span>
          <input
            type="number"
            placeholder="0.00"
            value={activeOrder.customDiscount || ''}
            onChange={(e) => onUpdateActiveOrder({ customDiscount: parseFloat(e.target.value) || 0 })}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
          />
          <span className="text-sm text-gray-500">$</span>
        </div>

        {/* Applied Coupon Display */}
        {activeOrder.appliedCoupon && (
          <div className="flex items-center justify-between bg-green-50 p-2 rounded">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">{activeOrder.appliedCoupon.code}</span>
              <span className="text-xs text-green-600">{activeOrder.appliedCoupon.description}</span>
            </div>
            <button
              onClick={() => onUpdateActiveOrder({ appliedCoupon: undefined })}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span>-${couponDiscount.toFixed(2)}</span>
          </div>
        )}
        {customDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Custom Discount</span>
            <span>-${customDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {!showCheckout ? (
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Proceed to Checkout
        </button>
      ) : (
        <div className="space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 flex items-center justify-center py-3 px-3 rounded-lg border ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center py-3 px-3 rounded-lg border ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Card
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onCompleteOrder}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Complete Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}