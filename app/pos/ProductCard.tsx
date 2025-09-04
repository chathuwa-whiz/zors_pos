"use client";

import { Product } from '@/app/types/pos';
import Image from 'next/image';
import { Plus, Package } from 'lucide-react';

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
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      onClick={() => !isOutOfStock && onAddToCart(product)}
      className={`bg-white rounded-xl border-2 shadow-md transition-all duration-200 ${
        isOutOfStock 
          ? 'border-gray-300 opacity-60 cursor-not-allowed' 
          : 'border-green-200 cursor-pointer hover:shadow-lg hover:border-lime-400 hover:-translate-y-1 active:scale-95'
      } ${
        viewMode === 'grid' ? 'p-3' : 'p-3 flex items-center space-x-3'
      }`}
    >
      {viewMode === 'grid' ? (
        <div className="text-center">
          <div className="relative mb-2">
            <Image
              src={product.image || 'https://res.cloudinary.com/dgwsugfov/image/upload/v1756363439/1440523_t2o2tk.png'}
              alt={product.name}
              width={256}
              height={256}
              className="w-14 h-14 mx-auto rounded-lg object-cover shadow-sm"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">OUT</span>
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-tight line-clamp-2">{product.name}</h3>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <span className="text-lg font-bold text-green-900">Rs.{product.sellingPrice}</span>
            </div>
            
            <div className="flex items-center justify-center space-x-1">
              <Package className="w-3 h-3 text-gray-500" />
              <span className={`text-xs font-medium ${
                isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {product.stock}
              </span>
            </div>
          </div>
          
          {!isOutOfStock && (
            <div className="mt-2">
              <div className="w-full bg-lime-400 hover:bg-lime-500 text-green-900 py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="relative flex-shrink-0">
            <Image
              src={product.image || 'https://res.cloudinary.com/dgwsugfov/image/upload/v1756363439/1440523_t2o2tk.png'}
              alt={product.name}
              width={256}
              height={256}
              className="w-12 h-12 rounded-lg object-cover shadow-sm"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">OUT</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
            <div className="flex items-center space-x-1 mt-0.5">
              <Package className="w-3 h-3 text-gray-500" />
              <span className={`text-xs font-medium ${
                isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {product.stock}
              </span>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="text-base font-bold text-green-900 mb-1">Rs.{product.sellingPrice}</div>
            {!isOutOfStock && (
              <button className="bg-lime-400 hover:bg-lime-500 text-green-900 py-1.5 px-3 rounded-lg font-semibold flex items-center space-x-1 transition-colors text-sm">
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}