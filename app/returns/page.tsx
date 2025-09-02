// app/returns/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Package, RotateCcw, Search, Filter, Calendar, User } from 'lucide-react';
import { Product } from '@/app/types/pos';
import { User as UserType } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import ProductReturnForm from './ProductReturnForm';
import ReturnsList from './ReturnsList';

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

    useEffect(() => {
        // Check user authentication and role
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.role !== 'admin' && userData.role !== 'cashier') {
                router.push('/');
                console.log('role: ', userData.role)
                console.log(userData.role==='admin')
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
            // Fetch products and returns
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
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter returns based on search and type
    useEffect(() => {
        const filtered = returns.filter(returnItem => {
            const matchesSearch = returnItem.product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || returnItem.returnType === filterType;
            return matchesSearch && matchesType;
        });
        setFilteredReturns(filtered);
    }, [returns, searchQuery, filterType]);

    const handleReturnSubmitted = () => {
        fetchData();
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Please login to access this page</p>
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <RotateCcw className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Product Returns</h1>
                                <p className="text-gray-600">Handle customer returns and supplier returns</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 sm:mt-0 flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Process Return</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as 'all' | 'customer' | 'supplier')}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="all">All Returns</option>
                                <option value="customer">Customer Returns</option>
                                <option value="supplier">Supplier Returns</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Returns List */}
                <ReturnsList returns={filteredReturns} loading={loading} />
            </div>

            {/* Product Return Form Modal */}
            {showForm && (
                <ProductReturnForm
                    products={products}
                    user={user}
                    onSubmit={handleReturnSubmitted}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
}