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

  const formatCurrency = (amount: number) => `${amount.toFixed(2)}`;

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
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6 print:shadow-none print:rounded-none font-mono text-sm">
          
          {/* 1. Header Section */}
          <div className="text-center mb-4">
            {template.logoUrl && (
              <Image
                src={template.logoUrl}
                alt="Company Logo"
                width={80}
                height={80}
                className="mx-auto mb-2 max-h-16 object-contain"
              />
            )}
            <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {template.companyName || 'ZORS POS'}
            </h1>
            {template.address && (
              <div className="text-xs text-gray-600 mt-1">
                {template.address}
              </div>
            )}
            <div className="text-xs text-gray-600 mt-1">
              {template.phone && <div>Phone: {template.phone}</div>}
              {template.email && <div>Email: {template.email}</div>}
            </div>
          </div>

          {/* 2. Date & Cashier Information */}
          <div className="text-xs text-gray-700 mb-4 space-y-1">
            <div>Date: {currentTime.toLocaleDateString()}</div>
            <div>Time: {currentTime.toLocaleTimeString()}</div>
            {cashierName && <div>Cashier: {cashierName}</div>}
            <div>Receipt #: {orderId || `RCP-${Date.now().toString().slice(-6)}`}</div>
            {tableName && orderType === 'dine-in' && (
              <div>Table: {tableName}</div>
            )}
          </div>

          {/* Horizontal line */}
          <div className="border-t border-gray-400 mb-3"></div>

          {/* 3. Item Table */}
          <div className="mb-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-1 text-xs font-bold text-gray-800 mb-2">
              <div className="col-span-1">No</div>
              <div className="col-span-6">Item</div>
              <div className="col-span-1 text-center">QTY</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            
            {/* Table Items */}
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="grid grid-cols-12 gap-1 text-xs text-gray-700">
                      <div className="col-span-1">{index + 1}</div>
                      <div className="col-span-6">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-gray-500">ID: {item.product._id || `${index + 1}000${index + 1}`}</div>
                      </div>
                      <div className="col-span-1 text-center">{item.quantity}</div>
                      <div className="col-span-2 text-right">{formatCurrency(item.product.sellingPrice)}</div>
                      <div className="col-span-2 text-right">{formatCurrency(item.subtotal)}</div>
                    </div>
                    {item.note && (
                      <div className="text-xs text-gray-500 ml-8">Note: {item.note}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center py-4">No items in order</div>
            )}
          </div>

          {/* Horizontal line */}
          <div className="border-t border-gray-400 mb-3"></div>

          {/* 4. Total Summary Section */}
          <div className="space-y-1 text-xs mb-4">
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span>Coupon Discount:</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Discount ({discountPercentage}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {tableCharge > 0 && (
              <div className="flex justify-between">
                <span>Table Charge:</span>
                <span>{formatCurrency(tableCharge)}</span>
              </div>
            )}

            {deliveryCharge && deliveryCharge > 0 && (
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span>{formatCurrency(deliveryCharge)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold">
              <span>Net Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {bankServiceCharge > 0 && (
              <div className="flex justify-between">
                <span>Bank Service Charge:</span>
                <span>{formatCurrency(bankServiceCharge)}</span>
              </div>
            )}

            {/* Payment Information */}
            {paymentDetails && (
              <>
                {paymentDetails.method === 'cash' && paymentDetails.cashGiven && (
                  <>
                    <div className="flex justify-between">
                      <span>Cash Given:</span>
                      <span>{formatCurrency(paymentDetails.cashGiven)}</span>
                    </div>
                    {paymentDetails.change !== undefined && (
                      <div className="flex justify-between">
                        <span>Changes:</span>
                        <span>{formatCurrency(paymentDetails.change)}</span>
                      </div>
                    )}
                  </>
                )}
                
                {paymentDetails.method === 'card' && (
                  <div className="flex justify-between">
                    <span>Card Balance:</span>
                    <span>0.00</span>
                  </div>
                )}

                {paymentDetails.method === 'card' && paymentDetails.invoiceId && (
                  <div className="flex justify-between">
                    <span>Invoice ID:</span>
                    <span className="text-xs">{paymentDetails.invoiceId}</span>
                  </div>
                )}

                {paymentDetails.bankName && (
                  <div className="flex justify-between">
                    <span>Bank:</span>
                    <span>{paymentDetails.bankName}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>Final Total:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Customer Information (if exists) */}
          {customer && (customer.name || customer.phone || customer.email) && (
            <>
              <div className="border-t border-gray-400 mb-3"></div>
              <div className="text-xs mb-4">
                <div className="font-bold mb-1">Customer Information:</div>
                {customer.name && <div>Name: {customer.name}</div>}
                {customer.phone && <div>Phone: {customer.phone}</div>}
                {customer.email && <div>Email: {customer.email}</div>}
              </div>
            </>
          )}

          {/* 5. Footer */}
          <div className="text-center mt-4 pt-3 border-t border-gray-400">
            <div className="text-sm font-bold text-gray-800 mb-2">
              {template.footerGreeting || 'Thank you come again!'}
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Please keep this receipt for your records</div>
              <div>Return Policy: 7 days with receipt</div>
              {kitchenNote && (
                <div className="mt-2 text-xs text-gray-600">
                  Kitchen Note: {kitchenNote}
                </div>
              )}
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