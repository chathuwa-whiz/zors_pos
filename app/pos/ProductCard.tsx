"use client";

import { Product } from '@/app/types/pos';
import Image from 'next/image';

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
          <Image
            src={product.image || 'https://res.cloudinary.com/dgwsugfov/image/upload/v1756363439/1440523_t2o2tk.png'}
            alt={product.name}
            width={512}
            height={512}
            className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3"
          />
          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">Rs.{product.sellingPrice}</span>
            <span className="text-xs text-gray-400">Stock: {product.stock}</span>
          </div>
        </div>
      ) : (
        <>
          <Image
            src={product.image || 'https://res.cloudinary.com/dgwsugfov/image/upload/v1756363439/1440523_t2o2tk.png'}
            alt={product.name}
            width={512}
            height={512}
            className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">Rs.{product.sellingPrice}</div>
            <div className="text-xs text-gray-400">Stock: {product.stock}</div>
          </div>
        </>
      )}
    </div>
  );
}