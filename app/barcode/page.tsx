"use client";

import { useState, useEffect } from 'react';
import { Search, Printer, Package } from 'lucide-react';
import { Product } from '@/app/types/pos';
import { useBarcode } from 'next-barcode';

export default function BarcodePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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
    
    // Clear selections for products that are no longer visible
    setSelectedProducts(prev => prev.filter(id => filtered.some(p => p._id === id)));
  }, [products, searchQuery]);

  const handleSelectProduct = (productId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling if it's from a checkbox click
    if (event) {
      event.stopPropagation();
    }
    
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const handleCardClick = (productId: string, event: React.MouseEvent) => {
    // Prevent selection if clicking on checkbox directly
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input[type="checkbox"]')) {
      return;
    }
    
    handleSelectProduct(productId);
  };

  const handleCheckboxChange = (productId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setSelectedProducts(prev => {
      if (event.target.checked) {
        return prev.includes(productId) ? prev : [...prev, productId];
      } else {
        return prev.filter(id => id !== productId);
      }
    });
  };

  const handlePrintBarcodes = () => {
    const selectedProductsData = products.filter(p => selectedProducts.includes(p._id));
    
    if (selectedProductsData.length === 0) {
      alert('Please select at least one product to print barcodes');
      return;
    }

    // Create print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintContent(selectedProductsData);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const generatePrintContent = (products: Product[]) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Product Barcodes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .barcode-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-top: 20px;
            }
            .barcode-item {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: center;
              page-break-inside: avoid;
              background: white;
            }
            .product-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 5px;
              height: 30px;
              overflow: hidden;
            }
            .barcode-display {
              font-family: 'Courier New', monospace;
              font-size: 14px;
              font-weight: bold;
              margin: 8px 0;
              letter-spacing: 2px;
            }
            .barcode-svg {
              width: 100%;
              height: 40px;
              margin: 5px 0;
            }
            .price {
              font-size: 11px;
              color: #666;
              margin-top: 5px;
            }
            .category {
              font-size: 10px;
              color: #888;
              text-transform: uppercase;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .barcode-grid { gap: 10px; }
              .barcode-item { 
                border: 1px solid #000;
                margin-bottom: 10px;
              }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        </head>
        <body>
          <h2 style="text-align: center; margin-bottom: 20px;">Product Barcodes</h2>
          <div class="barcode-grid">
            ${products.map((product, index) => `
              <div class="barcode-item">
                <div class="product-name">${product.name}</div>
                <svg class="barcode-svg" id="barcode-${index}"></svg>
                <div class="barcode-display">${product.barcode}</div>
                <div class="price">Rs. ${product.sellingPrice.toFixed(2)}</div>
                <div class="category">${product.category}</div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() {
              ${products.map((product, index) => `
                JsBarcode("#barcode-${index}", "${product.barcode}", {
                  format: "CODE128",
                  width: 2,
                  height: 40,
                  displayValue: false
                });
              `).join('')}
              
              setTimeout(function() {
                window.print();
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;
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
              <p className="text-gray-600">Print barcodes for your products</p>
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
                {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handlePrintBarcodes}
                disabled={selectedProducts.length === 0}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Selected ({selectedProducts.length})</span>
              </button>
            </div>
          </div>

          {filteredProducts.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredProducts.length} products with barcodes
            </div>
          )}
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
              const isSelected = selectedProducts.includes(product._id);
              
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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm flex-1 mr-2">{product.name}</h3>
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleCheckboxChange(product._id, e)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Barcode Preview using next-barcode */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <BarcodePreview value={product.barcode} />
                      <div className="text-xs font-mono text-center mt-1 font-bold">
                        {product.barcode}
                      </div>
                    </div>

                    <div className="space-y-1">
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