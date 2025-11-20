"use client";
import { Customer, CartItem, OrderTotals, PaymentDetails } from '../types/pos';
import { Check, Printer, MapPin, Home, Car, User, Phone, Mail, Calendar } from 'lucide-react';
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

  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  const handlePrint = () => {
    window.print();
    if (onBackToPOS) {
      onBackToPOS();
    }
  };

  const { subtotal, couponDiscount, tableCharge, deliveryCharge, total, discountPercentage, discountAmount } = totals;

  console.log('OrderComplete - Totals:', totals);
  console.log('OrderComplete - PaymentDetails:', paymentDetails);

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
            <h1 className="text-2xl font-bold text-gray-900">ZORS POS</h1>
            <p className="text-sm text-gray-600">Point of Sale System</p>
            <p className="text-xs text-gray-500 mt-1">
              📍 Your Business Address Here
            </p>
            <p className="text-xs text-gray-500">
              📞 Your Phone Number | 📧 Your Email
            </p>
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
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Customer Information
              </h3>
              <div className="text-sm space-y-1">
                {customer.name && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-16">Name:</span>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                )}
                {customer._id && (
                  <div className="flex items-center">
                    <span className="text-gray-600 w-16">ID:</span>
                    <span className="text-xs text-gray-500">{customer._id}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    <span className="text-gray-600 w-14">Phone:</span>
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    <span className="text-gray-600 w-14">Email:</span>
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.birthDate && (
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span className="text-gray-600 w-14">DOB:</span>
                    <span>{new Date(customer.birthDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">Items Ordered</h3>
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <div className="text-gray-500 text-xs">
                        <span>{item.quantity} × {formatCurrency(item.product.sellingPrice)}</span>
                        {item.product.discount && item.product.discount > 0 && (
                          <span className="ml-2 text-green-600">
                            ({item.product.discount}% off)
                          </span>
                        )}
                      </div>
                      {item.note && (
                        <p className="text-xs text-gray-500 italic">Note: {item.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items found</p>
            )}
          </div>

          {/* Billing Summary */}
          <div className="space-y-2 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">Billing Summary</h3>

            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {/* Discounts */}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Discount:</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({discountPercentage}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            {/* Additional Charges */}
            {tableCharge > 0 && (
              <div className="flex justify-between text-sm text-blue-600">
                <span>Table Charge:</span>
                <span>+{formatCurrency(tableCharge)}</span>
              </div>
            )}

            {deliveryCharge && deliveryCharge > 0 && (
              <div className="flex justify-between text-sm text-purple-600">
                <span>Delivery Charge:</span>
                <span>+{formatCurrency(deliveryCharge)}</span>
              </div>
            )}

            {/* Order Total */}
            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span>Order Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            {/* Bank Service Charge */}
            {bankServiceCharge > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>Service Charge ({paymentDetails?.bankName}):</span>
                <span>+{formatCurrency(bankServiceCharge)}</span>
              </div>
            )}

            {/* Final Total */}
            <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900">
              <span>Final Total:</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          {/* Payment Information */}
          {paymentDetails && (
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium capitalize">{paymentDetails.method}</span>
                </div>

                {paymentDetails.method === 'cash' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span>{formatCurrency(paymentDetails.cashGiven || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Change:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(paymentDetails.change || 0)}
                      </span>
                    </div>
                  </>
                )}

                {paymentDetails.method === 'card' && (
                  <>
                    {paymentDetails.invoiceId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium">{paymentDetails.invoiceId}</span>
                      </div>
                    )}
                    {paymentDetails.bankName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span>{paymentDetails.bankName}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600">✓ Paid</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2">Thank you for your business!</p>
            <p className="text-xs text-gray-500 mb-2">Please keep this receipt for your records</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>🔄 Return Policy: 7 days with receipt</p>
              <p>📞 Support: Call us for any queries</p>
              <p>🌟 Rate us: Share your experience</p>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center mt-4 pt-4 border-t">
            <div className="w-16 h-16 bg-gray-200 mx-auto mb-2 flex items-center justify-center text-xs text-gray-500">
              QR Code
            </div>
            <p className="text-xs text-gray-500">Scan for digital receipt</p>
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