"use client";

import { Order, OrderTotals, Coupon } from '@/app/types/pos';
import OrderTabs from './OrderTabs';
import OrderControls from './OrderControls';
import CartItems from './CartItems';
import CartSummary from './CartSummary';

interface OrdersPanelProps {
  orders: Order[];
  activeOrderId: string;
  activeOrder: Order | undefined;
  draggedOrderId: string | null;
  totals: OrderTotals;
  availableCoupons: Coupon[];
  couponCode: string;
  setCouponCode: (code: string) => void;
  showCheckout: boolean;
  setShowCheckout: (show: boolean) => void;
  paymentMethod: 'cash' | 'card';
  setPaymentMethod: (method: 'cash' | 'card') => void;
  onCreateNewOrder: () => void;
  onDeleteOrder: (orderId: string) => void;
  onSetActiveOrderId: (orderId: string) => void;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetOrderId: string) => void;
  onUpdateActiveOrder: (updates: Partial<Order>) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onApplyCoupon: () => void;
  onCompleteOrder: () => void;
  onShowCustomerModal: () => void;
  onBarcodeScanned: (barcode: string) => void;
}

export default function OrdersPanel({
  orders,
  activeOrderId,
  activeOrder,
  draggedOrderId,
  totals,
  availableCoupons,
  couponCode,
  setCouponCode,
  showCheckout,
  setShowCheckout,
  paymentMethod,
  setPaymentMethod,
  onCreateNewOrder,
  onDeleteOrder,
  onSetActiveOrderId,
  onDragStart,
  onDragOver,
  onDrop,
  onUpdateActiveOrder,
  onUpdateQuantity,
  onRemoveFromCart,
  onApplyCoupon,
  onCompleteOrder,
  onShowCustomerModal,
  onBarcodeScanned
}: OrdersPanelProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-white to-green-50 border-l-4 border-green-900 flex flex-col max-h-screen">
      <OrderTabs
        orders={orders}
        activeOrderId={activeOrderId}
        draggedOrderId={draggedOrderId}
        onCreateNewOrder={onCreateNewOrder}
        onDeleteOrder={onDeleteOrder}
        onSetActiveOrderId={onSetActiveOrderId}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onBarcodeScanned={onBarcodeScanned}
      />

      <div className='overflow-y-auto flex-1'>
        {activeOrder && (
          <OrderControls
            activeOrder={activeOrder}
            onUpdateActiveOrder={onUpdateActiveOrder}
            onShowCustomerModal={onShowCustomerModal}
          />
        )}

        {/* Cart Items */}
        <div className="flex-1 min-h-0 flex flex-col">
          <CartItems
            activeOrder={activeOrder}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveFromCart={onRemoveFromCart}
          />
        </div>

        {activeOrder && activeOrder.cart.length > 0 && (
          <CartSummary
            activeOrder={activeOrder}
            totals={totals}
            availableCoupons={availableCoupons}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            showCheckout={showCheckout}
            setShowCheckout={setShowCheckout}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onUpdateActiveOrder={onUpdateActiveOrder}
            onApplyCoupon={onApplyCoupon}
            onCompleteOrder={onCompleteOrder}
          />
        )}
      </div>
    </div>
  );
}