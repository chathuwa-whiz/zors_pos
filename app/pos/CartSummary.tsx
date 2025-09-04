"use client";

import { useState, useEffect } from 'react';
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
  const { subtotal, couponDiscount, discountPercentage, tableCharge, deliveryCharge, total } = totals;

  const [cashGiven, setCashGiven] = useState<number>(0);
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  const change = Math.max(0, cashGiven - total);
  const selectedBankCharge = bankServiceCharges.find(bank => bank.name === selectedBank);
  const finalTotal = paymentMethod === 'card' && selectedBankCharge
    ? total + selectedBankCharge.charge
    : total;

  const handleCompleteOrder = () => {
    // Create payment details object
    const paymentDetails = {
      method: paymentMethod,
      ...(paymentMethod === 'cash' && {
        cashGiven: cashGiven,
        change: change
      }),
      ...(paymentMethod === 'card' && {
        invoiceId: invoiceId,
        bankServiceCharge: selectedBankCharge?.charge || 0,
        bankName: selectedBank
      })
    };

    console.log('Payment Details being set:', paymentDetails); // Debug log

    // Update the order with payment details first
    onUpdateActiveOrder({ paymentDetails });

    // Small delay to ensure the state update completes before calling onCompleteOrder
    setTimeout(() => {
      onCompleteOrder();
    }, 100);
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

  // When handling payment method change or cash given change:
  const handlePaymentDetailsUpdate = () => {
    const paymentDetails = {
      method: paymentMethod,
      ...(paymentMethod === 'cash' ? {
        cashGiven: cashGiven, // actual user input
        change: cashGiven - totals.total // calculated change
      } : {
        invoiceId: invoiceId,
        bankServiceCharge: selectedBankCharge?.charge || 0,
        bankName: selectedBank
      })
    };

    // Update the active order with payment details
    onUpdateActiveOrder({ paymentDetails });
  };

  // Call this function whenever payment details change
  // And ensure it's called before onCompleteOrder
  useEffect(() => {
    handlePaymentDetailsUpdate();
  }, [paymentMethod, cashGiven, invoiceId, selectedBank]);

  return (
    <div className="border-t border-gray-200 p-4 flex-shrink-0 max-h-96">
      {/* Coupon and Discount Section */}
      <div className="space-y-3 mb-4">
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            Apply
          </button>
        </div>

        {activeOrder.appliedCoupon && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-green-800 text-sm">
                {activeOrder.appliedCoupon.description}
              </span>
              <button
                onClick={() => onUpdateActiveOrder({ appliedCoupon: undefined })}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Remove
              </button>
            </div>
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
          {/* Payment Method Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${paymentMethod === 'cash'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Cash
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${paymentMethod === 'card'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Card
            </button>
          </div>

          {/* Cash Payment Fields */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Given
                </label>
                <input
                  type="number"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Change:</span>
                <span className="font-medium text-green-600">
                  Rs.{change.toFixed(2)}
                </span>
              </div>
              {/* Debug info - remove in production */}
              <div className="text-xs text-gray-500">
                <div>Debug - Cash Given: {cashGiven}</div>
                <div>Debug - Total: {total}</div>
                <div>Debug - Change: {change}</div>
              </div>
            </div>
          )}

          {/* Card Payment Fields */}
          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction/Invoice ID
                </label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Enter transaction ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank/Payment Method
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select bank/method</option>
                  {bankServiceCharges.map((bank) => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name} (+Rs.{bank.charge})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={handleCompleteOrder}
            disabled={!isPaymentValid()}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${isPaymentValid()
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Complete Order
          </button>
        </div>
      )}
    </div>
  );
}