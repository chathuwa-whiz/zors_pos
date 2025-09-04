"use client";

import { useState } from 'react';
import { ArrowLeft, Search, Grid, List } from 'lucide-react';
import { Product } from '@/app/types/pos';
import { User } from '../types/user';
import ProductCard from './ProductCard';

interface ProductsPanelProps {
  user: User;
  products: Product[];
  categories: string[];
  onAddToCart: (product: Product) => void;
}

export default function ProductsPanel({ 
  user, 
  products, 
  categories, 
  onAddToCart 
}: ProductsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col max-h-screen bg-gradient-to-br from-green-50 to-lime-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-900 to-green-800 shadow-lg p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="p-2 text-white hover:text-lime-400 hover:bg-green-800 rounded-lg transition-all duration-200 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">POS System</h1>
              <p className="text-lime-400 text-sm">Welcome, {user.username}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-white hover:text-lime-400 hover:bg-green-800 rounded-lg transition-all duration-200 active:scale-95"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search and Categories */}
        <div className="mt-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white shadow-sm transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95 min-w-[80px] ${
                  selectedCategory === category
                    ? 'bg-lime-400 text-green-900 shadow-md ring-1 ring-white'
                    : 'bg-white text-green-900 border border-green-300 hover:bg-lime-50 hover:border-lime-400 shadow-sm'
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
            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
            : 'space-y-3'
        }`}>
          {filteredProducts.map(product => (
            <ProductCard 
              key={product._id}
              product={product}
              viewMode={viewMode}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}