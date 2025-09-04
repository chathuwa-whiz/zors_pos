"use client";

import { Edit2, Trash2, Package, AlertTriangle, Building2 } from 'lucide-react';
import { Product } from '@/app/types/pos';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  searchQuery: string;
}

interface Supplier {
  _id: string;
  name: string;
}

export default function ProductList({
  products,
  loading,
  viewMode,
  onEdit,
  onDelete,
  searchQuery
}: ProductListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

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
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className={`text-lg font-bold ${stockStatus.status === 'out' ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock}
                    </p>
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
    );
  }

  // List View
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Product</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Category</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Supplier</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Price</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Stock</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Status</th>
              <th className="text-center px-6 py-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product, index) => {
              const stockStatus = getStockStatus(product.stock);
              const isLowStock = product.stock > 0 && product.stock < 10;

              return (
                <tr
                  key={product._id}
                  className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${isLowStock ? 'border-l-4 border-l-yellow-400' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      {getSupplierName(product.supplier)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">Rs.{product.sellingPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Cost: Rs.{product.costPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${stockStatus.status === 'out' ? 'text-red-600' : stockStatus.status === 'low' ? 'text-yellow-600' : 'text-gray-900'}`}>
                      {product.stock}
                    </span>
                    {isLowStock && (
                      <AlertTriangle className="inline-block w-4 h-4 ml-1 text-yellow-500" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.status === 'low' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {stockStatus.text}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
  );
}