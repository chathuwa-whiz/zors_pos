"use client";

import { useState } from 'react';
import { Percent, Tag, X, DollarSign, CreditCard, Receipt } from 'lucide-react';
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

const bankServiceCharges = [
  { name: 'Visa', charge: 2.5 },
  { name: 'Mastercard', charge: 2.3 },
  { name: 'American Express', charge: 3.0 },
  { name: 'Local Bank', charge: 1.5 },
  { name: 'PayPal', charge: 2.9 }
];

export default function CartSummary({
  activeOrder,
  totals,
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
  const { subtotal, couponDiscount, customDiscount, discountPercentage, tableCharge, deliveryCharge, total } = totals;

  const [cashGiven, setCashGiven] = useState<number>(0);
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  const change = Math.max(0, cashGiven - total);
  const selectedBankCharge = bankServiceCharges.find(bank => bank.name === selectedBank);
  const finalTotal = paymentMethod === 'card' && selectedBankCharge
    ? total + selectedBankCharge.charge
    : total;

  const handleCompleteOrder = () => {
    const paymentDetails = {
      method: paymentMethod,
      ...(paymentMethod === 'cash' && {
        cashGiven,
        change
      }),
      ...(paymentMethod === 'card' && {
        invoiceId,
        bankServiceCharge: selectedBankCharge?.charge || 0,
        bankName: selectedBank
      })
    };

    onUpdateActiveOrder({ paymentDetails });
    onCompleteOrder();
  };

  const isPaymentValid = () => {
    if (paymentMethod === 'cash') {
      return cashGiven >= total;
    }
    if (paymentMethod === 'card') {
      return invoiceId.trim() !== '' && selectedBank !== '';
    }
    return false;
  };

  return (
    <div className="border-t border-gray-200 p-4 flex-shrink-0 max-h-96">
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
          <span>Rs.{subtotal.toFixed(2)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span>-Rs.{couponDiscount.toFixed(2)}</span>
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({activeOrder.discountPercentage}%)</span>
            <span>-Rs.{discountPercentage.toFixed(2)}</span>
          </div>
        )}
        {tableCharge > 0 && (
          <div className="flex justify-between text-blue-600">
            <span>Table Charge</span>
            <span>+Rs.{tableCharge.toFixed(2)}</span>
          </div>
        )}
        {deliveryCharge && deliveryCharge > 0 && (
          <div className="flex justify-between text-purple-600">
            <span>Delivery Charge</span>
            <span>+Rs.{deliveryCharge.toFixed(2)}</span>
          </div>
        )}
        {paymentMethod === 'card' && selectedBankCharge && (
          <div className="flex justify-between text-orange-600">
            <span>Bank Service Charge ({selectedBank})</span>
            <span>+Rs.{selectedBankCharge.charge.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
          <span>Total</span>
          <span>Rs.{finalTotal.toFixed(2)}</span>
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
                className={`flex-1 flex items-center justify-center py-3 px-3 rounded-lg border ${paymentMethod === 'cash'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center py-3 px-3 rounded-lg border ${paymentMethod === 'card'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Card
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 p-4 bg-green-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Given by Customer
                </label>
                <div className="relative">
                  <div className="absolute left-3 bottom-1/2 transform w-4 h-4 text-gray-500">Rs.</div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {cashGiven > 0 && (
                <div className="space-y-2 pt-2 border-t border-green-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">Rs.{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cash Given:</span>
                    <span className="font-medium">Rs.{cashGiven.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span className={change >= 0 ? 'text-green-700' : 'text-red-600'}>
                      {change >= 0 ? 'Change:' : 'Still Owe:'}
                    </span>
                    <span className={change >= 0 ? 'text-green-700' : 'text-red-600'}>
                      Rs.{Math.abs(change).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Payment Details */}
          {paymentMethod === 'card' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice/Transaction ID
                </label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Enter transaction ID"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank/Payment Service
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select payment method</option>
                  {bankServiceCharges.map(bank => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name} (+Rs.{bank.charge.toFixed(2)} service charge)
                    </option>
                  ))}
                </select>
              </div>

              {selectedBankCharge && (
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Order Total:</span>
                    <span>Rs.{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Service Charge:</span>
                    <span>+Rs.{selectedBankCharge.charge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-blue-700 mt-1">
                    <span>Final Total:</span>
                    <span>Rs.{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCompleteOrder}
              disabled={!isPaymentValid()}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${isPaymentValid()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Complete Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}