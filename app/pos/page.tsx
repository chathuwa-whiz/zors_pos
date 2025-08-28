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

  // Persist orders to localStorage
  const saveOrdersToStorage = (ordersToSave: Order[]) => {
    try {
      const serializedOrders = ordersToSave.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString() // Convert Date to string
      }));
      localStorage.setItem('posOrders', JSON.stringify(serializedOrders));
    } catch (error) {
      console.error('Failed to save orders to localStorage:', error);
    }
  };

  // Load orders from localStorage
  const loadOrdersFromStorage = (): Order[] => {
    try {
      const storedOrders = localStorage.getItem('posOrders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        return parsedOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt) // Convert string back to Date
        }));
      }
    } catch (error) {
      console.error('Failed to load orders from localStorage:', error);
    }
    return [];
  };

  // Save active order ID to localStorage
  const saveActiveOrderIdToStorage = (orderId: string) => {
    try {
      localStorage.setItem('activeOrderId', orderId);
    } catch (error) {
      console.error('Failed to save active order ID:', error);
    }
  };

  // Load active order ID from localStorage
  const loadActiveOrderIdFromStorage = (): string => {
    try {
      return localStorage.getItem('activeOrderId') || '';
    } catch (error) {
      console.error('Failed to load active order ID:', error);
      return '';
    }
  };

  // Clear POS data from localStorage
  const clearPOSStorage = () => {
    try {
      localStorage.removeItem('posOrders');
      localStorage.removeItem('activeOrderId');
    } catch (error) {
      console.error('Failed to clear POS storage:', error);
    }
  };

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'null') {
      setUser(JSON.parse(storedUser));
    }

    // Mock products data
    const mockProducts: Product[] = [
      { _id: '1', name: 'Espresso', costPrice: 2.00, sellingPrice: 2.50, category: 'Coffee', stock: 50, description: 'Rich and bold coffee shot' },
      { _id: '2', name: 'Cappuccino', costPrice: 3.00, sellingPrice: 4.50, category: 'Coffee', stock: 45, description: 'Coffee with steamed milk foam' },
      { _id: '3', name: 'Latte', costPrice: 3.50, sellingPrice: 5.00, category: 'Coffee', stock: 40, description: 'Coffee with steamed milk' },
      { _id: '4', name: 'Americano', costPrice: 2.50, sellingPrice: 3.50, category: 'Coffee', stock: 55, description: 'Espresso with hot water' },
      { _id: '5', name: 'Croissant', costPrice: 1.50, sellingPrice: 3.25, category: 'Bakery', stock: 20, description: 'Fresh buttery pastry' },
      { _id: '6', name: 'Muffin', costPrice: 1.00, sellingPrice: 2.75, category: 'Bakery', stock: 25, description: 'Blueberry muffin' },
      { _id: '7', name: 'Sandwich', costPrice: 5.00, sellingPrice: 8.50, category: 'Food', stock: 15, description: 'Club sandwich with fries' },
      { _id: '8', name: 'Salad', costPrice: 6.00, sellingPrice: 9.75, category: 'Food', stock: 12, description: 'Fresh garden salad' },
      { _id: '9', name: 'Orange Juice', costPrice: 2.50, sellingPrice: 3.75, category: 'Beverages', stock: 30, description: 'Fresh squeezed juice' },
      { _id: '10', name: 'Smoothie', costPrice: 4.00, sellingPrice: 6.25, category: 'Beverages', stock: 18, description: 'Mixed berry smoothie' },
    ];

    setProducts(mockProducts);
    setCategories(['All', ...Array.from(new Set(mockProducts.map(p => p.category)))]);

    // Load existing orders from localStorage
    const savedOrders = loadOrdersFromStorage();
    const savedActiveOrderId = loadActiveOrderIdFromStorage();

    if (savedOrders.length > 0) {
      // Restore saved orders
      setOrders(savedOrders);

      // Validate saved active order ID
      const validActiveOrder = savedOrders.find(order => order.id === savedActiveOrderId && order.status === 'active');
      if (validActiveOrder) {
        setActiveOrderId(savedActiveOrderId);
      } else {
        // If saved active order is invalid, use the first active order
        const firstActiveOrder = savedOrders.find(order => order.status === 'active');
        if (firstActiveOrder) {
          setActiveOrderId(firstActiveOrder.id);
          saveActiveOrderIdToStorage(firstActiveOrder.id);
        }
      }
    } else {
      // Initialize with default order if no saved orders
      const initialOrder: Order = {
        id: '1',
        name: 'Live Bill',
        cart: [],
        customer: {},
        cashier: user!,
        orderType: 'dine-in',
        customDiscount: 0,
        kitchenNote: '',
        tableCharge: 0,
        createdAt: new Date(),
        status: 'active',
        isDefault: true
      };
      const initialOrders = [initialOrder];
      setOrders(initialOrders);
      setActiveOrderId('1');
      saveOrdersToStorage(initialOrders);
      saveActiveOrderIdToStorage('1');
    }
  }, []);

  // Update orders effect to save to localStorage
  useEffect(() => {
    if (orders.length > 0) {
      saveOrdersToStorage(orders);
    }
  }, [orders]);

  // Update active order ID effect to save to localStorage
  useEffect(() => {
    if (activeOrderId) {
      saveActiveOrderIdToStorage(activeOrderId);
    }
  }, [activeOrderId]);

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
      tableCharge: 0,
      createdAt: new Date(),
      status: 'active'
    };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
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
    const updatedOrders = orders.map(order =>
      order.id === activeOrderId
        ? { ...order, ...updates }
        : order
    );
    setOrders(updatedOrders);
  };

  // Add to cart
  const addToCart = (product: Product) => {
    if (!activeOrder) return;

    const existingItem = activeOrder.cart.find(item => item.product._id === product._id);

    if (existingItem) {
      const updatedCart = activeOrder.cart.map(item =>
        item.product._id === product._id
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
      if (item.product._id === productId) {
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
    const updatedCart = activeOrder.cart.filter(item => item.product._id !== productId);
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
    if (!activeOrder) return { subtotal: 0, couponDiscount: 0, customDiscount: 0, tableCharge: 0, total: 0 };

    const subtotal = activeOrder.cart.reduce((sum, item) => sum + item.subtotal, 0);

    let couponDiscount = 0;
    if (activeOrder.appliedCoupon) {
      const coupon = activeOrder.appliedCoupon;
      if (coupon.applicableItems) {
        const applicableAmount = activeOrder.cart
          .filter(item => coupon.applicableItems!.includes(item.product._id))
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
    const tableCharge = activeOrder.orderType === 'dine-in' ? (activeOrder.tableCharge || 50) : 0;

    const discountedAmount = subtotal - couponDiscount - customDiscount;
    const total = Math.max(0, discountedAmount) + tableCharge;

    return { subtotal, couponDiscount, customDiscount, tableCharge, total };
  };

  const totals = calculateTotals();

  // Add state to store completed order data
  const [completedOrderData, setCompletedOrderData] = useState<{
    order: Order;
    totals: OrderTotals;
  } | null>(null);

  // Complete order
  const completeOrder = () => {
    if (!activeOrder) return;

    const currentTotals = calculateTotals();

    console.log('Order completed:', {
      ...activeOrder,
      paymentMethod,
      totals: currentTotals,
      timestamp: new Date()
    });

    // Store the completed order data BEFORE removing it
    setCompletedOrderData({
      order: { ...activeOrder, status: 'completed' },
      totals: currentTotals
    });

    updateActiveOrder({ status: 'completed' });
    setOrderComplete(true);

    // Remove the order from active orders
    const updatedOrders = orders.filter(order => order.id !== activeOrderId);
    setOrders(updatedOrders);

    if (updatedOrders.length > 0) {
      setActiveOrderId(updatedOrders[0].id);
    } else {
      // Create new default order
      const newOrder: Order = {
        id: Date.now().toString(),
        name: 'Live Bill',
        cart: [],
        customer: {},
        cashier: user!,
        orderType: 'dine-in',
        customDiscount: 0,
        kitchenNote: '',
        tableCharge: 0,
        createdAt: new Date(),
        status: 'active',
        isDefault: true
      };
      setOrders([newOrder]);
      setActiveOrderId(newOrder.id);
    }

    setShowCheckout(false);
  };

  // Add a function to manually clear all data (useful for debugging or reset)
  const resetPOSData = () => {
    clearPOSStorage();
    const initialOrder: Order = {
      id: '1',
      name: 'Live Bill',
      cart: [],
      customer: {},
      cashier: user!,
      orderType: 'dine-in',
      customDiscount: 0,
      kitchenNote: '',
      tableCharge: 0,
      createdAt: new Date(),
      status: 'active',
      isDefault: true
    };
    setOrders([initialOrder]);
    setActiveOrderId('1');
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

  if (orderComplete && completedOrderData) {
    console.log('completed order data', completedOrderData);
    return (
      <OrderComplete
        totals={completedOrderData.totals}
        items={completedOrderData.order.cart}
        customer={completedOrderData.order.customer}
        orderId={completedOrderData.order.id}
        orderType={completedOrderData.order.orderType}
        onBackToPOS={() => {
          setOrderComplete(false);
          setCompletedOrderData(null);
        }}
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

      {/* Debug button - remove in production */}
      <button
        onClick={resetPOSData}
        className="fixed top-14 right-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 opacity-20 hover:opacity-100 transition-opacity"
        title="Reset POS Data (Debug)"
      >
        Reset
      </button>
    </div>
  );
}