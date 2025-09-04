"use client";
import { useState, useEffect } from 'react';

interface ProductFiltersProps {
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    stockFilter: string;
    setStockFilter: (filter: string) => void;
    priceRange: { min: number; max: number };
    setPriceRange: (range: { min: number; max: number }) => void;
    selectedSupplier?: string;
    setSelectedSupplier?: (supplier: string) => void;
}

interface Supplier {
    _id: string;
    name: string;
}

export default function ProductFilters({
    categories,
    selectedCategory,
    setSelectedCategory,
    stockFilter,
    setStockFilter,
    priceRange,
    setPriceRange,
    selectedSupplier = 'all',
    setSelectedSupplier
}: ProductFiltersProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    useEffect(() => {
        fetch('/api/suppliers')
            .then(res => res.json())
            .then(data => setSuppliers(data || []))
            .catch(error => console.error('Error fetching suppliers:', error));
    }, []);

    const stockOptions = [
        { value: 'all', label: 'All Stock Levels' },
        { value: 'available', label: 'In Stock' },
        { value: 'low', label: 'Low Stock (< 10)' },
        { value: 'out', label: 'Out of Stock' }
    ];

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Supplier Filter */}
                {setSelectedSupplier && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Supplier
                        </label>
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Suppliers</option>
                            <option value="none">No Supplier</option>
                            {suppliers.map(supplier => (
                                <option key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Stock Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Status
                    </label>
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {stockOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Price
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-500">Rs</span>
                    </div>
                </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={() => {
                        setSelectedCategory('All');
                        setStockFilter('all');
                        setPriceRange({ min: 0, max: Infinity });
                        setSelectedSupplier?.('all');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
}