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
        return parsedOrders.map((order: Order) => ({
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

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');

      const data: Product[] = await response.json();
      setCategories(['All', ...Array.from(new Set(data.map(p => p.category)))]);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'null') {
      setUser(JSON.parse(storedUser));
    }

    fetchProducts();

    // Load existing orders from localStorage
    const savedOrders = loadOrdersFromStorage();
    const savedActiveOrderId = loadActiveOrderIdFromStorage();

    if (savedOrders.length > 0) {
      // Restore saved orders
      setOrders(savedOrders);

      // Validate saved active order ID
      const validActiveOrder = savedOrders.find(order => order._id === savedActiveOrderId && order.status === 'active');
      if (validActiveOrder) {
        setActiveOrderId(savedActiveOrderId);
      } else {
        // If saved active order is invalid, use the first active order
        const firstActiveOrder = savedOrders.find(order => order.status === 'active');
        if (firstActiveOrder) {
          setActiveOrderId(firstActiveOrder._id);
          saveActiveOrderIdToStorage(firstActiveOrder._id);
        }
      }
    } else {
      // Initialize with default order if no saved orders
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const initialOrder: Order = {
        _id: '1',
        name: 'Live Bill',
        cart: [],
        customer: {},
        cashier: currentUser!,
        orderType: 'dine-in',
        customDiscount: 0,
        kitchenNote: '',
        tableCharge: 0,
        createdAt: new Date(),
        status: 'active',
        isDefault: true,
        discountPercentage: 0,
        totalAmount: 0
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

  const activeOrder = orders.find(order => order._id === activeOrderId);

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
      _id: newOrderId,
      name: `Table ${tableNumber}`,
      cart: [],
      customer: {},
      cashier: user!,
      orderType: 'dine-in',
      customDiscount: 0,
      kitchenNote: '',
      tableCharge: 0,
      createdAt: new Date(),
      status: 'active',
      discountPercentage: 0,
      totalAmount: 0
    };
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    setActiveOrderId(newOrderId);
  };

  // Delete order
  const deleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(order => order._id === orderId);

    // Don't allow deleting the default "Live Bill" order
    if (orderToDelete?.isDefault) {
      return;
    }

    const updatedOrders = orders.filter(order => order._id !== orderId);
    setOrders(updatedOrders);

    // If we deleted the active order, switch to another one
    if (activeOrderId === orderId) {
      const remainingActiveOrders = updatedOrders.filter(order => order.status === 'active');
      if (remainingActiveOrders.length > 0) {
        setActiveOrderId(remainingActiveOrders[0]._id);
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

    const draggedOrder = orders.find(order => order._id === draggedOrderId);
    const targetOrder = orders.find(order => order._id === targetOrderId);

    // Don't allow reordering with the default order
    if (draggedOrder?.isDefault || targetOrder?.isDefault) {
      setDraggedOrderId(null);
      return;
    }

    const draggedIndex = orders.findIndex(order => order._id === draggedOrderId);
    const targetIndex = orders.findIndex(order => order._id === targetOrderId);

    const newOrders = [...orders];
    const [removed] = newOrders.splice(draggedIndex, 1);
    newOrders.splice(targetIndex, 0, removed);

    setOrders(newOrders);
    setDraggedOrderId(null);
  };

  // Update active order
  const updateActiveOrder = (updates: Partial<Order>) => {
    const updatedOrders = orders.map(order =>
      order._id === activeOrderId
        ? { ...order, ...updates }
        : order
    );
    setOrders(updatedOrders);
  };

  // Add to cart with stock validation
  const addToCart = (product: Product) => {
    if (!activeOrder) return;

    const existingItem = activeOrder.cart.find(item => item.product._id === product._id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    // Check if adding one more would exceed available stock
    if (currentQuantityInCart >= product.stock) {
      alert(`Cannot add more items. Only ${product.stock} in stock.`);
      return;
    }

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

  // Handle barcode scanning
  const handleBarcodeScanned = (barcode: string) => {
    // Find product by barcode
    const product = products.find(p => p.barcode === barcode);

    if (product) {
      // Check if product is in stock
      if (product.stock > 0) {
        addToCart(product);
        // You could add a success notification here
        console.log(`Product ${product.name} added to cart via barcode scan`);
      } else {
        // Product out of stock
        alert(`Product "${product.name}" is out of stock!`);
      }
    } else {
      // Product not found
      alert(`No product found with barcode: ${barcode}`);
    }
  };

  // Update cart quantity with stock validation
  const updateQuantity = (productId: string, change: number) => {
    if (!activeOrder) return;

    const updatedCart = activeOrder.cart.map(item => {
      if (item.product._id === productId) {
        const newQuantity = Math.max(0, item.quantity + change);

        // Check stock availability when increasing quantity
        if (change > 0 && newQuantity > item.product.stock) {
          alert(`Cannot add more items. Only ${item.product.stock} in stock.`);
          return item; // Return unchanged item
        }

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
    if (!activeOrder) return { subtotal: 0, couponDiscount: 0, customDiscount: 0, discountPercentage: 0, tableCharge: 0, total: 0 };

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

    // Calculate discount percentage amount
    const discountPercentage = activeOrder.discountPercentage || 0;
    const discountPercentageAmount = subtotal * (discountPercentage / 100);

    const customDiscount = activeOrder.customDiscount || 0;
    const tableCharge = activeOrder.orderType === 'dine-in' ? (activeOrder.tableCharge || 0) : 0;

    const discountedAmount = subtotal - couponDiscount - customDiscount - discountPercentageAmount;
    const total = Math.max(0, discountedAmount) + tableCharge;

    return {
      subtotal,
      couponDiscount,
      customDiscount,
      discountPercentage: discountPercentageAmount,
      tableCharge,
      total
    };
  };

  const totals = calculateTotals();

  // Add state to store completed order data
  const [completedOrderData, setCompletedOrderData] = useState<{
    order: Order;
    totals: OrderTotals;
  } | null>(null);

  // Update product stock after order completion
  const updateProductStock = async (cartItems: CartItem[]) => {
    try {
      const response = await fetch('/api/order/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update stock');
      }

      const result = await response.json();
      console.log('Stock updated successfully:', result);

      // Refresh products to get updated stock values
      await fetchProducts();

      return result;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  // Complete order with stock management
  const completeOrder = async () => {
    if (!activeOrder) return;

    const currentTotals = calculateTotals();

    // Validate stock availability before completing order
    const stockValidationErrors = [];
    for (const item of activeOrder.cart) {
      const currentProduct = products.find(p => p._id === item.product._id);
      if (!currentProduct) {
        stockValidationErrors.push(`Product ${item.product.name} not found`);
        continue;
      }
      if (currentProduct.stock < item.quantity) {
        stockValidationErrors.push(`Insufficient stock for ${item.product.name}. Available: ${currentProduct.stock}, Required: ${item.quantity}`);
      }
    }

    if (stockValidationErrors.length > 0) {
      alert(`Cannot complete order:\n${stockValidationErrors.join('\n')}`);
      return;
    }

    // Create final order data with all required fields
    const finalOrderData = {
      ...activeOrder,
      status: 'completed' as 'active' | 'completed',
      totalAmount: currentTotals.total,
      paymentDetails: activeOrder.paymentDetails || {
        method: paymentMethod,
        ...(paymentMethod === 'cash' ? {
          cashGiven: 0,
          change: 0
        } : {
          invoiceId: '',
          bankServiceCharge: 0,
          bankName: ''
        })
      }
    };

    // Store a copy with the client-side ID for the receipt
    const clientSideOrderData = { ...finalOrderData };

    try {
      // Create a version of the order data without the _id field
      // MongoDB will generate a proper ObjectId automatically
      const orderDataForDB = {
        status: finalOrderData.status,
        totalAmount: finalOrderData.totalAmount,
        paymentDetails: finalOrderData.paymentDetails,
        name: finalOrderData.name,
        cart: finalOrderData.cart,
        customer: finalOrderData.customer,
        cashier: finalOrderData.cashier,
        orderType: finalOrderData.orderType,
        customDiscount: finalOrderData.customDiscount,
        kitchenNote: finalOrderData.kitchenNote,
        tableCharge: finalOrderData.tableCharge,
        createdAt: finalOrderData.createdAt,
        isDefault: finalOrderData.isDefault,
        discountPercentage: finalOrderData.discountPercentage,
        appliedCoupon: finalOrderData.appliedCoupon
      };

      // Send the order to the API without the _id field
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDataForDB),
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      const savedOrder = await response.json();
      console.log('Order saved to database:', savedOrder);

      // Update product stock
      try {
        await updateProductStock(activeOrder.cart);
        console.log('Product stock updated successfully');
      } catch (stockError) {
        console.error('Failed to update product stock:', stockError);
        // You might want to show a warning but still complete the order
        alert('Order completed but failed to update stock. Please manually adjust inventory.');
      }

      // Store the completed order data for receipt display
      // Use the client-side order data for UI purposes
      setCompletedOrderData({
        order: clientSideOrderData,
        totals: currentTotals
      });

      // Update UI state
      updateActiveOrder({ status: 'completed' });
      setOrderComplete(true);

      // Remove the order from active orders
      const updatedOrders = orders.filter(order => order._id !== activeOrderId);
      setOrders(updatedOrders);

      if (updatedOrders.length > 0) {
        setActiveOrderId(updatedOrders[0]._id);
      } else {
        // Create new default order
        const newOrder: Order = {
          _id: Date.now().toString(),
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
          isDefault: true,
          discountPercentage: 0,
          totalAmount: 0
        };
        setOrders([newOrder]);
        setActiveOrderId(newOrder._id);
      }

      setShowCheckout(false);
    } catch (error) {
      console.error('Error saving order:', error);
      // You could add error handling UI here
      alert('Failed to save order. Please try again.');
    }
  };

  // Add a function to manually clear all data (useful for debugging or reset)
  const resetPOSData = () => {
    clearPOSStorage();
    const initialOrder: Order = {
      _id: '1',
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
      isDefault: true,
      discountPercentage: 0,
      totalAmount: 0
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
        orderId={completedOrderData.order._id}
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
        onBarcodeScanned={handleBarcodeScanned}
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
        className="fixed top-30 right-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 opacity-20 hover:opacity-100 transition-opacity"
        title="Reset POS Data (Debug)"
      >
        Reset
      </button>
    </div>
  );
}