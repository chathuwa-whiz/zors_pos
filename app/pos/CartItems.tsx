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
        <div className="text-center text-gray-500 mt-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Cart is empty</p>
          <p className="text-sm">Add items from the menu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeOrder.cart.map(item => (
            <div key={item.product.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-4">
                  <h4 className="font-semibold text-gray-900 text-lg">{item.product.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.product.description}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Rs.{item.product.price.toFixed(2)} each
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFromCart(item.product.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Subtotal</div>
                  <span className="font-bold text-green-600 text-xl">
                    Rs.{item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}