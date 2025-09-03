"use client";

import { UserPlus, Home, Car, MapPin, ChefHat, Percent } from 'lucide-react';
import { Order } from '@/app/types/pos';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
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

        // Find global discount
        const global = data.find((d: Discount) => d.isGlobal);
        if (global) {
          setGlobalDiscount(global);
          // Apply global discount to order if not already set
          if (!activeOrder.discountPercentage) {
            onUpdateActiveOrder({ discountPercentage: global.percentage });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
    }
  };

  const handleDiscountSelect = (discountId: string) => {
    setSelectedDiscountId(discountId);
    const selectedDiscount = discounts.find(d => d._id === discountId);
    if (selectedDiscount) {
      onUpdateActiveOrder({ discountPercentage: selectedDiscount.percentage });
    }
  };

  // Handle order type change with appropriate charges
  const handleOrderTypeChange = (orderType: 'dine-in' | 'takeaway' | 'delivery') => {
    const updates: Partial<Order> = { orderType };

    // Reset charges based on order type
    if (orderType === 'dine-in') {
      updates.tableCharge = activeOrder.tableCharge || 0;
      updates.deliveryCharge = 0; // Reset delivery charge
    } else if (orderType === 'takeaway') {
      updates.tableCharge = 0;
      updates.deliveryCharge = 0; // Reset delivery charge
    } else if (orderType === 'delivery') {
      updates.tableCharge = 0;
      updates.deliveryCharge = activeOrder.deliveryCharge || 0; // Keep existing or set to 0
    }

    onUpdateActiveOrder(updates);
  };

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
              onClick={() => handleOrderTypeChange('dine-in')}
              className={`px-3 py-1 rounded text-sm ${activeOrder.orderType === 'dine-in' ? 'bg-white shadow' : ''
                }`}
            >
              <Home className="w-4 h-4 inline mr-1" />
              Dine-in
            </button>
            <button
              onClick={() => handleOrderTypeChange('takeaway')}
              className={`px-3 py-1 rounded text-sm ${activeOrder.orderType === 'takeaway' ? 'bg-white shadow' : ''
                }`}
            >
              <Car className="w-4 h-4 inline mr-1" />
              Takeaway
            </button>
            <button
              onClick={() => handleOrderTypeChange('delivery')}
              className={`px-3 py-1 rounded text-sm ${activeOrder.orderType === 'delivery' ? 'bg-white shadow' : ''
                }`}
            >
              <MapPin className="w-4 h-4 inline mr-1" />
              Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Discount Selection */}
      <div className="mb-3 flex flex-wrap gap-3">

        {/* Discount Dropdown */}
        {discounts.length > 0 && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedDiscountId}
              onChange={(e) => handleDiscountSelect(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
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

        {/* Display Global Discount */}
        {globalDiscount && (
          <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded text-sm">
            <span className="text-green-800">
              Global Discount: {globalDiscount.percentage}%
            </span>
          </div>
        )}
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

      {/* Delivery Charge Input for Delivery */}
      {activeOrder.orderType === 'delivery' && (
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Delivery Charge:</span>
            <input
              type="number"
              placeholder="0"
              value={activeOrder.deliveryCharge || ''}
              onChange={(e) => onUpdateActiveOrder({ deliveryCharge: parseFloat(e.target.value) || 0 })}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
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