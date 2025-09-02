"use client";

import { RotateCcw, Package, Calendar, User } from 'lucide-react';

interface ProductReturn {
  _id: string;
  product: {
    _id: string;
    name: string;
    sellingPrice: number;
  };
  returnType: 'customer' | 'supplier';
  quantity: number;
  reason: string;
  cashier: {
    _id: string;
    username: string;
  };
  createdAt: string;
  notes?: string;
}

interface ReturnsListProps {
  returns: ProductReturn[];
  loading: boolean;
}

export default function ReturnsList({ returns, loading }: ReturnsListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Loading returns...</p>
        </div>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No returns found</p>
          <p className="text-gray-500">Start by processing your first return</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Product</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Type</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Quantity</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Reason</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Processed By</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {returns.map((returnItem, index) => (
              <tr
                key={returnItem._id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{returnItem.product.name}</div>
                      <div className="text-sm text-gray-500">Rs.{returnItem.product.sellingPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    returnItem.returnType === 'customer'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {returnItem.returnType === 'customer' ? (
                      <>
                        <Package className="w-3 h-3 mr-1" />
                        Customer Return
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Supplier Return
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{returnItem.quantity}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{returnItem.reason}</div>
                  {returnItem.notes && (
                    <div className="text-xs text-gray-500 mt-1">{returnItem.notes}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{returnItem.cashier.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {new Date(returnItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(returnItem.createdAt).toLocaleTimeString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}