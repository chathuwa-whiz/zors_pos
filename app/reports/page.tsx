"use client";

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  ShoppingCart,
  RotateCcw,
  Calendar,
  Download,
  RefreshCw,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  CreditCard,
  Banknote
} from 'lucide-react';

interface ReportData {
  overview: {
    totalProducts: number;
    totalCustomers: number;
    totalUsers: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalRevenue: number;
    todayRevenue: number;
    totalOrders: number;
    totalReturns: number;
    netProfit: number;
    totalCost: number;
    profitMargin: number;
  };
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  stockSummary: Array<{
    type: string;
    count: number;
    value: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    products: number;
    stock: number;
    averagePrice: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    totalAmount: number;
    orderType: string;
    cashier: string;
    createdAt: string;
    itemCount: number;
  }>;
  recentReturns: Array<{
    id: string;
    productName: string;
    quantity: number;
    returnType: string;
    reason: string;
    cashier: string;
    createdAt: string;
  }>;
  insights: {
    averageOrderValue: number;
    returnRate: number;
    stockTurnover: number;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30');
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // const [selectedView, setSelectedView] = useState<'overview' | 'sales' | 'inventory' | 'customers'>('overview');

  useEffect(() => {
    fetchReports();
  }, [period, startDate, endDate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let url = `/api/reports?period=${period}`;

      if (customDateRange && startDate && endDate) {
        url = `/api/reports?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch reports');

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', `Rs.${reportData.overview.totalRevenue.toFixed(2)}`],
      ['Total Orders', reportData.overview.totalOrders.toString()],
      ['Total Products', reportData.overview.totalProducts.toString()],
      ['Total Customers', reportData.overview.totalCustomers.toString()],
      ['Average Order Value', `Rs.${reportData.insights.averageOrderValue.toFixed(2)}`],
      ['Return Rate', `${reportData.insights.returnRate.toFixed(2)}%`],
      ['Low Stock Items', reportData.overview.lowStockProducts.toString()],
      ['Out of Stock Items', reportData.overview.outOfStockProducts.toString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => `Rs.${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'purchase': return 'bg-blue-100 text-blue-800';
      case 'customer_return': return 'bg-yellow-100 text-yellow-800';
      case 'supplier_return': return 'bg-orange-100 text-orange-800';
      case 'adjustment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'sale': return 'Sales';
      case 'purchase': return 'Purchases';
      case 'customer_return': return 'Customer Returns';
      case 'supplier_return': return 'Supplier Returns';
      case 'adjustment': return 'Stock Adjustments';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Generating reports...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error || 'Failed to load reports'}</p>
          <button
            onClick={fetchReports}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Reports</h1>
              <p className="text-gray-600">Comprehensive insights into your business performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchReports}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Report Period:</span>

              <div className="flex items-center space-x-2">
                <select
                  value={customDateRange ? 'custom' : period}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setCustomDateRange(true);
                    } else {
                      setCustomDateRange(false);
                      setPeriod(e.target.value);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {customDateRange && (
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.overview.totalRevenue)}</p>
                <p className="text-green-100 text-sm mt-1">
                  Today: {formatCurrency(reportData.overview.todayRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{reportData.overview.totalOrders.toLocaleString()}</p>
                <p className="text-blue-100 text-sm mt-1">
                  Avg: {formatCurrency(reportData.insights.averageOrderValue)}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Products</p>
                <p className="text-2xl font-bold">{reportData.overview.totalProducts.toLocaleString()}</p>
                <p className="text-purple-100 text-sm mt-1">
                  {reportData.overview.lowStockProducts} low stock
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Customers</p>
                <p className="text-2xl font-bold">{reportData.overview.totalCustomers.toLocaleString()}</p>
                <p className="text-orange-100 text-sm mt-1">
                  {reportData.insights.returnRate.toFixed(1)}% return rate
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-200" />
            </div>
          </div>

          <div className={`rounded-xl p-6 text-white ${
            reportData.overview.netProfit >= 0 
              ? 'bg-gradient-to-r from-teal-500 to-teal-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  reportData.overview.netProfit >= 0 ? 'text-teal-100' : 'text-red-100'
                }`}>Net Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(reportData.overview.netProfit)}</p>
                <p className={`text-sm mt-1 ${
                  reportData.overview.netProfit >= 0 ? 'text-teal-100' : 'text-red-100'
                }`}>
                  Margin: {reportData.overview.profitMargin.toFixed(1)}%
                </p>
              </div>
              {reportData.overview.netProfit >= 0 ? (
                <TrendingUp className={`w-8 h-8 ${
                  reportData.overview.netProfit >= 0 ? 'text-teal-200' : 'text-red-200'
                }`} />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-200" />
              )}
            </div>
          </div>
        </div>

        {/* Sales Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Sales Performance</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Daily Revenue Trend</span>
            </div>
          </div>

          <div className="h-64 overflow-x-auto">
            <div className="flex items-end space-x-2 h-full min-w-max">
              {reportData.salesByDay.map((day, index) => {
                const maxRevenue = Math.max(...reportData.salesByDay.map(d => d.revenue));
                const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 200 : 0;

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 rounded-t-md w-8 mb-2 relative group cursor-pointer hover:bg-blue-600 transition-colors"
                      style={{ height: `${height}px` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        <div>{formatCurrency(day.revenue)}</div>
                        <div>{day.orders} orders</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 transform -rotate-45 origin-top-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Selling Products</h3>
            <div className="space-y-4">
              {reportData.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Movements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Stock Movements</h3>
            <div className="space-y-4">
              {reportData.stockSummary.map((movement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTransactionTypeColor(movement.type)}`}>
                      {formatTransactionType(movement.type)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{movement.count} transactions</p>
                    <p className="text-sm text-gray-600">{formatCurrency(movement.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Category Performance</h3>
            <div className="space-y-4">
              {reportData.categoryPerformance.map((category, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category.category}</h4>
                    <span className="text-sm text-gray-600">{category.products} products</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Stock: </span>
                      <span className="font-medium">{category.stock} units</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Price: </span>
                      <span className="font-medium">{formatCurrency(category.averagePrice)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Methods</h3>
            <div className="space-y-4">
              {reportData.paymentMethods.map((method, index) => {
                const total = reportData.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
                const percentage = total > 0 ? (method.amount / total) * 100 : 0;

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {method.method === 'card' ? (
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Banknote className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{method.method}</p>
                        <p className="text-sm text-gray-600">{method.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(method.amount)}</p>
                      <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Orders</h3>
              <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {reportData.recentOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-gray-600">
                      {order.orderType} • {order.itemCount} items • {order.cashier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Returns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Returns</h3>
              <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {reportData.recentReturns.slice(0, 8).map((returnItem) => (
                <div key={returnItem.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <RotateCcw className={`w-4 h-4 ${returnItem.returnType === 'customer' ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    <div>
                      <p className="font-medium text-gray-900">{returnItem.productName}</p>
                      <p className="text-sm text-gray-600">
                        {returnItem.quantity} units • {returnItem.returnType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(returnItem.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{returnItem.cashier}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Business Insights */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mt-8 text-white">
          <h3 className="text-xl font-semibold mb-4">Business Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(reportData.insights.averageOrderValue)}</div>
              <div className="text-indigo-100">Average Order Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{reportData.insights.returnRate.toFixed(1)}%</div>
              <div className="text-indigo-100">Return Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{reportData.insights.stockTurnover}</div>
              <div className="text-indigo-100">Stock Movements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
