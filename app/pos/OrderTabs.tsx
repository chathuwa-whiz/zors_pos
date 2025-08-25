"use client";

import { X, GripVertical } from 'lucide-react';
import { Order } from '@/app/types/pos';

interface OrderTabsProps {
  orders: Order[];
  activeOrderId: string;
  draggedOrderId: string | null;
  onCreateNewOrder: () => void;
  onDeleteOrder: (orderId: string) => void;
  onSetActiveOrderId: (orderId: string) => void;
  onDragStart: (e: React.DragEvent, orderId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetOrderId: string) => void;
}

export default function OrderTabs({
  orders,
  activeOrderId,
  draggedOrderId,
  onCreateNewOrder,
  onDeleteOrder,
  onSetActiveOrderId,
  onDragStart,
  onDragOver,
  onDrop
}: OrderTabsProps) {
  return (
    <div className="border-b border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
        <button
          onClick={onCreateNewOrder}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
        >
          + New Order
        </button>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {orders.filter(order => order.status === 'active').map(order => (
          <div
            key={order.id}
            draggable={!order.isDefault}
            onDragStart={(e) => onDragStart(e, order.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, order.id)}
            className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 group ${
              activeOrderId === order.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${!order.isDefault ? 'cursor-move' : ''}`}
          >
            {!order.isDefault && (
              <GripVertical className="w-3 h-3 mr-2 opacity-50" />
            )}
            
            <button
              onClick={() => onSetActiveOrderId(order.id)}
              className="flex items-center space-x-2"
            >
              <span>{order.name}</span>
              {order.cart.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {order.cart.length}
                </span>
              )}
            </button>

            {!order.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteOrder(order.id);
                }}
                className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                  activeOrderId === order.id
                    ? 'hover:bg-blue-700 text-white'
                    : 'hover:bg-red-100 text-red-500'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}