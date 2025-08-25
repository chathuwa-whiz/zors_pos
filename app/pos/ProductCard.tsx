"use client";

import { Product } from '@/app/types/pos';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  viewMode, 
  onAddToCart 
}: ProductCardProps) {
  return (
    <div
      onClick={() => onAddToCart(product)}
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
  );
}