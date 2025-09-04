"use client";

import { RotateCcw, Package, Calendar, User, TrendingUp, TrendingDown, Eye, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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
  const [selectedReturn, setSelectedReturn] = useState<ProductReturn | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(returns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReturns = returns.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading returns...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
        </motion.div>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <RotateCcw className="w-12 h-12 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No returns found</h3>
          <p className="text-gray-600 mb-6">Start by processing your first return to see data here</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Package className="w-4 h-4" />
            <span>Returns will appear here once processed</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Returns History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Product</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Type</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Quantity</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Reason</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Processed By</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Date</th>
                <th className="text-center px-6 py-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {currentReturns.map((returnItem, index) => (
                  <motion.tr
                    key={returnItem._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{returnItem.product.name}</div>
                          <div className="text-sm text-gray-500">₹{returnItem.product.sellingPrice.toFixed(2)} per unit</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${returnItem.returnType === 'customer'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {returnItem.returnType === 'customer' ? (
                          <>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Customer Return
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Supplier Return
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg font-bold text-gray-900">
                        {returnItem.quantity}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate">{returnItem.reason}</div>
                        {returnItem.notes && (
                          <div className="text-sm text-gray-500 truncate mt-1">{returnItem.notes}</div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{returnItem.cashier.username}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(returnItem.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(returnItem.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedReturn(returnItem)}
                        className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, returns.length)} of {returns.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${page === currentPage
                          ? 'bg-orange-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return Details Modal */}
      <AnimatePresence>
        {selectedReturn && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReturn(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Return Details</h2>
                    <p className="text-gray-500">Complete return information</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <Package className="w-8 h-8 text-blue-500" />
                        <div>
                          <div className="font-semibold text-gray-900">{selectedReturn.product.name}</div>
                          <div className="text-sm text-gray-500">₹{selectedReturn.product.sellingPrice.toFixed(2)} per unit</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Type</label>
                      <div className={`inline-flex items-center px-4 py-2 rounded-xl font-medium ${selectedReturn.returnType === 'customer'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {selectedReturn.returnType === 'customer' ? (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Customer Return
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 mr-2" />
                            Supplier Return
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <div className="text-2xl font-bold text-gray-900">{selectedReturn.quantity} units</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Processed By</label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <User className="w-8 h-8 text-purple-500" />
                        <div className="font-semibold text-gray-900">{selectedReturn.cashier.username}</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-8 h-8 text-blue-500" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {new Date(selectedReturn.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(selectedReturn.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{(selectedReturn.quantity * selectedReturn.product.sellingPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 font-medium">{selectedReturn.reason}</p>
                  </div>
                </div>

                {selectedReturn.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-900">{selectedReturn.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}