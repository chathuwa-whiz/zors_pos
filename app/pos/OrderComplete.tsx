"use client";
import { Customer, CartItem, OrderTotals, PaymentDetails } from '../types/pos';
import { Check, Printer, MapPin, Home, Car, User, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OrderCompleteProps {
  totals: OrderTotals;
  items?: CartItem[];
  customer?: Customer;
  orderId?: string;
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  onBackToPOS?: () => void;
  paymentDetails?: PaymentDetails;
  kitchenNote?: string;
  cashierName?: string;
  tableName?: string;
}

type ReceiptTemplate = {
  logoUrl?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  footerGreeting?: string;
};

export default function OrderComplete({
  totals,
  items = [],
  customer,
  orderId,
  orderType,
  onBackToPOS,
  paymentDetails,
  kitchenNote,
  cashierName,
  tableName
}: OrderCompleteProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [template, setTemplate] = useState<ReceiptTemplate>({
    logoUrl: '',
    companyName: 'ZORS POS',
    address: '',
    phone: '',
    email: '',
    footerGreeting: 'Thank you for your business!'
  });

  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('orderCompleteTemplate');
      if (raw) {
        setTemplate(prev => ({ ...prev, ...JSON.parse(raw) }));
      }
    } catch (e) {
      console.error('Failed to load receipt template', e);
    }
  }, []);

  const handlePrint = () => {
    window.print();
    if (onBackToPOS) {
      onBackToPOS();
    }
  };

  const { subtotal, couponDiscount, tableCharge, deliveryCharge, total, discountPercentage, discountAmount } = totals;

  // Calculate final total including bank charges if card payment
  const bankServiceCharge = paymentDetails?.bankServiceCharge || 0;
  const finalTotal = total + bankServiceCharge;

  const getOrderTypeIcon = () => {
    switch (orderType) {
      case 'dine-in':
        return <Home className="w-4 h-4" />;
      case 'delivery':
        return <MapPin className="w-4 h-4" />;
      case 'takeaway':
        return <Car className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => `Rs.${amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
          <p className="text-gray-600">Your order has been processed successfully</p>
        </div>

        {/* Bill/Receipt */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-4">
            {template.logoUrl && (
              <Image
                src={template.logoUrl}
                alt="Company Logo"
                width={128}
                height={128}
                className="mx-auto mb-2 max-h-20 object-contain"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">{template.companyName || 'ZORS POS'}</h1>
            {template.address && <p className="text-sm text-gray-600 whitespace-pre-line">{template.address}</p>}
            <div className="text-xs text-gray-500 mt-1">
              {template.phone && <span>📞 {template.phone} </span>}
              {template.email && <span className="ml-2">| 📧 {template.email}</span>}
            </div>
          </div>

          {/* Receipt Details */}
          <div className="border-b pb-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Receipt Details</p>
                <p className="text-gray-600">Receipt #: {orderId || `RCP-${Date.now().toString().slice(-6)}`}</p>
                <p className="text-gray-600">Date: {currentTime.toLocaleDateString()}</p>
                <p className="text-gray-600">Time: {currentTime.toLocaleTimeString()}</p>
                {cashierName && (
                  <p className="text-gray-600">Cashier: {cashierName}</p>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-700">Order Details</p>
                <div className="flex items-center gap-2 text-gray-600">
                  {getOrderTypeIcon()}
                  <span className="capitalize">{orderType || 'dine-in'}</span>
                </div>
                {tableName && orderType === 'dine-in' && (
                  <p className="text-gray-600">Table: {tableName}</p>
                )}
                {kitchenNote && (
                  <p className="text-gray-600 text-xs mt-1">Note: {kitchenNote}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          {customer && (customer.name || customer.phone || customer.email) && (
            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Customer Information</h3>
              <div className="space-y-1 text-sm">
                {customer.name && (
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    {customer.name}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {customer.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">Items Ordered</h3>
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.product.name}</span>
                      {item.note && (
                        <p className="text-xs text-gray-500 ml-2">Note: {item.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600">x{item.quantity}</span>
                      <span className="ml-4 font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items in order</p>
            )}
          </div>

          {/* Billing Summary */}
          <div className="space-y-2 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">Billing Summary</h3>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Discount</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({discountPercentage}%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {tableCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Table Charge</span>
                <span className="font-medium">{formatCurrency(tableCharge)}</span>
              </div>
            )}

            {deliveryCharge && deliveryCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="font-medium">{formatCurrency(deliveryCharge)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span className="text-gray-700">Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {bankServiceCharge > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Bank Service Charge</span>
                <span>{formatCurrency(bankServiceCharge)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900">
              <span>Final Total</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Payment Information */}
          {paymentDetails && (
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Payment Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentDetails.method}</span>
                </div>
                {paymentDetails.method === 'cash' && paymentDetails.cashGiven && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cash Given:</span>
                      <span>{formatCurrency(paymentDetails.cashGiven)}</span>
                    </div>
                    {paymentDetails.change !== undefined && (
                      <div className="flex justify-between text-green-600">
                        <span>Change:</span>
                        <span className="font-medium">{formatCurrency(paymentDetails.change)}</span>
                      </div>
                    )}
                  </>
                )}
                {paymentDetails.method === 'card' && paymentDetails.invoiceId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice ID:</span>
                    <span className="font-mono text-xs">{paymentDetails.invoiceId}</span>
                  </div>
                )}
                {paymentDetails.bankName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span>{paymentDetails.bankName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {template.footerGreeting || 'Thank you for your business!'}
            </p>
            <p className="text-xs text-gray-500 mb-2">Please keep this receipt for your records</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>🔄 Return Policy: 7 days with receipt</p>
              <p>📞 Support: Call us for any queries</p>
              <p>🌟 Rate us: Share your experience</p>
            </div>
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
              Print Receipt
            </button>

            <button
              onClick={onBackToPOS}
              className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to POS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}