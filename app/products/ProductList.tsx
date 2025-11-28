"use client";

import { Edit2, Trash2, Package, AlertTriangle, Building2, Printer, Plus, Minus, X } from 'lucide-react';
import { Product } from '@/app/types/pos';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useBarcode } from 'next-barcode';
import { printBarcode } from '@/app/utils/barcodePrintTemplates';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  searchQuery: string;
  onStockUpdate?: () => void;
}

interface Supplier {
  _id: string;
  name: string;
}

interface PrintModalState {
  product: Product;
  quantity: number;
}

export default function ProductList({
  products,
  loading,
  viewMode,
  onEdit,
  onDelete,
  searchQuery,
  onStockUpdate
}: ProductListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quickStockProduct, setQuickStockProduct] = useState<string | null>(null);
  const [quickStockValue, setQuickStockValue] = useState<string>('');
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [printModal, setPrintModal] = useState<PrintModalState | null>(null);
  const printInputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (printModal && printInputRef.current) {
      printInputRef.current.focus();
      printInputRef.current.select();
    }
  }, [printModal]);

  // Fetch suppliers to display supplier names
  useEffect(() => {
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => setSuppliers(data || []))
      .catch(error => console.error('Error fetching suppliers:', error));
  }, []);

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return 'No supplier';
    const supplier = suppliers.find(s => s._id === supplierId);
    return supplier ? supplier.name : 'Unknown supplier';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', color: 'text-red-600 bg-red-100', text: 'Out of Stock' };
    if (stock < 10) return { status: 'low', color: 'text-yellow-600 bg-yellow-100', text: 'Low Stock' };
    return { status: 'good', color: 'text-green-600 bg-green-100', text: 'In Stock' };
  };

  // Open print modal
  const handleOpenPrintModal = (product: Product) => {
    setPrintModal({ product, quantity: 1 });
  };

  // Handle print with quantity
  const handlePrint = () => {
    if (printModal && printModal.quantity > 0) {
      printBarcode(printModal.product, printModal.quantity);
      setPrintModal(null);
    }
  };

  // Handle quantity change in modal
  const handlePrintQuantityChange = (delta: number) => {
    if (printModal) {
      const newQuantity = Math.max(1, printModal.quantity + delta);
      setPrintModal({ ...printModal, quantity: newQuantity });
    }
  };

  // Handle direct quantity input
  const handlePrintQuantityInput = (value: string) => {
    if (printModal) {
      const numValue = parseInt(value) || 1;
      setPrintModal({ ...printModal, quantity: Math.max(1, numValue) });
    }
  };

  // Quick stock update function
  const handleQuickStockUpdate = async (product: Product, adjustment: number) => {
    const newStock = product.stock + adjustment;
    if (newStock < 0) {
      alert('Stock cannot be negative');
      return;
    }

    setUpdatingStock(product._id);

    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      const formData = new FormData();
      formData.append('stock', newStock.toString());
      if (user) {
        formData.append('userId', user._id || 'system');
        formData.append('userName', user.username || user.name || 'System');
      }

      const response = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      if (onStockUpdate) {
        onStockUpdate();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    } finally {
      setUpdatingStock(null);
      setQuickStockProduct(null);
      setQuickStockValue('');
    }
  };

  // Handle custom stock input
  const handleCustomStockSubmit = async (product: Product) => {
    const adjustment = parseInt(quickStockValue);
    if (isNaN(adjustment) || adjustment === 0) {
      setQuickStockProduct(null);
      setQuickStockValue('');
      return;
    }
    await handleQuickStockUpdate(product, adjustment);
  };

  // Barcode Preview Component using next-barcode
  const BarcodePreview = ({ value }: { value: string }) => {
    const { inputRef } = useBarcode({
      value,
      options: {
        format: 'CODE128',
        width: 1,
        height: 20,
        displayValue: false,
        background: '#ffffff',
        lineColor: '#000000',
      }
    });

    return <svg ref={inputRef} className="w-full h-4" />;
  };

  // Quick Stock Adjustment Component
  const QuickStockAdjuster = ({ product }: { product: Product }) => {
    const isUpdating = updatingStock === product._id;
    const isExpanded = quickStockProduct === product._id;

    if (isUpdating) {
      return (
        <div className="flex items-center justify-center py-1">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (isExpanded) {
      return (
        <div className="flex items-center space-x-1 bg-blue-50 rounded-lg p-1">
          <input
            type="number"
            value={quickStockValue}
            onChange={(e) => setQuickStockValue(e.target.value)}
            placeholder="+/-"
            className="w-16 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomStockSubmit(product);
              } else if (e.key === 'Escape') {
                setQuickStockProduct(null);
                setQuickStockValue('');
              }
            }}
          />
          <button
            onClick={() => handleCustomStockSubmit(product)}
            className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            title="Apply"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              setQuickStockProduct(null);
              setQuickStockValue('');
            }}
            className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            title="Cancel"
          >
            ×
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuickStockUpdate(product, -1);
          }}
          disabled={product.stock === 0}
          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Decrease stock by 1"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickStockProduct(product._id);
          }}
          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium min-w-[40px]"
          title="Click to enter custom amount"
        >
          {product.stock}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuickStockUpdate(product, 1);
          }}
          className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
          title="Increase stock by 1"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  };

  // Print Quantity Modal Component
  const PrintQuantityModal = () => {
    if (!printModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div 
          className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Print Barcodes</h3>
            <button
              onClick={() => setPrintModal(null)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-500 mb-1">Product</p>
            <p className="font-medium text-gray-900">{printModal.product.name}</p>
            {printModal.product.barcode && (
              <p className="text-xs font-mono text-gray-500 mt-1">{printModal.product.barcode}</p>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Labels
            </label>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handlePrintQuantityChange(-10)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Decrease by 10"
              >
                <span className="text-xs font-medium">-10</span>
              </button>
              <button
                onClick={() => handlePrintQuantityChange(-1)}
                className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                ref={printInputRef}
                type="number"
                value={printModal.quantity}
                onChange={(e) => handlePrintQuantityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePrint();
                  } else if (e.key === 'Escape') {
                    setPrintModal(null);
                  }
                }}
                className="w-20 px-3 py-3 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                min="1"
              />
              <button
                onClick={() => handlePrintQuantityChange(1)}
                className="p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePrintQuantityChange(10)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Increase by 10"
              >
                <span className="text-xs font-medium">+10</span>
              </button>
            </div>
          </div>

          {/* Quick Quantity Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {[1, 5, 10, 20, 50, 100].map((qty) => (
              <button
                key={qty}
                onClick={() => setPrintModal({ ...printModal, quantity: qty })}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  printModal.quantity === qty
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => setPrintModal(null)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={printModal.quantity < 1}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Printer className="w-4 h-4" />
              <span>Print {printModal.quantity} Label{printModal.quantity !== 1 ? 's' : ''}</span>
            </button>
          </div>

          {/* Hint */}
          <p className="text-xs text-gray-400 text-center mt-3">
            Press Enter to print • Press Escape to cancel
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            {searchQuery ? 'No products match your search' : 'No products found'}
          </p>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms' : 'Add your first product to get started'}
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const isLowStock = product.stock > 0 && product.stock < 10;

            return (
              <div key={product._id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow ${isLowStock ? 'border-yellow-300' : 'border-gray-200'}`}>
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </div>

                  {/* Low Stock Warning Icon */}
                  {isLowStock && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white p-1 rounded-full">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>

                  {/* Barcode Display in Grid View */}
                  {product.barcode && (
                    <div className="mb-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <BarcodePreview value={product.barcode} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 font-mono">{product.barcode}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPrintModal(product);
                          }}
                          className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                          title="Print barcode"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                    {/* Supplier Badge */}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Building2 className="w-3 h-3 mr-1" />
                      <span>{getSupplierName(product.supplier)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Selling Price</p>
                      <p className="text-lg font-bold text-green-600">Rs.{product.sellingPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Stock</p>
                      <QuickStockAdjuster product={product} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      className="flex items-center justify-center bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Print Quantity Modal */}
        <PrintQuantityModal />
      </>
    );
  }

  // List View
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                // const stockStatus = getStockStatus(product.stock);
                const isLowStock = product.stock > 0 && product.stock < 10;

                return (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.barcode ? (
                        <div className="space-y-1">
                          <div className="bg-gray-50 p-1 rounded w-20">
                            <BarcodePreview value={product.barcode} />
                          </div>
                          <span className="font-mono text-xs block">
                            {product.barcode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rs.{product.sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <QuickStockAdjuster product={product} />
                        {isLowStock && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {product.barcode && (
                          <button
                            onClick={() => handleOpenPrintModal(product)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Print barcode"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Quantity Modal */}
      <PrintQuantityModal />
    </>
  );
}