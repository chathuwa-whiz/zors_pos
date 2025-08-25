"use client";

import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Order } from '@/app/types/pos';

interface CartItemsProps {
  activeOrder: Order | undefined;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveFromCart: (productId: string) => void;
}

export default function CartItems({
  activeOrder,
  onUpdateQuantity,
  onRemoveFromCart
}: CartItemsProps) {
  return (
    <div className="flex-1 overflow-auto p-4">
      {!activeOrder || activeOrder.cart.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Cart is empty</p>
          <p className="text-sm">Add items from the menu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrder.cart.map(item => (
            <div key={item.product.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-500">${item.product.price} each</p>
                </div>
                <button
                  onClick={() => onRemoveFromCart(item.product.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="font-semibold text-green-600">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}