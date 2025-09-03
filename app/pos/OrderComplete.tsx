"use client";
import { Customer, CartItem, OrderTotals } from '../types/pos';
import { Check, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OrderCompleteProps {
  totals: OrderTotals;
  items?: CartItem[];
  customer?: Customer;
  orderId?: string;
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  onBackToPOS?: () => void;
}

export default function OrderComplete({
  totals,
  items = [],
  customer,
  orderId,
  orderType,
  onBackToPOS
}: OrderCompleteProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  const handlePrint = () => {
    window.print();
    onBackToPOS && onBackToPOS();
  };

  const { subtotal, couponDiscount, customDiscount, tableCharge, total } = totals;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
        </div>

        {/* Bill/Receipt */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-xl font-bold text-gray-900">ZORS POS</h1>
            <p className="text-sm text-gray-600">Point of Sale System</p>
            <p className="text-xs text-gray-500 mt-1">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Order Details */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Order ID:</span>
              <span>{orderId || `ORD-${Date.now().toString().slice(-6)}`}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Order Type:</span>
              <span className="capitalize">{orderType || 'dine-in'}</span>
            </div>
            {customer && (
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Customer:</span>
                  <span>{customer.name}</span>
                </div>
                {customer.phone && (
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">Phone:</span>
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-b py-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Items</h3>
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.product.name}</span>
                      <div className="text-gray-500">
                        {item.quantity} × Rs.{item.product.sellingPrice.toFixed(2)}
                      </div>
                    </div>
                    <span className="font-medium">Rs.{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items found</p>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Discount:</span>
                <span>-Rs.{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            {tableCharge > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Table Charge:</span>
                <span>+Rs.{tableCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>Rs.{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500">Thank you for your business!</p>
            <p className="text-xs text-gray-500">Please keep this receipt for your records</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 print:hidden">
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            {/* <button
              onClick={handleDownload}
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button> */}
          </div>

          {/* <button
            onClick={onBackToPOS}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to POS
          </button> */}
        </div>
      </div>
    </div>
  );
}