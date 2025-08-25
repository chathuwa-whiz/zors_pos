"use client";

import { Check } from 'lucide-react';

interface OrderCompleteProps {
  total: number;
}

export default function OrderComplete({ total }: OrderCompleteProps) {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
        <p className="text-gray-600 mb-4">Total: Rs.{total.toFixed(2)}</p>
        <p className="text-sm text-gray-500">Returning to POS in 3 seconds...</p>
      </div>
    </div>
  );
}