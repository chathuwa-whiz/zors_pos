// app/returns/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Package, RotateCcw, Search, Filter, Calendar, Plus, TrendingUp, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { Product } from '@/app/types/pos';
import { User as UserType } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import ProductReturnForm from './ProductReturnForm';
import ReturnsList from './ReturnsList';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductReturn {
    _id: string;
    product: {
        _id: string;
        name: string;
        sellingPrice: number;
    };
    returnType: 'customer' | 'supplier';
    quantity: number;
    reason: string;
    cashier: {
        _id: string;
        username: string;
    };
    createdAt: string;
    notes?: string;
}

export default function ReturnsPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [returns, setReturns] = useState<ProductReturn[]>([]);
    const [filteredReturns, setFilteredReturns] = useState<ProductReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'customer' | 'supplier'>('all');
    const [dateRange, setDateRange] = useState('7');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        // Check user authentication and role
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role !== 'admin' && userData.role !== 'cashier') {
                router.push('/');
                return;
            }
            setUser(userData);
        } else {
            router.push('/login');
            return;
        }

        fetchData();
    }, [router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const [productsResponse, returnsResponse] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/returns')
            ]);

            if (!productsResponse.ok) throw new Error('Failed to fetch products');

            const productsData = await productsResponse.json();
            setProducts(productsData);

            if (returnsResponse.ok) {
                const returnsData = await returnsResponse.json();
                setReturns(returnsData);
                setFilteredReturns(returnsData);
            }
        } catch (err) {
            setError('Failed to load data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // Filter returns based on search, type, and date range
    useEffect(() => {
        const filtered = returns.filter(returnItem => {
            const matchesSearch = returnItem.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                returnItem.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                returnItem.cashier.username.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || returnItem.returnType === filterType;

            // Date range filter
            let matchesDate = true;
            if (dateRange !== 'all') {
                const days = parseInt(dateRange);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                matchesDate = new Date(returnItem.createdAt) >= cutoffDate;
            }

            return matchesSearch && matchesType && matchesDate;
        });

        setFilteredReturns(filtered);
    }, [returns, searchQuery, filterType, dateRange]);

    const handleReturnSubmitted = () => {
        fetchData();
        setShowForm(false);
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Product', 'Type', 'Quantity', 'Reason', 'Cashier', 'Notes'];
        const csvData = filteredReturns.map(item => [
            new Date(item.createdAt).toLocaleDateString(),
            item.product.name,
            item.returnType,
            item.quantity,
            item.reason,
            item.cashier.username,
            item.notes || ''
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `returns-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getStats = () => {
        const today = new Date();
        const todayReturns = filteredReturns.filter(item =>
            new Date(item.createdAt).toDateString() === today.toDateString()
        );

        const customerReturns = filteredReturns.filter(item => item.returnType === 'customer');
        const supplierReturns = filteredReturns.filter(item => item.returnType === 'supplier');

        return {
            total: filteredReturns.length,
            today: todayReturns.length,
            customer: customerReturns.length,
            supplier: supplierReturns.length,
            totalValue: filteredReturns.reduce((sum, item) =>
                sum + (item.quantity * item.product.sellingPrice), 0
            )
        };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
                    <motion.p
                        className="text-gray-600 text-lg font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Loading returns data...
                    </motion.p>
                    <motion.p
                        className="text-gray-500 text-sm mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Please wait while we fetch your data
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <motion.div
                    className="text-center max-w-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-6">Please login to access this page</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                        >
                            Go to Login
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-orange-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <motion.div
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-2xl shadow-lg">
                                <RotateCcw className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    Product Returns
                                </h1>
                                <p className="text-gray-600 mt-1">Manage customer returns and supplier exchanges</p>
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
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-200 active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>

                            <motion.button
                                onClick={() => setShowForm(true)}
                                className="flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg transition-all duration-200 active:scale-95"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Plus className="w-4 h-4" />
                                <span>Process Return</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Returns</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <RotateCcw className="w-10 h-10 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Today</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                            </div>
                            <Calendar className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Customer Returns</p>
                                <p className="text-3xl font-bold text-green-600">{stats.customer}</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Supplier Returns</p>
                                <p className="text-3xl font-bold text-red-600">{stats.supplier}</p>
                            </div>
                            <Package className="w-10 h-10 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Value</p>
                                <p className="text-3xl font-bold text-purple-600">₹{stats.totalValue.toFixed(2)}</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-purple-500" />
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search returns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as 'all' | 'customer' | 'supplier')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                            >
                                <option value="all">All Returns</option>
                                <option value="customer">Customer Returns</option>
                                <option value="supplier">Supplier Returns</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                            >
                                <option value="all">All Time</option>
                                <option value="1">Today</option>
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 3 months</option>
                            </select>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">{filteredReturns.length}</span>
                            <span className="ml-1">of {returns.length} returns</span>
                        </div>
                    </div>
                </motion.div>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Returns List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <ReturnsList returns={filteredReturns} loading={loading} />
                </motion.div>
            </div>

            {/* Product Return Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <ProductReturnForm
                        products={products}
                        user={user}
                        onSubmit={handleReturnSubmitted}
                        onClose={() => setShowForm(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}