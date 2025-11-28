"use client";

import { useState, useEffect } from 'react';
import { Search, Printer, Package, Plus, Minus } from 'lucide-react';
import { Product } from '@/app/types/pos';
import { useBarcode } from 'next-barcode';
import { printMultipleBarcodes } from '@/app/lib/barcodePrintTemplates';

export default function BarcodePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>({}); // productId -> quantity

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        // Only show products that have barcodes
        const productsWithBarcodes = data.filter((product: Product) => product.barcode);
        setProducts(productsWithBarcodes);
        setFilteredProducts(productsWithBarcodes);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev[productId]) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [productId]: 1 };
      }
    });
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelectedProducts(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [productId]: newQty };
    });
  };

  const handleSetQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => {
      if (quantity <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: quantity };
    });
  };

  const handleSelectAll = () => {
    if (Object.keys(selectedProducts).length === filteredProducts.length) {
      setSelectedProducts({});
    } else {
      const newSelection: Record<string, number> = {};
      filteredProducts.forEach(p => {
        newSelection[p._id] = selectedProducts[p._id] || 1;
      });
      setSelectedProducts(newSelection);
    }
  };

  const handleCardClick = (productId: string, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    // Don't toggle if clicking on quantity controls or checkbox
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('input') ||
      target.closest('button')
    ) {
      return;
    }
    handleSelectProduct(productId);
  };

  const handlePrintBarcodes = () => {
    const selectedProductsData = Object.entries(selectedProducts)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        product: products.find(p => p._id === productId)!,
        quantity
      }))
      .filter(item => item.product);

    if (selectedProductsData.length === 0) {
      alert('Please select at least one product to print barcodes');
      return;
    }

    printMultipleBarcodes(selectedProductsData);
  };

  const getTotalLabels = () => {
    return Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0);
  };

  // Barcode Preview Component using next-barcode
  const BarcodePreview = ({ value }: { value: string | undefined }) => {
    const { inputRef } = useBarcode({
      value: value || '',
      options: {
        format: 'CODE128',
        width: 2,
        height: 30,
        displayValue: false,
        background: '#ffffff',
        lineColor: '#000000',
      }
    });

    return <svg ref={inputRef} className="w-full h-6" />;
  };

  // Quantity Selector Component
  const QuantitySelector = ({ productId }: { productId: string }) => {
    const quantity = selectedProducts[productId] || 0;
    const isSelected = quantity > 0;

    if (!isSelected) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSetQuantity(productId, 1);
          }}
          className="px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Add
        </button>
      );
    }

    return (
      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => handleQuantityChange(productId, -1)}
          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => handleSetQuantity(productId, parseInt(e.target.value) || 0)}
          className="w-14 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          min="0"
        />
        <button
          onClick={() => handleQuantityChange(productId, 1)}
          className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Barcode Printing</h1>
              <p className="text-gray-600">Select products and specify quantities to print</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, barcode, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {Object.keys(selectedProducts).length === filteredProducts.length && filteredProducts.length > 0 
                  ? 'Deselect All' 
                  : 'Select All'}
              </button>
              <button
                onClick={handlePrintBarcodes}
                disabled={getTotalLabels() === 0}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print ({getTotalLabels()} labels)</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Showing {filteredProducts.length} products with barcodes</span>
            {Object.keys(selectedProducts).length > 0 && (
              <>
                <span>•</span>
                <span className="text-purple-600 font-medium">
                  {Object.keys(selectedProducts).length} products selected
                </span>
                <span>•</span>
                <span className="text-purple-600 font-medium">
                  {getTotalLabels()} total labels to print
                </span>
              </>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery ? 'No products found matching your search' : 'No products with barcodes found'}
              </p>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search terms' : 'Add products with barcodes to print them'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const quantity = selectedProducts[product._id] || 0;
              const isSelected = quantity > 0;
              
              return (
                <div
                  key={product._id}
                  className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={(e) => handleCardClick(product._id, e)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm flex-1 mr-2">{product.name}</h3>
                      {isSelected && (
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          ×{quantity}
                        </span>
                      )}
                    </div>

                    {/* Barcode Preview */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <BarcodePreview value={product.barcode} />
                      <div className="text-xs font-mono text-center mt-1 font-bold">
                        {product.barcode}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium">Rs. {product.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Stock:</span>
                        <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex justify-center pt-2 border-t border-gray-100">
                      <QuantitySelector productId={product._id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}