"use client";

import { UserPlus, Home, Car, MapPin, ChefHat } from 'lucide-react';
import { Order } from '@/app/types/pos';

interface OrderControlsProps {
  activeOrder: Order;
  onUpdateActiveOrder: (updates: Partial<Order>) => void;
  onShowCustomerModal: () => void;
}

export default function OrderControls({
  activeOrder,
  onUpdateActiveOrder,
  onShowCustomerModal
}: OrderControlsProps) {
  return (
    <div className="border-b border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onShowCustomerModal}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>Customer</span>
          </button>

          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onUpdateActiveOrder({ orderType: 'dine-in', tableCharge: activeOrder.tableCharge })}
              className={`px-3 py-1 rounded text-sm ${activeOrder.orderType === 'dine-in' ? 'bg-white shadow' : ''
                }`}
            >
              <Home className="w-4 h-4 inline mr-1" />
              Dine-in
            </button>
            <button
              onClick={() => onUpdateActiveOrder({ orderType: 'takeaway', tableCharge: 0 })}
              className={`px-3 py-1 rounded text-sm ${activeOrder.orderType === 'takeaway' ? 'bg-white shadow' : ''
                }`}
            >
              <Car className="w-4 h-4 inline mr-1" />
              Takeaway
            </button>
            <button
              onClick={() => onUpdateActiveOrder({ orderType: 'delivery', tableCharge: 0 })}
              className={`px-3 py-1 rounded text-sm ${activeOrder.orderType === 'delivery' ? 'bg-white shadow' : ''
                }`}
            >
              <MapPin className="w-4 h-4 inline mr-1" />
              Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Table Charge Input for Dine-in */}
      {activeOrder.orderType === 'dine-in' && (
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Table Charge:</span>
            <input
              type="number"
              placeholder="0"
              value={activeOrder.tableCharge || ''}
              onChange={(e) => onUpdateActiveOrder({ tableCharge: parseFloat(e.target.value) || 0 })}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-sm text-gray-500">Rs</span>
          </div>
        </div>
      )}

      {/* Kitchen Note */}
      <div className="mb-3">
        <div className="flex items-center space-x-2">
          <ChefHat className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Kitchen note..."
            value={activeOrder.kitchenNote}
            onChange={(e) => onUpdateActiveOrder({ kitchenNote: e.target.value })}
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
    </div>
  );
}