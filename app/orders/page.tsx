"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Calendar, User, Package, DollarSign, ChevronRight, Eye, Download, RefreshCw, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    sellingPrice: number;
  };
  quantity: number;
  subtotal: number;
  note?: string;
}

interface Customer {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface Cashier {
  _id: string;
  username: string;
}

interface PaymentDetails {
  method: 'cash' | 'card';
  cashGiven?: number;
  change?: number;
  invoiceId?: string;
  bankServiceCharge?: number;
  bankName?: string;
}

interface Order {
  _id: string;
  name: string;
  cart: OrderItem[];
  customer?: Customer;
  cashier: Cashier;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  kitchenNote?: string;
  createdAt: string;
  status: 'active' | 'completed';
  paymentDetails?: PaymentDetails;
  tableCharge: number;
  deliveryCharge?: number;
  discountPercentage: number;
  totalAmount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'dine-in' | 'takeaway' | 'delivery'>('all');
  const [dateRange, setDateRange] = useState('7');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, orderTypeFilter, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/order');
      if (response.ok) {
        const data = await response.json();
        // Sort orders by creation date (newest first)
        const sortedOrders = data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer?.phone?.includes(searchQuery) ||
        order.cashier.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Order type filter
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(order => order.orderType === orderTypeFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(order => new Date(order.createdAt) >= cutoffDate);
    }

    setFilteredOrders(filtered);
  };

  const getStats = () => {
    const completedOrders = filteredOrders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return {
      total: filteredOrders.length,
      completed: completedOrders.length,
      active: filteredOrders.filter(o => o.status === 'active').length,
      totalRevenue,
      averageOrderValue
    };
  };

  const stats = getStats();

  const formatCurrency = (amount: number) => `Rs.${amount.toFixed(2)}`;

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'dine-in':
        return 'bg-blue-100 text-blue-700';
      case 'takeaway':
        return 'bg-orange-100 text-orange-700';
      case 'delivery':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'completed'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'Order Type', 'Status', 'Items', 'Total', 'Payment Method', 'Cashier'];
    const rows = filteredOrders.map(order => [
      order._id,
      new Date(order.createdAt).toLocaleString(),
      order.customer?.name || 'Walk-in',
      order.customer?.phone || 'N/A',
      order.orderType,
      order.status,
      order.cart.length,
      order.totalAmount,
      order.paymentDetails?.method || 'N/A',
      order.cashier.username
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-200 border-t-cyan-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading orders...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-cyan-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-cyan-600 to-blue-700 p-3 rounded-2xl shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-blue-600 bg-clip-text text-transparent">
                  Order Management
                </h1>
                <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-cyan-700 mt-1">{stats.total}</p>
              </div>
              <div className="bg-cyan-100 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{stats.completed}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold text-yellow-700 mt-1">{stats.active}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers, cashier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-gray-400" />
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value as 'all' | 'dine-in' | 'takeaway' | 'delivery')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              >
                <option value="all">All Types</option>
                <option value="dine-in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              >
                <option value="all">All Time</option>
                <option value="1">Last 24 Hours</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No orders found</p>
              <p className="text-gray-500">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Order ID</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Date & Time</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Customer</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Items</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Total</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Payment</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Cashier</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.customer?.name || 'Walk-in Customer'}
                            </p>
                            {order.customer?.phone && (
                              <p className="text-xs text-gray-600">{order.customer.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderTypeColor(order.orderType)}`}>
                          {order.orderType.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{order.cart.length}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {order.paymentDetails?.method || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{order.cashier.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600 mt-1">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Order Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {selectedOrder.orderType.replace('-', ' ')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Cashier</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.cashier.username}</p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedOrder.customer && selectedOrder.customer.name && (
                <div className="bg-cyan-50 p-4 rounded-xl mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                    </div>
                    {selectedOrder.customer.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer.phone}</p>
                      </div>
                    )}
                    {selectedOrder.customer.email && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        {item.note && (
                          <p className="text-xs text-gray-600 mt-1">Note: {item.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">x{item.quantity}</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                <div className="space-y-2">
                  {selectedOrder.tableCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Table Charge</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.tableCharge)}</span>
                    </div>
                  )}
                  {selectedOrder.deliveryCharge && selectedOrder.deliveryCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.deliveryCharge)}</span>
                    </div>
                  )}
                  {selectedOrder.discountPercentage > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({selectedOrder.discountPercentage}%)</span>
                      <span className="font-medium">-{formatCurrency((selectedOrder.totalAmount * selectedOrder.discountPercentage) / 100)}</span>
                    </div>
                  )}
                  {selectedOrder.paymentDetails?.bankServiceCharge && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bank Service Charge</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.paymentDetails.bankServiceCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-cyan-200">
                    <span>Total Amount</span>
                    <span className="text-cyan-700">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {selectedOrder.paymentDetails && (
                  <div className="mt-4 pt-4 border-t border-cyan-200">
                    <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedOrder.paymentDetails.method}
                    </p>
                    {selectedOrder.paymentDetails.method === 'cash' && selectedOrder.paymentDetails.cashGiven && (
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cash Given:</span>
                          <span>{formatCurrency(selectedOrder.paymentDetails.cashGiven)}</span>
                        </div>
                        {selectedOrder.paymentDetails.change !== undefined && (
                          <div className="flex justify-between text-green-600">
                            <span>Change:</span>
                            <span className="font-medium">{formatCurrency(selectedOrder.paymentDetails.change)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedOrder.paymentDetails.bankName && (
                      <p className="text-sm text-gray-600 mt-2">
                        Bank: {selectedOrder.paymentDetails.bankName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedOrder.kitchenNote && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Kitchen Note</p>
                  <p className="text-gray-900">{selectedOrder.kitchenNote}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}