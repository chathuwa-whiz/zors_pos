"use client";

import { Home, Car, MapPin, ChefHat, UserPlus, User } from 'lucide-react';
import { Order } from '@/app/types/pos';
import { useState, useEffect, useCallback } from 'react';

interface OrderControlsProps {
  activeOrder: Order;
  onUpdateActiveOrder: (updates: Partial<Order>) => void;
  onShowCustomerModal: () => void;
}

interface Discount {
  _id: string;
  name: string;
  percentage: number;
  isGlobal: boolean;
}

export default function OrderControls({
  activeOrder,
  onUpdateActiveOrder,
  onShowCustomerModal
}: OrderControlsProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState<Discount | null>(null);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');

  const fetchDiscounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/discounts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);

        const global = data.find((d: Discount) => d.isGlobal);
        if (global) {
          setGlobalDiscount(global);
          if (!activeOrder.discountPercentage) {
            onUpdateActiveOrder({ discountPercentage: global.percentage });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    }
  }, [activeOrder.discountPercentage, onUpdateActiveOrder]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleDiscountSelect = (discountId: string) => {
    setSelectedDiscountId(discountId);
    const selectedDiscount = discounts.find(d => d._id === discountId);
    if (selectedDiscount) {
      onUpdateActiveOrder({ discountPercentage: selectedDiscount.percentage });
    }
  };

  const handleOrderTypeChange = (orderType: 'dine-in' | 'takeaway' | 'delivery') => {
    const updates: Partial<Order> = { orderType };

    if (orderType === 'dine-in') {
      updates.tableCharge = activeOrder.tableCharge || 0;
      updates.deliveryCharge = 0;
    } else if (orderType === 'takeaway') {
      updates.tableCharge = 0;
      updates.deliveryCharge = 0;
    } else if (orderType === 'delivery') {
      updates.tableCharge = 0;
      updates.deliveryCharge = activeOrder.deliveryCharge || 0;
    }

    onUpdateActiveOrder(updates);
  };

  return (
    <div className="border-b border-green-200 bg-gradient-to-r from-green-50 to-lime-50 p-4 flex-shrink-0">
      {/* Customer and Order Type */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onShowCustomerModal}
            className="flex items-center space-x-2 bg-white hover:bg-lime-50 px-4 py-2 rounded-lg border border-green-300 hover:border-lime-400 transition-all duration-200 active:scale-95 shadow-sm"
          >
            {activeOrder.customer?.name ? (
              <>
                <User className="w-4 h-4 text-green-900" />
                <span className="text-sm font-semibold text-green-900">{activeOrder.customer.name}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-green-900" />
                <span className="text-sm font-semibold text-green-900">Add Customer</span>
              </>
            )}
          </button>

          <div className="flex space-x-1 bg-white rounded-lg p-1 border border-green-300 shadow-sm">
            <button
              onClick={() => handleOrderTypeChange('dine-in')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 active:scale-95 ${activeOrder.orderType === 'dine-in'
                  ? 'bg-lime-400 text-green-900 shadow-sm'
                  : 'text-green-900 hover:bg-lime-100'
                }`}
            >
              <Home className="w-3 h-3 inline mr-1" />
              Dine-in
            </button>
            <button
              onClick={() => handleOrderTypeChange('takeaway')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 active:scale-95 ${activeOrder.orderType === 'takeaway'
                  ? 'bg-lime-400 text-green-900 shadow-sm'
                  : 'text-green-900 hover:bg-lime-100'
                }`}
            >
              <Car className="w-3 h-3 inline mr-1" />
              Takeaway
            </button>
            <button
              onClick={() => handleOrderTypeChange('delivery')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 active:scale-95 ${activeOrder.orderType === 'delivery'
                  ? 'bg-lime-400 text-green-900 shadow-sm'
                  : 'text-green-900 hover:bg-lime-100'
                }`}
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Discount Selection */}
      <div className="mb-3 flex flex-wrap gap-3">
        {discounts.length > 0 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-green-900">Discount:</label>
            <select
              value={selectedDiscountId}
              onChange={(e) => handleDiscountSelect(e.target.value)}
              className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white text-sm font-medium shadow-sm"
            >
              <option value="">Select Discount</option>
              {discounts.map((discount) => (
                <option key={discount._id} value={discount._id}>
                  {discount.name} ({discount.percentage}%)
                  {discount.isGlobal ? ' - Global' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {globalDiscount && (
          <div className="flex items-center space-x-1 bg-lime-100 px-3 py-1 rounded-lg border border-lime-400">
            <span className="text-sm font-semibold text-green-900">
              Global Discount: {globalDiscount.percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Charges */}
      {activeOrder.orderType === 'dine-in' && (
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-green-900" />
            <span className="text-sm font-semibold text-green-900">Table Charge:</span>
            <input
              type="number"
              placeholder="0"
              value={activeOrder.tableCharge || ''}
              onChange={(e) => onUpdateActiveOrder({ tableCharge: parseFloat(e.target.value) || 0 })}
              className="w-20 px-2 py-1 border border-green-300 rounded text-sm font-medium focus:ring-2 focus:ring-lime-400 focus:border-lime-400 shadow-sm"
              min="0"
            />
            <span className="text-sm font-semibold text-green-900">Rs</span>
          </div>
        </div>
      )}

      {activeOrder.orderType === 'delivery' && (
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-900" />
            <span className="text-sm font-semibold text-green-900">Delivery Charge:</span>
            <input
              type="number"
              placeholder="0"
              value={activeOrder.deliveryCharge || ''}
              onChange={(e) => onUpdateActiveOrder({ deliveryCharge: parseFloat(e.target.value) || 0 })}
              className="w-20 px-2 py-1 border border-green-300 rounded text-sm font-medium focus:ring-2 focus:ring-lime-400 focus:border-lime-400 shadow-sm"
              min="0"
            />
            <span className="text-sm font-semibold text-green-900">Rs</span>
          </div>
        </div>
      )}

      {/* Kitchen Note */}
      <div className="mb-3">
        <div className="flex items-center space-x-2">
          <ChefHat className="w-4 h-4 text-green-900" />
          <input
            type="text"
            placeholder="Kitchen note..."
            value={activeOrder.kitchenNote}
            onChange={(e) => onUpdateActiveOrder({ kitchenNote: e.target.value })}
            className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}