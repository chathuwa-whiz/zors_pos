"use client";

import { useState, useEffect } from 'react';
import { Order, OrderTotals, Coupon } from '@/app/types/pos';
import { CreditCard, Banknote, Calculator } from 'lucide-react';

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
  couponCode,        // will clean up later
  setCouponCode,     // will clean up later
  showCheckout,
  setShowCheckout,
  paymentMethod,
  setPaymentMethod,
  onUpdateActiveOrder,
  onApplyCoupon,     // will clean up later
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

    onUpdateActiveOrder({ paymentDetails });

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

  // Update payment details whenever relevant values change
  useEffect(() => {
    const paymentDetails = {
      method: paymentMethod,
      ...(paymentMethod === 'cash' ? {
        cashGiven: cashGiven,
        change: cashGiven - totals.total
      } : {
        invoiceId: invoiceId,
        bankServiceCharge: selectedBankCharge?.charge || 0,
        bankName: selectedBank
      })
    };

    onUpdateActiveOrder({ paymentDetails });
  }, [paymentMethod, cashGiven, invoiceId, selectedBank, selectedBankCharge?.charge, totals.total, onUpdateActiveOrder]);

  return (
    <div className="border-t-2 border-green-200 p-6 flex-shrink-0 bg-gradient-to-b from-green-50 to-white">
      {/* Totals Section (no coupon input) */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-green-700 text-lg">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">Rs.{subtotal.toFixed(2)}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-lime-600 text-lg">
            <span className="font-medium">Coupon Discount</span>
            <span className="font-semibold">-Rs.{couponDiscount.toFixed(2)}</span>
          </div>
        )}

        {discountPercentage > 0 && (
          <div className="flex justify-between text-lime-600 text-lg">
            <span className="font-medium">Discount ({activeOrder.discountPercentage}%)</span>
            <span className="font-semibold">-Rs.{(subtotal * (activeOrder.discountPercentage / 100)).toFixed(2)}</span>
          </div>
        )}

        {tableCharge > 0 && (
          <div className="flex justify-between text-blue-600 text-lg">
            <span className="font-medium">Table Charge</span>
            <span className="font-semibold">+Rs.{tableCharge.toFixed(2)}</span>
          </div>
        )}

        {deliveryCharge && deliveryCharge > 0 && (
          <div className="flex justify-between text-purple-600 text-lg">
            <span className="font-medium">Delivery Charge</span>
            <span className="font-semibold">+Rs.{deliveryCharge.toFixed(2)}</span>
          </div>
        )}

        {paymentMethod === 'card' && selectedBankCharge && (
          <div className="flex justify-between text-orange-600 text-lg">
            <span className="font-medium">Service Charge ({selectedBank})</span>
            <span className="font-semibold">+Rs.{selectedBankCharge.charge.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-2xl font-bold text-green-900 border-t-2 border-green-200 pt-3 bg-lime-50 px-4 py-3 rounded-xl">
          <span>Total</span>
          <span>Rs.{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout / payment section (unchanged) */}
      {!showCheckout ? (
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full bg-green-900 text-white py-4 rounded-xl font-bold text-xl hover:bg-green-800 transition-all duration-200 active:scale-95 shadow-lg"
        >
          Proceed to Checkout
        </button>
      ) : (
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div className="flex space-x-3">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 py-4 px-6 rounded-xl text-lg font-bold transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 ${paymentMethod === 'cash'
                  ? 'bg-lime-400 text-green-900 shadow-lg'
                  : 'bg-white text-green-900 border-2 border-green-300 hover:bg-lime-50'
                }`}
            >
              <Banknote className="w-6 h-6" />
              <span>Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-4 px-6 rounded-xl text-lg font-bold transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 ${paymentMethod === 'card'
                  ? 'bg-lime-400 text-green-900 shadow-lg'
                  : 'bg-white text-green-900 border-2 border-green-300 hover:bg-lime-50'
                }`}
            >
              <CreditCard className="w-6 h-6" />
              <span>Card</span>
            </button>
          </div>

          {/* Cash Payment Fields */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-green-900 mb-2">
                  Cash Given
                </label>
                <input
                  type="number"
                  value={cashGiven || ''}
                  onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-4 border-2 border-green-300 rounded-xl text-lg font-semibold focus:ring-4 focus:ring-lime-400 focus:border-lime-400 shadow-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-between text-xl bg-lime-100 px-4 py-3 rounded-xl border-2 border-lime-400">
                <span className="text-green-900 font-bold">Change:</span>
                <span className="font-bold text-green-900">
                  Rs.{change.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Card Payment Fields */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-green-900 mb-2">
                  Transaction/Invoice ID
                </label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-green-300 rounded-xl text-lg font-semibold focus:ring-4 focus:ring-lime-400 focus:border-lime-400 shadow-md"
                  placeholder="Enter transaction ID"
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-green-900 mb-2">
                  Bank/Payment Method
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-green-300 rounded-xl text-lg font-semibold focus:ring-4 focus:ring-lime-400 focus:border-lime-400 shadow-md"
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
            className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 ${isPaymentValid()
                ? 'bg-green-900 text-white hover:bg-green-800 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            <Calculator className="w-6 h-6" />
            <span>Complete Order</span>
          </button>
        </div>
      )}
    </div>
  );
}