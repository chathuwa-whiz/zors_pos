"use client";

import { X, GripVertical, Scan, Plus } from 'lucide-react';
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
  onBarcodeScanned,
  resetPOSData
}: OrderTabsProps) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const handleBarcodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (barcodeInput.trim()) {
        onBarcodeScanned(barcodeInput.trim());
        setBarcodeInput('');
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeInput(value);
    
    if (value.length >= 8) {
      setTimeout(() => {
        if (barcodeInputRef.current?.value === value) {
          onBarcodeScanned(value.trim());
          setBarcodeInput('');
          setTimeout(() => {
            barcodeInputRef.current?.focus();
          }, 100);
        }
      }, 100);
    }
  };

  return (
    <div className="border-b border-green-200 bg-gradient-to-r from-green-900 to-green-800 p-4 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Active Orders</h2>
        <button
          onClick={onCreateNewOrder}
          className="flex items-center space-x-2 bg-lime-400 hover:bg-lime-500 text-green-900 px-4 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Order</span>
        </button>
        <button
          onClick={resetPOSData}
          title="Reset POS Data"
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      {/* Barcode Scanner */}
      <div className="mb-4">
        <div className="relative">
          <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or type product code..."
            value={barcodeInput}
            onChange={handleBarcodeChange}
            onKeyPress={handleBarcodeKeyPress}
            className="w-full pl-10 pr-4 py-3 text-base border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 bg-white shadow-sm transition-all duration-200"
            autoComplete="off"
          />
        </div>
      </div>
      
      {/* Order Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {orders.filter(order => order.status === 'active').map(order => (
          <div
            key={order._id}
            draggable={!order.isDefault}
            onDragStart={(e) => onDragStart(e, order._id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, order._id)}
            className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex-shrink-0 group transition-all duration-200 min-w-[120px] ${
              activeOrderId === order._id
                ? 'bg-lime-400 text-green-900 shadow-md ring-1 ring-white'
                : 'bg-white text-green-900 border border-green-300 hover:bg-lime-50 hover:border-lime-400 shadow-sm'
            } ${!order.isDefault ? 'cursor-move' : ''}`}
          >
            {!order.isDefault && (
              <GripVertical className="w-3 h-3 mr-2 opacity-50" />
            )}
            
            <button
              onClick={() => onSetActiveOrderId(order._id)}
              className="flex items-center space-x-2"
            >
              <span className="text-sm">{order.name}</span>
              {order.cart.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[18px] h-5 flex items-center justify-center ${
                  activeOrderId === order._id ? 'bg-green-900 text-lime-400' : 'bg-lime-400 text-green-900'
                }`}>
                  {order.cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {!order.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteOrder(order._id);
                }}
                className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded active:scale-95 ${
                  activeOrderId === order._id
                    ? 'hover:bg-green-800 text-white'
                    : 'hover:bg-red-100 text-red-600'
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