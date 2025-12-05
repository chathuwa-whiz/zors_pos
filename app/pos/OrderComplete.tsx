"use client";
import { Customer, CartItem, OrderTotals, PaymentDetails } from '../types/pos';
import { Check, Printer } from 'lucide-react';
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
    footerGreeting: 'Thank you come again!'
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

  const formatCurrency = (amount: number) => amount.toFixed(2);

  // Calculate total discount
  const totalDiscount = (couponDiscount || 0) + (discountAmount || 0);
  const totalDiscountPercentage = discountPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Success Header - Hidden on print */}
        <div className="text-center mb-6 print:hidden">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
          <p className="text-gray-600">Your order has been processed successfully</p>
        </div>

        {/* Bill/Receipt */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 print:shadow-none print:rounded-none print:p-4 font-mono text-sm">
          
          {/* ========== 1. Header Section ========== */}
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
            <h1 className="text-lg font-bold uppercase tracking-wide">
              {template.companyName || 'ZORS POS'}
            </h1>
            {template.address && (
              <p className="text-xs text-gray-600">{template.address}</p>
            )}
            {(template.phone || template.email) && (
              <p className="text-xs text-gray-600">
                {template.phone && <span>Tel: {template.phone}</span>}
                {template.phone && template.email && <span> | </span>}
                {template.email && <span>{template.email}</span>}
              </p>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-400 my-3"></div>

          {/* ========== 2. Date & Cashier Information ========== */}
          <div className="mb-3">
            <div className="flex justify-between text-xs">
              <span>Date: {currentTime.toLocaleDateString()}</span>
              <span>Time: {currentTime.toLocaleTimeString()}</span>
            </div>
            {cashierName && (
              <div className="text-xs">
                <span>Cashier: {cashierName}</span>
              </div>
            )}
            <div className="text-xs">
              <span>Receipt #: {orderId || `RCP-${Date.now().toString().slice(-6)}`}</span>
            </div>
            {orderType && (
              <div className="text-xs capitalize">
                <span>Order Type: {orderType}</span>
                {tableName && orderType === 'dine-in' && <span> | Table: {tableName}</span>}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-400 my-3"></div>

          {/* ========== 3. Item Table ========== */}
          <div className="mb-3">
            {/* Table Header */}
            <div className="flex text-xs font-bold border-b border-gray-300 pb-1 mb-2">
              <span className="w-8 text-center">No</span>
              <span className="flex-1">Item</span>
              <span className="w-10 text-center">QTY</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-20 text-right">Amount</span>
            </div>

            {/* Table Body */}
            {items.length > 0 ? (
              <div className="space-y-1">
                {items.map((item, index) => (
                  <div key={index} className="flex text-xs">
                    <span className="w-8 text-center">{index + 1}</span>
                    <div className="flex-1">
                      <span className="block">{item.product.name}</span>
                      {item.product.barcode && (
                        <span className="text-gray-500 text-[10px]">ID: {item.product.barcode}</span>
                      )}
                      {item.note && (
                        <span className="text-gray-500 text-[10px] block">Note: {item.note}</span>
                      )}
                    </div>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <span className="w-16 text-right">{formatCurrency(item.product.sellingPrice)}</span>
                    <span className="w-20 text-right">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">No items</p>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-dashed border-gray-400 my-3"></div>

          {/* ========== 4. Total Summary Section ========== */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount ({totalDiscountPercentage}%):</span>
              <span>{formatCurrency(totalDiscount)}</span>
            </div>

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

            {bankServiceCharge > 0 && (
              <div className="flex justify-between">
                <span>Bank Service Charge:</span>
                <span>{formatCurrency(bankServiceCharge)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold border-t border-gray-300 pt-1 mt-2">
              <span>Net Total:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>

            {/* Payment Details */}
            {paymentDetails && (
              <>
                <div className="border-t border-dashed border-gray-300 my-2"></div>
                
                {paymentDetails.method === 'cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>Cash Given:</span>
                      <span>{formatCurrency(paymentDetails.cashGiven || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change:</span>
                      <span>{formatCurrency(paymentDetails.change || 0)}</span>
                    </div>
                  </>
                )}

                {paymentDetails.method === 'card' && (
                  <>
                    <div className="flex justify-between">
                      <span>Card Payment:</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                    {paymentDetails.bankName && (
                      <div className="flex justify-between">
                        <span>Bank:</span>
                        <span>{paymentDetails.bankName}</span>
                      </div>
                    )}
                    {paymentDetails.invoiceId && (
                      <div className="flex justify-between">
                        <span>Invoice ID:</span>
                        <span>{paymentDetails.invoiceId}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between">
                  <span>Card Balance:</span>
                  <span>0.00</span>
                </div>
              </>
            )}
          </div>

          {/* Customer Info (if available) */}
          {customer && (customer.name || customer.phone) && (
            <>
              <div className="border-t border-dashed border-gray-400 my-3"></div>
              <div className="text-xs">
                <p className="font-bold mb-1">Customer:</p>
                {customer.name && <p>{customer.name}</p>}
                {customer.phone && <p>Tel: {customer.phone}</p>}
              </div>
            </>
          )}

          {/* Kitchen Note */}
          {kitchenNote && (
            <>
              <div className="border-t border-dashed border-gray-400 my-3"></div>
              <div className="text-xs">
                <p className="font-bold">Kitchen Note:</p>
                <p className="text-gray-600">{kitchenNote}</p>
              </div>
            </>
          )}

          {/* Separator */}
          <div className="border-t border-dashed border-gray-400 my-3"></div>

          {/* ========== 5. Footer ========== */}
          <div className="text-center">
            <p className="text-sm font-medium">
              {template.footerGreeting || 'Thank you come again!'}
            </p>
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
