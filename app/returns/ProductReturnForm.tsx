"use client";

import { useState } from 'react';
import { X, Package, RotateCcw, Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Product } from '@/app/types/pos';
import { User } from '@/app/types/user';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedProduct = products.find(p => p._id === formData.productId);
  const reasons = formData.returnType === 'customer' ? customerReasons : supplierReasons;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchQuery))
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'returnType') {
      setFormData(prev => ({ ...prev, reason: '' }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleProductSelect = (product: Product) => {
    setFormData(prev => ({ ...prev, productId: product._id }));
    setSearchQuery(product.name);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
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

      // Validate user data
      if (!user || !user._id || !user.username) {
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

      setSuccess(true);

      // Close after showing success
      setTimeout(() => {
        onSubmit();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Process Product Return</h2>
              <p className="text-gray-600">Handle customer returns and supplier exchanges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="p-6 bg-green-50 border-b border-green-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Return Processed Successfully!</h3>
                  <p className="text-green-700 text-sm">The return has been recorded and stock has been updated.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Return Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Return Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.label
                className="relative cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name="returnType"
                  value="customer"
                  checked={formData.returnType === 'customer'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-xl transition-all ${formData.returnType === 'customer'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                  }`}>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Customer Return</div>
                      <div className="text-sm text-gray-600">Product returned by customer</div>
                      <div className="text-xs text-green-600 font-medium mt-1">Increases stock</div>
                    </div>
                  </div>
                </div>
              </motion.label>

              <motion.label
                className="relative cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="radio"
                  name="returnType"
                  value="supplier"
                  checked={formData.returnType === 'supplier'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-xl transition-all ${formData.returnType === 'supplier'
                  ? 'border-red-500 bg-red-50 shadow-md'
                  : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                  }`}>
                  <div className="flex items-center space-x-3">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Supplier Return</div>
                      <div className="text-sm text-gray-600">Return to supplier</div>
                      <div className="text-xs text-red-600 font-medium mt-1">Decreases stock</div>
                    </div>
                  </div>
                </div>
              </motion.label>
            </div>
          </div>

          {/* Product Selection */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Product *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search by product name or barcode..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Product Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && filteredProducts.length > 0 && (
                <motion.div
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductSelect(product)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${formData.productId === product._id ? 'bg-orange-50 border-orange-200' : ''
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.barcode && `Barcode: ${product.barcode} | `}
                            ₹{product.sellingPrice.toFixed(2)} | Stock: {product.stock}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <input type="hidden" name="productId" value={formData.productId} required />
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-900">{selectedProduct.name}</div>
                  <div className="text-sm text-blue-700">
                    Current Stock: {selectedProduct.stock} | Price: ₹{selectedProduct.sellingPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Enter quantity"
              />
              {formData.returnType === 'supplier' && selectedProduct && (
                <p className="text-sm text-gray-500 mt-1">
                  Maximum available: {selectedProduct.stock}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Return *
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Select a reason...</option>
                {reasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
              placeholder="Optional notes about the return..."
            />
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 rounded-xl p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={submitting || success}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : success ? (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Success!</span>
                </div>
              ) : (
                'Process Return'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}