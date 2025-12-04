"use client";

import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImportProps {
  onImportComplete: () => void;
  onClose: () => void;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
}

export default function ProductImport({ onImportComplete, onClose }: ProductImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate sample Excel file
  const downloadSampleFile = () => {
    // Sample data structure
    const sampleData = [
      {
        'Product Name*': 'Sample Product 1',
        'Category*': 'Electronics',
        'Cost Price*': 100,
        'Selling Price*': 150,
        'Stock Quantity*': 50,
        'Discount (%)': 10,
        'Size': 'Medium',
        'Description': 'Sample product description',
        'Barcode': '1234567890123',
        'Supplier ID': '',
        'Is Dry Food (TRUE/FALSE)': 'FALSE',
        'Min Stock Level': 5
      },
      {
        'Product Name*': 'Sample Product 2',
        'Category*': 'Food',
        'Cost Price*': 50,
        'Selling Price*': 75,
        'Stock Quantity*': 100,
        'Discount (%)': 5,
        'Size': 'Large',
        'Description': 'Another sample product',
        'Barcode': '9876543210987',
        'Supplier ID': '',
        'Is Dry Food (TRUE/FALSE)': 'TRUE',
        'Min Stock Level': 10
      }
    ];

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Product Name
      { wch: 15 }, // Category
      { wch: 12 }, // Cost Price
      { wch: 12 }, // Selling Price
      { wch: 15 }, // Stock Quantity
      { wch: 12 }, // Discount
      { wch: 10 }, // Size
      { wch: 30 }, // Description
      { wch: 15 }, // Barcode
      { wch: 15 }, // Supplier ID
      { wch: 20 }, // Is Dry Food
      { wch: 15 }, // Min Stock Level
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Add instructions sheet
    const instructions = [
      ['Product Import Instructions'],
      [''],
      ['Required Fields (marked with *):'],
      ['1. Product Name - The name of the product'],
      ['2. Category - Product category (must match existing categories)'],
      ['3. Cost Price - Purchase/cost price of the product'],
      ['4. Selling Price - Retail selling price'],
      ['5. Stock Quantity - Initial stock quantity'],
      [''],
      ['Optional Fields:'],
      ['1. Discount (%) - Discount percentage (0-100)'],
      ['2. Size - Product size (e.g., Small, Medium, Large)'],
      ['3. Description - Product description'],
      ['4. Barcode - Product barcode (leave empty for auto-generation)'],
      ['5. Supplier ID - Supplier ID from your suppliers list'],
      ['6. Is Dry Food - TRUE or FALSE'],
      ['7. Min Stock Level - Minimum stock level for alerts'],
      [''],
      ['Important Notes:'],
      ['1. Do not modify the header row'],
      ['2. All prices must be positive numbers'],
      ['3. Stock quantity must be a whole number'],
      ['4. Discount must be between 0 and 100'],
      ['5. Category must match existing categories in your system'],
      ['6. Barcode must be unique (if provided)'],
      ['7. Leave Supplier ID empty if not applicable'],
      ['8. Maximum 1000 products per import'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Download file
    XLSX.writeFile(wb, 'Product_Import_Template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls'].includes(fileType || '')) {
        setError('Please upload an Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const validateRow = (row: any, rowNumber: number): ImportError[] => {
    const errors: ImportError[] = [];

    // Required fields validation
    if (!row['Product Name*'] || row['Product Name*'].toString().trim() === '') {
      errors.push({ row: rowNumber, field: 'Product Name', message: 'Product name is required' });
    }

    if (!row['Category*'] || row['Category*'].toString().trim() === '') {
      errors.push({ row: rowNumber, field: 'Category', message: 'Category is required' });
    }

    if (!row['Cost Price*'] || isNaN(parseFloat(row['Cost Price*'])) || parseFloat(row['Cost Price*']) < 0) {
      errors.push({ row: rowNumber, field: 'Cost Price', message: 'Valid cost price is required' });
    }

    if (!row['Selling Price*'] || isNaN(parseFloat(row['Selling Price*'])) || parseFloat(row['Selling Price*']) < 0) {
      errors.push({ row: rowNumber, field: 'Selling Price', message: 'Valid selling price is required' });
    }

    if (row['Stock Quantity*'] === undefined || isNaN(parseInt(row['Stock Quantity*'])) || parseInt(row['Stock Quantity*']) < 0) {
      errors.push({ row: rowNumber, field: 'Stock Quantity', message: 'Valid stock quantity is required' });
    }

    // Optional fields validation
    if (row['Discount (%)'] && (isNaN(parseFloat(row['Discount (%)'])) || parseFloat(row['Discount (%)']) < 0 || parseFloat(row['Discount (%)']) > 100)) {
      errors.push({ row: rowNumber, field: 'Discount', message: 'Discount must be between 0 and 100' });
    }

    if (row['Min Stock Level'] && (isNaN(parseInt(row['Min Stock Level'])) || parseInt(row['Min Stock Level']) < 0)) {
      errors.push({ row: rowNumber, field: 'Min Stock Level', message: 'Min stock level must be a positive number' });
    }

    return errors;
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError('');
    setResult(null);

    try {
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('The Excel file is empty');
      }

      if (jsonData.length > 1000) {
        throw new Error('Maximum 1000 products can be imported at once');
      }

      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      // Validate all rows first
      const allErrors: ImportError[] = [];
      jsonData.forEach((row, index) => {
        const rowErrors = validateRow(row, index + 2); // +2 because Excel starts at 1 and header is row 1
        allErrors.push(...rowErrors);
      });

      if (allErrors.length > 0) {
        setResult({
          success: 0,
          failed: allErrors.length,
          errors: allErrors.slice(0, 50) // Show only first 50 errors
        });
        setImporting(false);
        return;
      }

      // Process each row
      let successCount = 0;
      let failedCount = 0;
      const errors: ImportError[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        const rowNumber = i + 2;

        try {
          // Prepare product data
          const productData = new FormData();
          
          productData.append('name', row['Product Name*'].toString().trim());
          productData.append('category', row['Category*'].toString().trim());
          productData.append('costPrice', parseFloat(row['Cost Price*']).toString());
          productData.append('sellingPrice', parseFloat(row['Selling Price*']).toString());
          productData.append('stock', parseInt(row['Stock Quantity*']).toString());
          
          // Optional fields
          if (row['Discount (%)']) {
            productData.append('discount', parseFloat(row['Discount (%)']).toString());
          } else {
            productData.append('discount', '0');
          }

          if (row['Size']) {
            productData.append('size', row['Size'].toString().trim());
          }

          if (row['Description']) {
            productData.append('description', row['Description'].toString().trim());
          }

          if (row['Barcode'] && row['Barcode'].toString().trim() !== '') {
            productData.append('barcode', row['Barcode'].toString().trim());
          }

          if (row['Supplier ID'] && row['Supplier ID'].toString().trim() !== '') {
            productData.append('supplier', row['Supplier ID'].toString().trim());
          }

          const isDryFood = row['Is Dry Food (TRUE/FALSE)']?.toString().toUpperCase() === 'TRUE';
          productData.append('dryfood', isDryFood.toString());

          if (row['Min Stock Level']) {
            productData.append('minStock', parseInt(row['Min Stock Level']).toString());
          }

          // Add user information for stock transition tracking
          if (user) {
            productData.append('userId', user._id || 'system');
            productData.append('userName', user.username || user.name || 'System');
          }

          // Send to API
          const response = await fetch('/api/products', {
            method: 'POST',
            body: productData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create product');
          }

          successCount++;
        } catch (err) {
          failedCount++;
          errors.push({
            row: rowNumber,
            field: 'General',
            message: err instanceof Error ? err.message : 'Unknown error'
          });
        }
      }

      setResult({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 50) // Show only first 50 errors
      });

      if (successCount > 0) {
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import products');
    } finally {
      setImporting(false);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import Products from Excel</h2>
            <p className="text-gray-600 mt-1">Upload an Excel file to import multiple products at once</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download Sample File */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Step 1: Download Sample Template</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Download the sample Excel template to see the required format and instructions.
                </p>
                <button
                  onClick={downloadSampleFile}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sample Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Step 2: Upload Your Excel File</h3>
              <p className="text-gray-600 text-sm mb-4">
                {file ? file.name : 'Select an Excel file (.xlsx or .xls) to import'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {file ? 'Change File' : 'Select File'}
              </button>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 5MB | Maximum products: 1000</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Import Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Successfully Imported</p>
                        <p className="text-2xl font-bold text-green-600">{result.success}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-600">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                {result.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-3">Import Errors:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {result.errors.map((error, index) => (
                        <div key={index} className="bg-white rounded p-3 text-sm">
                          <p className="font-medium text-red-900">
                            Row {error.row}: {error.field}
                          </p>
                          <p className="text-red-600">{error.message}</p>
                        </div>
                      ))}
                      {result.failed > 50 && (
                        <p className="text-red-600 text-sm italic">
                          ... and {result.failed - 50} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {result && result.success > 0 ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-2"
            >
              {importing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Import Products</span>
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Important Tips:
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Make sure your categories exist in the system before importing</li>
              <li>Barcode must be unique for each product</li>
              <li>All required fields (marked with *) must be filled</li>
              <li>Prices and stock quantities must be valid numbers</li>
              <li>The import process may take a few minutes for large files</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}