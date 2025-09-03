"use client";

import { X, GripVertical, Scan } from 'lucide-react';
import { Order } from '@/app/types/pos';
import { useState, useRef } from 'react';

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
  onBarcodeScanned: (barcode: string) => void;
}

export default function OrderTabs({
  orders,
  activeOrderId,
  onCreateNewOrder,
  onDeleteOrder,
  onSetActiveOrderId,
  onDragStart,
  onDragOver,
  onDrop,
  onBarcodeScanned
}: OrderTabsProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeKeyPress = (e: React.KeyboardEvent) => {
    // Handle Enter key press for barcode scanners
    if (e.key === 'Enter') {
      e.preventDefault();
      if (barcodeInput.trim()) {
        onBarcodeScanned(barcodeInput.trim());
        setBarcodeInput('');
        // Keep focus on the input for continuous scanning
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeInput(value);
    
    // Auto-submit when barcode is scanned (typically ends with Enter)
    // Some scanners might not trigger keyPress, so we also check for length
    if (value.length >= 8) { // Assuming minimum barcode length
      setTimeout(() => {
        if (barcodeInputRef.current?.value === value) {
          onBarcodeScanned(value.trim());
          setBarcodeInput('');
          // Keep focus on the input for continuous scanning
          setTimeout(() => {
            barcodeInputRef.current?.focus();
          }, 100);
        }
      }, 100);
    }
  };

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

      {/* Barcode Scanner Input */}
      <div className="mb-4">
        <div className="relative">
          <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode..."
            value={barcodeInput}
            onChange={handleBarcodeChange}
            onKeyPress={handleBarcodeKeyPress}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            autoComplete="off"
          />
        </div>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {orders.filter(order => order.status === 'active').map(order => (
          <div
            key={order._id}
            draggable={!order.isDefault}
            onDragStart={(e) => onDragStart(e, order._id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, order._id)}
            className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 group ${
              activeOrderId === order._id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${!order.isDefault ? 'cursor-move' : ''}`}
          >
            {!order.isDefault && (
              <GripVertical className="w-3 h-3 mr-2 opacity-50" />
            )}
            
            <button
              onClick={() => onSetActiveOrderId(order._id)}
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
                  onDeleteOrder(order._id);
                }}
                className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                  activeOrderId === order._id
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