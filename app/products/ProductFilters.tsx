"use client";

interface ProductFiltersProps {
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    stockFilter: string;
    setStockFilter: (filter: string) => void;
    priceRange: { min: number; max: number };
    setPriceRange: (range: { min: number; max: number }) => void;
}

export default function ProductFilters({
    categories,
    selectedCategory,
    setSelectedCategory,
    stockFilter,
    setStockFilter,
    priceRange,
    setPriceRange
}: ProductFiltersProps) {
    const stockOptions = [
        { value: 'all', label: 'All Stock Levels' },
        { value: 'available', label: 'In Stock' },
        { value: 'low', label: 'Low Stock (< 10)' },
        { value: 'out', label: 'Out of Stock' }
    ];

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        Price Range
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 1000 })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={() => {
                        setSelectedCategory('All');
                        setStockFilter('all');
                        setPriceRange({ min: 0, max: 1000 });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
}