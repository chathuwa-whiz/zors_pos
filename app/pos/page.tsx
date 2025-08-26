"use client";

import { useState, useEffect } from 'react';
import { Product, Order, Coupon, OrderTotals, CartItem } from '@/app/types/pos';
import { User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import ProductsPanel from './ProductsPanel';
import OrdersPanel from './OrdersPanel';
import CustomerModal from './CustomerModal';
import OrderComplete from './OrderComplete';

export default function POSSystem() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Multi-order management
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  // UI States
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');

  // Coupons
  const [availableCoupons] = useState<Coupon[]>([
    { code: 'SAVE10', discount: 10, type: 'percentage', description: '10% off entire order' },
    { code: 'COFFEE5', discount: 5, type: 'fixed', applicableItems: ['1', '2', '3', '4'], description: '$5 off coffee items' },
    { code: 'WELCOME', discount: 15, type: 'percentage', description: '15% off for new customers' }
  ]);

  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'null') {
      setUser(JSON.parse(storedUser));
    }

    // Mock products data
    const mockProducts: Product[] = [
      { id: '1', name: 'Espresso', costPrice: 2.00, sellingPrice: 2.50, category: 'Coffee', stock: 50, description: 'Rich and bold coffee shot' },
      { id: '2', name: 'Cappuccino', costPrice: 3.00, sellingPrice: 4.50, category: 'Coffee', stock: 45, description: 'Coffee with steamed milk foam' },
      { id: '3', name: 'Latte', costPrice: 3.50, sellingPrice: 5.00, category: 'Coffee', stock: 40, description: 'Coffee with steamed milk' },
      { id: '4', name: 'Americano', costPrice: 2.50, sellingPrice: 3.50, category: 'Coffee', stock: 55, description: 'Espresso with hot water' },
      { id: '5', name: 'Croissant', costPrice: 1.50, sellingPrice: 3.25, category: 'Bakery', stock: 20, description: 'Fresh buttery pastry' },
      { id: '6', name: 'Muffin', costPrice: 1.00, sellingPrice: 2.75, category: 'Bakery', stock: 25, description: 'Blueberry muffin' },
      { id: '7', name: 'Sandwich', costPrice: 5.00, sellingPrice: 8.50, category: 'Food', stock: 15, description: 'Club sandwich with fries' },
      { id: '8', name: 'Salad', costPrice: 6.00, sellingPrice: 9.75, category: 'Food', stock: 12, description: 'Fresh garden salad' },
      { id: '9', name: 'Orange Juice', costPrice: 2.50, sellingPrice: 3.75, category: 'Beverages', stock: 30, description: 'Fresh squeezed juice' },
      { id: '10', name: 'Smoothie', costPrice: 4.00, sellingPrice: 6.25, category: 'Beverages', stock: 18, description: 'Mixed berry smoothie' },
    ];

    setProducts(mockProducts);
    setCategories(['All', ...Array.from(new Set(mockProducts.map(p => p.category)))]);

    // Initialize with first order
    const initialOrder: Order = {
      id: '1',
      name: 'Live Bill',
      cart: [],
      customer: {},
      cashier: user!,
      orderType: 'dine-in',
      customDiscount: 0,
      kitchenNote: '',
      createdAt: new Date(),
      status: 'active',
      isDefault: true
    };
    setOrders([initialOrder]);
    setActiveOrderId('1');
  }, []);

  const activeOrder = orders.find(order => order.id === activeOrderId);

  // Generate next table number
  const getNextTableNumber = () => {
    const tableOrders = orders.filter(order => order.name.startsWith('Table ') && !order.isDefault);
    const tableNumbers = tableOrders.map(order => {
      const match = order.name.match(/Table (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    return tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;
  };

  // Create new order without prompting for name
  const createNewOrder = () => {
    const newOrderId = (Date.now()).toString();
    const tableNumber = getNextTableNumber();
    const newOrder: Order = {
      id: newOrderId,
      name: `Table ${tableNumber}`,
      cart: [],
      customer: {},
      cashier: user!,
      orderType: 'dine-in',
      customDiscount: 0,
      kitchenNote: '',
      createdAt: new Date(),
      status: 'active'
    };
    setOrders([...orders, newOrder]);
    setActiveOrderId(newOrderId);
  };

  // Delete order
  const deleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(order => order.id === orderId);

    // Don't allow deleting the default "Live Bill" order
    if (orderToDelete?.isDefault) {
      return;
    }

    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);

    // If we deleted the active order, switch to another one
    if (activeOrderId === orderId) {
      const remainingActiveOrders = updatedOrders.filter(order => order.status === 'active');
      if (remainingActiveOrders.length > 0) {
        setActiveOrderId(remainingActiveOrders[0].id);
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetOrderId: string) => {
    e.preventDefault();

    if (!draggedOrderId || draggedOrderId === targetOrderId) {
      setDraggedOrderId(null);
      return;
    }

    const draggedOrder = orders.find(order => order.id === draggedOrderId);
    const targetOrder = orders.find(order => order.id === targetOrderId);

    // Don't allow reordering with the default order
    if (draggedOrder?.isDefault || targetOrder?.isDefault) {
      setDraggedOrderId(null);
      return;
    }

    const draggedIndex = orders.findIndex(order => order.id === draggedOrderId);
    const targetIndex = orders.findIndex(order => order.id === targetOrderId);

    const newOrders = [...orders];
    const [removed] = newOrders.splice(draggedIndex, 1);
    newOrders.splice(targetIndex, 0, removed);

    setOrders(newOrders);
    setDraggedOrderId(null);
  };

  // Update active order
  const updateActiveOrder = (updates: Partial<Order>) => {
    setOrders(orders.map(order =>
      order.id === activeOrderId
        ? { ...order, ...updates }
        : order
    ));
  };

  // Add to cart
  const addToCart = (product: Product) => {
    if (!activeOrder) return;

    const existingItem = activeOrder.cart.find(item => item.product.id === product.id);

    if (existingItem) {
      const updatedCart = activeOrder.cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.sellingPrice }
          : item
      );
      updateActiveOrder({ cart: updatedCart });
    } else {
      const updatedCart = [...activeOrder.cart, { product, quantity: 1, subtotal: product.sellingPrice }];
      updateActiveOrder({ cart: updatedCart });
    }
  };

  // Update cart quantity
  const updateQuantity = (productId: string, change: number) => {
    if (!activeOrder) return;

    const updatedCart = activeOrder.cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0
          ? null
          : { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.sellingPrice };
      }
      return item;
    }).filter(Boolean) as CartItem[];

    updateActiveOrder({ cart: updatedCart });
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    if (!activeOrder) return;
    const updatedCart = activeOrder.cart.filter(item => item.product.id !== productId);
    updateActiveOrder({ cart: updatedCart });
  };

  // Apply coupon
  const applyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
    if (coupon && activeOrder) {
      updateActiveOrder({ appliedCoupon: coupon });
      setCouponCode('');
    }
  };

  // Calculate totals
  const calculateTotals = (): OrderTotals => {
    if (!activeOrder) return { subtotal: 0, couponDiscount: 0, customDiscount: 0, discount: 0, total: 0 };

    const subtotal = activeOrder.cart.reduce((sum, item) => sum + item.subtotal, 0);

    let couponDiscount = 0;
    if (activeOrder.appliedCoupon) {
      const coupon = activeOrder.appliedCoupon;
      if (coupon.applicableItems) {
        const applicableAmount = activeOrder.cart
          .filter(item => coupon.applicableItems!.includes(item.product.id))
          .reduce((sum, item) => sum + item.subtotal, 0);
        couponDiscount = coupon.type === 'percentage'
          ? (applicableAmount * coupon.discount / 100)
          : Math.min(coupon.discount, applicableAmount);
      } else {
        couponDiscount = coupon.type === 'percentage'
          ? (subtotal * coupon.discount / 100)
          : coupon.discount;
      }
    }

    const customDiscount = activeOrder.customDiscount || 0;
    const discountedAmount = subtotal - couponDiscount - customDiscount;
    const discount = Math.max(0, discountedAmount) * 0.08;
    const total = Math.max(0, discountedAmount) - discount;

    return { subtotal, couponDiscount, customDiscount, discount, total };
  };

  const totals = calculateTotals();

  // Complete order
  const completeOrder = () => {
    if (!activeOrder) return;

    console.log('Order completed:', {
      ...activeOrder,
      paymentMethod,
      totals,
      timestamp: new Date()
    });

    updateActiveOrder({ status: 'completed' });
    setOrderComplete(true);

    // The bill will remain visible until user manually goes back to POS
    const updatedOrders = orders.filter(order => order.id !== activeOrderId);
    setOrders(updatedOrders);

    if (updatedOrders.length > 0) {
      const remainingActiveOrders = updatedOrders.filter(order => order.status === 'active');
      if (remainingActiveOrders.length > 0) {
        setActiveOrderId(remainingActiveOrders[0].id);
      }
    } else {
      // Create new default order if no orders left
      const newOrder: Order = {
        id: (Date.now()).toString(),
        name: 'Live Bill',
        cart: [],
        customer: {},
        cashier: user!,
        orderType: 'dine-in',
        customDiscount: 0,
        kitchenNote: '',
        createdAt: new Date(),
        status: 'active',
        isDefault: true
      };
      setOrders([newOrder]);
      setActiveOrderId(newOrder.id);
    }

    // Keep setShowCheckout(false) here but don't reset orderComplete automatically
    setShowCheckout(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to access POS system</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete && activeOrder) {
    return (
      <OrderComplete
        total={totals.total}
        items={activeOrder.cart}
        customer={activeOrder.customer}
        orderId={activeOrder.id}
        onBackToPOS={() => { setOrderComplete(false) }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ProductsPanel
        user={user}
        products={products}
        categories={categories}
        onAddToCart={addToCart}
      />

      <OrdersPanel
        orders={orders}
        activeOrderId={activeOrderId}
        activeOrder={activeOrder}
        draggedOrderId={draggedOrderId}
        totals={totals}
        availableCoupons={availableCoupons}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        showCheckout={showCheckout}
        setShowCheckout={setShowCheckout}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onCreateNewOrder={createNewOrder}
        onDeleteOrder={deleteOrder}
        onSetActiveOrderId={setActiveOrderId}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onUpdateActiveOrder={updateActiveOrder}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
        onApplyCoupon={applyCoupon}
        onCompleteOrder={completeOrder}
        onShowCustomerModal={() => setShowCustomerModal(true)}
      />

      {showCustomerModal && activeOrder && (
        <CustomerModal
          activeOrder={activeOrder}
          onClose={() => setShowCustomerModal(false)}
          onUpdateActiveOrder={updateActiveOrder}
        />
      )}
    </div>
  );
}