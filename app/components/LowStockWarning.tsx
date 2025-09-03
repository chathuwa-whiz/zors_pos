"use client";

import { AlertTriangle } from 'lucide-react';
import { Product } from '@/app/types/pos';

interface LowStockWarningProps {
  products: Product[];
  threshold?: number;
}

export default function LowStockWarning({ products, threshold = 10 }: LowStockWarningProps) {
  const lowStockProducts = products.filter(
    product => product.stock > 0 && product.stock < threshold
  );

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Low Stock Alert
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {lowStockProducts.slice(0, 5).map((product) => (
                <li key={product._id}>
                  <span className="font-medium">{product.name}</span> - Only {product.stock} left
                </li>
              ))}
              {lowStockProducts.length > 5 && (
                <li>and {lowStockProducts.length - 5} more...</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}