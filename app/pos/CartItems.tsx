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
    <div className="flex-1 overflow-auto p-6">
      {!activeOrder || activeOrder.cart.length === 0 ? (
        <div className="text-center text-green-600 mt-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900 mb-2">Cart is empty</p>
          <p className="text-lg text-green-700">Add items from the menu to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrder.cart.map(item => (
            <div key={item.product._id} className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-green-900 text-xl mb-2">{item.product.name}</h4>
                  {item.product.description && (
                    <p className="text-base text-green-600 mb-2">{item.product.description}</p>
                  )}
                  <p className="text-lg text-green-700 font-semibold">
                    Rs.{item.product.sellingPrice.toFixed(2)} each
                  </p>
                </div>
                <button
                  onClick={() => onRemoveFromCart(item.product._id)}
                  className="text-red-500 hover:text-red-700 p-3 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onUpdateQuantity(item.product._id, -1)}
                    className="w-12 h-12 bg-green-100 border-2 border-green-300 rounded-xl flex items-center justify-center hover:bg-green-200 transition-all duration-200 active:scale-95 text-green-900"
                  >
                    <Minus className="w-6 h-6" />
                  </button>
                  <span className="w-16 text-center font-bold text-2xl text-green-900">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.product._id, 1)}
                    className="w-12 h-12 bg-lime-400 border-2 border-lime-500 rounded-xl flex items-center justify-center hover:bg-lime-500 transition-all duration-200 active:scale-95 text-green-900"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600 font-medium">Subtotal</div>
                  <span className="font-bold text-green-900 text-2xl">
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