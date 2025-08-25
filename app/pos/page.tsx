"use client";

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign,
  User,
  ArrowLeft,
  Search,
  Grid,
  List,
  Receipt,
  Clock,
  Check,
  X,
  UserPlus,
  Percent,
  Tag,
  ChefHat,
  MapPin,
  Car,
  Home,
  Edit3,
  Copy,
  Calendar,
  GripVertical
} from 'lucide-react';

// Types
interface User {
  _id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
  description?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  note?: string;
}

interface Customer {
  name?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
}

interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  applicableItems?: string[];
  description: string;
}

interface Order {
  id: string;
  name: string;
  cart: CartItem[];
  customer: Customer;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customDiscount: number;
  appliedCoupon?: Coupon;
  kitchenNote: string;
  createdAt: Date;
  status: 'active' | 'completed';
  isDefault?: boolean;
}

export default function POSSystem() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
      { id: '1', name: 'Espresso', price: 2.50, category: 'Coffee', stock: 50, description: 'Rich and bold coffee shot' },
      { id: '2', name: 'Cappuccino', price: 4.50, category: 'Coffee', stock: 45, description: 'Coffee with steamed milk foam' },
      { id: '3', name: 'Latte', price: 5.00, category: 'Coffee', stock: 40, description: 'Coffee with steamed milk' },
      { id: '4', name: 'Americano', price: 3.50, category: 'Coffee', stock: 55, description: 'Espresso with hot water' },
      { id: '5', name: 'Croissant', price: 3.25, category: 'Bakery', stock: 20, description: 'Fresh buttery pastry' },
      { id: '6', name: 'Muffin', price: 2.75, category: 'Bakery', stock: 25, description: 'Blueberry muffin' },
      { id: '7', name: 'Sandwich', price: 8.50, category: 'Food', stock: 15, description: 'Club sandwich with fries' },
      { id: '8', name: 'Salad', price: 9.75, category: 'Food', stock: 12, description: 'Fresh garden salad' },
      { id: '9', name: 'Orange Juice', price: 3.75, category: 'Beverages', stock: 30, description: 'Fresh squeezed juice' },
      { id: '10', name: 'Smoothie', price: 6.25, category: 'Beverages', stock: 18, description: 'Mixed berry smoothie' },
    ];

    setProducts(mockProducts);
    setCategories(['All', ...Array.from(new Set(mockProducts.map(p => p.category)))]);

    // Initialize with first order
    const initialOrder: Order = {
      id: '1',
      name: 'Live Bill',
      cart: [],
      customer: {},
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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add to cart
  const addToCart = (product: Product) => {
    if (!activeOrder) return;
    
    const existingItem = activeOrder.cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const updatedCart = activeOrder.cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.price }
          : item
      );
      updateActiveOrder({ cart: updatedCart });
    } else {
      const updatedCart = [...activeOrder.cart, { product, quantity: 1, subtotal: product.price }];
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
          : { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.price };
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
  const calculateTotals = () => {
    if (!activeOrder) return { subtotal: 0, couponDiscount: 0, customDiscount: 0, tax: 0, total: 0 };
    
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
    const tax = Math.max(0, discountedAmount) * 0.08;
    const total = Math.max(0, discountedAmount) + tax;
    
    return { subtotal, couponDiscount, customDiscount, tax, total };
  };

  const { subtotal, couponDiscount, customDiscount, tax, total } = calculateTotals();

  // Complete order
  const completeOrder = () => {
    if (!activeOrder) return;
    
    console.log('Order completed:', {
      ...activeOrder,
      paymentMethod,
      totals: { subtotal, couponDiscount, customDiscount, tax, total },
      timestamp: new Date()
    });
    
    updateActiveOrder({ status: 'completed' });
    setOrderComplete(true);
    
    setTimeout(() => {
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
      
      setShowCheckout(false);
      setOrderComplete(false);
    }, 3000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to access POS system</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
          <p className="text-gray-600 mb-4">Total: ${total.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Returning to POS in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Products (50% width) */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Products Grid/List - Scrollable */}
        <div className="flex-1 overflow-auto p-4">
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2'
          }`}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 ${
                  viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 h-8 overflow-hidden">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">${product.price}</span>
                      <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🍽️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${product.price}</div>
                      <div className="text-xs text-gray-400">Stock: {product.stock}</div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Order Management (50% width) */}
      <div className="flex-1 bg-white border-l border-gray-200 flex flex-col max-h-screen">
        {/* Order Tabs */}
        <div className="border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
            <button
              onClick={createNewOrder}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
            >
              + New Order
            </button>
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {orders.filter(order => order.status === 'active').map(order => (
              <div
                key={order.id}
                draggable={!order.isDefault}
                onDragStart={(e) => handleDragStart(e, order.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, order.id)}
                className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 group ${
                  activeOrderId === order.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!order.isDefault ? 'cursor-move' : ''}`}
              >
                {!order.isDefault && (
                  <GripVertical className="w-3 h-3 mr-2 opacity-50" />
                )}
                
                <button
                  onClick={() => setActiveOrderId(order.id)}
                  className="flex items-center space-x-2"
                >
                  <span>{order.name}</span>
                  {order.cart.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {order.cart.length}
                    </span>
                  )}
                </button>

                {!order.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOrder(order.id);
                    }}
                    className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                      activeOrderId === order.id
                        ? 'hover:bg-blue-700 text-white'
                        : 'hover:bg-red-100 text-red-500'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Controls */}
        {activeOrder && (
          <div className="border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Customer</span>
                </button>
                
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => updateActiveOrder({ orderType: 'dine-in' })}
                    className={`px-3 py-1 rounded text-sm ${
                      activeOrder.orderType === 'dine-in' ? 'bg-white shadow' : ''
                    }`}
                  >
                    <Home className="w-4 h-4 inline mr-1" />
                    Dine-in
                  </button>
                  <button
                    onClick={() => updateActiveOrder({ orderType: 'takeaway' })}
                    className={`px-3 py-1 rounded text-sm ${
                      activeOrder.orderType === 'takeaway' ? 'bg-white shadow' : ''
                    }`}
                  >
                    <Car className="w-4 h-4 inline mr-1" />
                    Takeaway
                  </button>
                  <button
                    onClick={() => updateActiveOrder({ orderType: 'delivery' })}
                    className={`px-3 py-1 rounded text-sm ${
                      activeOrder.orderType === 'delivery' ? 'bg-white shadow' : ''
                    }`}
                  >
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Delivery
                  </button>
                </div>
              </div>
            </div>

            {/* Kitchen Note */}
            <div className="mb-3">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Kitchen note..."
                  value={activeOrder.kitchenNote}
                  onChange={(e) => updateActiveOrder({ kitchenNote: e.target.value })}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-auto p-4">
          {!activeOrder || activeOrder.cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Cart is empty</p>
              <p className="text-sm">Add items from the menu</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrder.cart.map(item => (
                <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">${item.product.price} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-green-600">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary and Checkout */}
        {activeOrder && activeOrder.cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            {/* Coupon and Discount Section */}
            <div className="space-y-3 mb-4">
              {/* Coupon Code */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                  Apply
                </button>
              </div>

              {/* Custom Discount */}
              <div className="flex items-center space-x-2">
                <Percent className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Custom Discount:</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={activeOrder.customDiscount || ''}
                  onChange={(e) => updateActiveOrder({ customDiscount: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-500">$</span>
              </div>

              {/* Applied Coupon Display */}
              {activeOrder.appliedCoupon && (
                <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">{activeOrder.appliedCoupon.code}</span>
                    <span className="text-xs text-green-600">{activeOrder.appliedCoupon.description}</span>
                  </div>
                  <button
                    onClick={() => updateActiveOrder({ appliedCoupon: undefined })}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {customDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Custom Discount</span>
                  <span>-${customDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="space-y-4">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 flex items-center justify-center py-3 px-3 rounded-lg border ${
                        paymentMethod === 'cash'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 flex items-center justify-center py-3 px-3 rounded-lg border ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Card
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={completeOrder}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Complete Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && activeOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Customer Details</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={activeOrder.customer.name || ''}
                  onChange={(e) => updateActiveOrder({ 
                    customer: { ...activeOrder.customer, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={activeOrder.customer.phone || ''}
                  onChange={(e) => updateActiveOrder({ 
                    customer: { ...activeOrder.customer, phone: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={activeOrder.customer.email || ''}
                  onChange={(e) => updateActiveOrder({ 
                    customer: { ...activeOrder.customer, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <input
                  type="date"
                  value={activeOrder.customer.birthDate || ''}
                  onChange={(e) => updateActiveOrder({ 
                    customer: { ...activeOrder.customer, birthDate: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}