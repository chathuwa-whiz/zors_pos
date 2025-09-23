"use client";

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Filter,
  Download,
  Search,
  Plus,
  Minus,
  ArrowUpDown,
  Building2,
  User,
  Settings
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  barcode: string;
  category: string;
}

interface StockTransition {
  _id: string;
  productId: Product;
  productName: string;
  transactionType: 'sale' | 'purchase' | 'customer_return' | 'supplier_return' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitPrice: number;
  totalValue: number;
  reference?: string;
  party?: {
    name: string;
    type: 'customer' | 'supplier' | 'system';
    id: string;
  };
  user: string;
  userName: string;
  notes: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function StockTransitions() {
  const [transitions, setTransitions] = useState<StockTransition[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    productId: '',
    transactionType: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  // const [showAddModal, setShowAddModal] = useState(false);

  // Fetch stock transitions
  const fetchTransitions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.transactionType !== 'all' && { transactionType: filters.transactionType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`/api/stock-transitions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch transitions');

      const data = await response.json();
      setTransitions(data.transitions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching transitions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for filter dropdown
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransitions();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'purchase':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'customer_return':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'supplier_return':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'adjustment':
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return <ArrowUpDown className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'purchase':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'customer_return':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'supplier_return':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'adjustment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Sale';
      case 'purchase':
        return 'Purchase';
      case 'customer_return':
        return 'Customer Return';
      case 'supplier_return':
        return 'Supplier Return';
      case 'adjustment':
        return 'Stock Adjustment';
      default:
        return type;
    }
  };

  const getPartyIcon = (type?: string) => {
    switch (type) {
      case 'customer':
        return <User className="w-4 h-4" />;
      case 'supplier':
        return <Building2 className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Product', 'Transaction Type', 'Quantity', 'Previous Stock', 'New Stock', 'Unit Price', 'Total Value', 'Party', 'User', 'Reference', 'Notes'];
    const csvData = transitions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.productName,
      formatTransactionType(t.transactionType),
      t.quantity,
      t.previousStock,
      t.newStock,
      t.unitPrice.toFixed(2),
      t.totalValue.toFixed(2),
      t.party?.name || 'System',
      t.userName,
      t.reference || '',
      t.notes
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-transitions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter transitions based on search
  const filteredTransitions = transitions.filter(transition =>
    transition.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
    transition.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
    (transition.party?.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
    (transition.reference || '').toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Transitions</h1>
              <p className="text-gray-600">Track all stock movements and transactions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
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

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
                <select
                  value={filters.productId}
                  onChange={(e) => handleFilterChange('productId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="sale">Sales</option>
                  <option value="purchase">Purchases</option>
                  <option value="customer_return">Customer Returns</option>
                  <option value="supplier_return">Supplier Returns</option>
                  <option value="adjustment">Stock Adjustments</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transitions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Transitions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading transitions...</p>
            </div>
          ) : filteredTransitions.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No stock transitions found</p>
              <p className="text-gray-500">Transactions will appear here as they occur</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Date & Time</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Product</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Transaction</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900">Quantity</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900">Stock Change</th>
                    <th className="text-right px-6 py-4 font-semibold text-gray-900">Value</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">Party</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900">User</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransitions.map((transition, index) => (
                    <tr
                      key={transition._id}
                      className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {new Date(transition.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {new Date(transition.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{transition.productName}</div>
                            {transition.productId?.category && (
                              <div className="text-sm text-gray-500">{transition.productId.category}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTransactionColor(transition.transactionType)}`}>
                          {getTransactionIcon(transition.transactionType)}
                          <span className="ml-2">{formatTransactionType(transition.transactionType)}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-gray-900">{transition.quantity}</span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="text-sm">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-gray-500">{transition.previousStock}</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400" />
                            <span className="font-medium text-gray-900">{transition.newStock}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            Rs.{transition.totalValue.toFixed(2)}
                          </div>
                          <div className="text-gray-500">
                            @Rs.{transition.unitPrice.toFixed(2)}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {transition.party ? (
                          <div className="flex items-center space-x-2">
                            {getPartyIcon(transition.party.type)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {transition.party.name}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {transition.party.type}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">System</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transition.userName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {transition.reference ? (
                          <span className="text-sm text-blue-600 font-mono">
                            {transition.reference}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchTransitions(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => fetchTransitions(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
