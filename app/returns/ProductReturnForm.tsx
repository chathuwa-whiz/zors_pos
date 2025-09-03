"use client";

import { useState } from 'react';
import { X, Package, RotateCcw } from 'lucide-react';
import { Product } from '@/app/types/pos';
import { User } from '@/app/types/user';

interface ProductReturnFormProps {
  products: Product[];
  user: User;
  onSubmit: () => void;
  onClose: () => void;
}

interface FormData {
  productId: string;
  returnType: 'customer' | 'supplier';
  quantity: string;
  reason: string;
  notes: string;
}

const customerReasons = [
  'Defective product',
  'Wrong item received',
  'Customer changed mind',
  'Product damaged',
  'Not as described',
  'Quality issues',
  'Other'
];

const supplierReasons = [
  'Expired product',
  'Overstocked',
  'Quality issue',
  'Seasonal return',
  'Damaged goods',
  'Supplier recall',
  'Other'
];

export default function ProductReturnForm({ products, user, onSubmit, onClose }: ProductReturnFormProps) {
  const [formData, setFormData] = useState<FormData>({
    productId: '',
    returnType: 'customer',
    quantity: '',
    reason: '',
    notes: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedProduct = products.find(p => p._id === formData.productId);
  const reasons = formData.returnType === 'customer' ? customerReasons : supplierReasons;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'returnType') {
      // Reset reason when return type changes
      setFormData(prev => ({ ...prev, reason: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validation
      if (!formData.productId || !formData.quantity || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }

      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }

      if (formData.returnType === 'supplier' && selectedProduct && quantity > selectedProduct.stock) {
        throw new Error('Return quantity cannot exceed current stock');
      }

      const returnData = {
        productId: formData.productId,
        returnType: formData.returnType,
        quantity: quantity,
        reason: formData.reason,
        notes: formData.notes || undefined
      };

      // Get user from localStorage
      const userString = localStorage.getItem('user');
      let user;
      
      if (userString) {
        try {
          user = JSON.parse(userString);
        } catch (err) {
          throw new Error('Invalid user data');
        }
      } else {
        throw new Error('User not found. Please login again.');
      }

      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Info': JSON.stringify(user)
        },
        body: JSON.stringify(returnData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process return');
      }

      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Process Product Return</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Return Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative">
                <input
                  type="radio"
                  name="returnType"
                  value="customer"
                  checked={formData.returnType === 'customer'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.returnType === 'customer' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Customer Return</div>
                      <div className="text-sm text-gray-500">Increases stock</div>
                    </div>
                  </div>
                </div>
              </label>
              
              <label className="relative">
                <input
                  type="radio"
                  name="returnType"
                  value="supplier"
                  checked={formData.returnType === 'supplier'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.returnType === 'supplier' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-5 h-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Supplier Return</div>
                      <div className="text-sm text-gray-500">Decreases stock</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product *
            </label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Choose a product...</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - Rs.{product.sellingPrice.toFixed(2)} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              max={formData.returnType === 'supplier' && selectedProduct ? selectedProduct.stock : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
            {formData.returnType === 'supplier' && selectedProduct && (
              <p className="text-sm text-gray-500 mt-1">
                Available stock: {selectedProduct.stock}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Return *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a reason...</option>
              {reasons.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Optional notes about the return..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Processing...' : 'Process Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}