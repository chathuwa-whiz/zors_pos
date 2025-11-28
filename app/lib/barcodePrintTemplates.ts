import { Product } from '@/app/types/pos';

export const generateSingleBarcodeHTML = (product: Product, quantity: number = 1): string => {
  // Create array of barcodes based on quantity
  const barcodes = Array(quantity).fill(null);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcode - ${product.name} (x${quantity})</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 10mm;
            background: white;
          }
          .barcode-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
          }
          .barcode-item {
            border: 1px solid #000;
            padding: 3mm;
            text-align: center;
            page-break-inside: avoid;
            background: white;
            min-height: 42mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .product-name {
            font-size: 9pt;
            font-weight: bold;
            line-height: 1.2;
            min-height: 8mm;
            max-height: 12mm;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-word;
          }
          .barcode-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2mm 0;
          }
          .barcode-svg {
            width: 100%;
            height: 12mm;
          }
          .barcode-display {
            font-family: 'Courier New', monospace;
            font-size: 8pt;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 1mm 0;
          }
          .price {
            font-size: 9pt;
            font-weight: bold;
            color: #000;
          }
          .category {
            font-size: 7pt;
            color: #666;
            text-transform: uppercase;
            margin-top: 1mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding: 5mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="barcode-grid">
          ${barcodes.map((_, index) => `
            <div class="barcode-item">
              <div class="product-name">${product.name}</div>
              <div class="barcode-container">
                <svg class="barcode-svg" id="barcode-${index}"></svg>
              </div>
              <div class="barcode-display">${product.barcode}</div>
              <div class="price">Rs. ${product.sellingPrice.toFixed(2)}</div>
              <div class="category">${product.category}</div>
            </div>
          `).join('')}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
        <script>
          let printAttempted = false;
          
          function initBarcodes() {
            if (typeof JsBarcode === 'undefined') {
              setTimeout(initBarcodes, 100);
              return;
            }
            
            try {
              ${barcodes.map((_, index) => `
                JsBarcode("#barcode-${index}", "${product.barcode}", {
                  format: "CODE128",
                  width: 2,
                  height: 45,
                  displayValue: false,
                  margin: 0
                });
              `).join('')}
              
              if (!printAttempted) {
                printAttempted = true;
                setTimeout(function() {
                  window.print();
                }, 400);
              }
            } catch (e) {
              console.error('Barcode generation error:', e);
            }
          }
          
          // Close window after print (whether printed or cancelled)
          window.onafterprint = function() {
            window.close();
          };
          
          // Also handle if user closes print dialog via escape or cancel
          window.addEventListener('focus', function() {
            setTimeout(function() {
              if (printAttempted) {
                window.close();
              }
            }, 500);
          });
          
          if (document.readyState === 'complete') {
            initBarcodes();
          } else {
            window.addEventListener('load', initBarcodes);
          }
        <\/script>
      </body>
    </html>
  `;
};

export const generateMultipleBarcodeHTML = (products: { product: Product; quantity: number }[]): string => {
  // Flatten the products array based on quantity
  const allBarcodes: { product: Product; index: number }[] = [];
  let globalIndex = 0;
  
  products.forEach(({ product, quantity }) => {
    for (let i = 0; i < quantity; i++) {
      allBarcodes.push({ product, index: globalIndex++ });
    }
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Product Barcodes (${allBarcodes.length} labels)</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 10mm;
            background: white;
          }
          h2 {
            text-align: center;
            margin-bottom: 5mm;
            font-size: 14pt;
          }
          .barcode-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5mm;
          }
          .barcode-item {
            border: 1px solid #000;
            padding: 3mm;
            text-align: center;
            page-break-inside: avoid;
            background: white;
            min-height: 42mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .product-name {
            font-size: 9pt;
            font-weight: bold;
            line-height: 1.2;
            min-height: 8mm;
            max-height: 12mm;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            word-break: break-word;
          }
          .barcode-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2mm 0;
          }
          .barcode-svg {
            width: 100%;
            height: 12mm;
          }
          .barcode-display {
            font-family: 'Courier New', monospace;
            font-size: 8pt;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 1mm 0;
          }
          .price {
            font-size: 9pt;
            font-weight: bold;
            color: #000;
          }
          .category {
            font-size: 7pt;
            color: #666;
            text-transform: uppercase;
            margin-top: 1mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              padding: 5mm;
            }
            h2 {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h2>Product Barcodes (${allBarcodes.length} labels)</h2>
        <div class="barcode-grid">
          ${allBarcodes.map(({ product, index }) => `
            <div class="barcode-item">
              <div class="product-name">${product.name}</div>
              <div class="barcode-container">
                <svg class="barcode-svg" id="barcode-${index}"></svg>
              </div>
              <div class="barcode-display">${product.barcode}</div>
              <div class="price">Rs. ${product.sellingPrice.toFixed(2)}</div>
              <div class="category">${product.category}</div>
            </div>
          `).join('')}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
        <script>
          let printAttempted = false;
          
          function initBarcodes() {
            if (typeof JsBarcode === 'undefined') {
              setTimeout(initBarcodes, 100);
              return;
            }
            
            try {
              ${allBarcodes.map(({ product, index }) => `
                JsBarcode("#barcode-${index}", "${product.barcode}", {
                  format: "CODE128",
                  width: 2,
                  height: 45,
                  displayValue: false,
                  margin: 0
                });
              `).join('')}
              
              if (!printAttempted) {
                printAttempted = true;
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            } catch (e) {
              console.error('Barcode generation error:', e);
            }
          }
          
          // Close window after print (whether printed or cancelled)
          window.onafterprint = function() {
            window.close();
          };
          
          // Also handle if user closes print dialog via escape or cancel
          window.addEventListener('focus', function() {
            setTimeout(function() {
              if (printAttempted) {
                window.close();
              }
            }, 500);
          });
          
          if (document.readyState === 'complete') {
            initBarcodes();
          } else {
            window.addEventListener('load', initBarcodes);
          }
        <\/script>
      </body>
    </html>
  `;
};

export const printBarcode = (product: Product, quantity: number = 1): void => {
  if (!product.barcode) {
    alert('This product does not have a barcode');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print barcodes');
    return;
  }

  const printContent = generateSingleBarcodeHTML(product, quantity);
  printWindow.document.write(printContent);
  printWindow.document.close();
};

export const printMultipleBarcodes = (products: { product: Product; quantity: number }[]): void => {
  const productsWithBarcodes = products.filter(p => p.product.barcode);
  
  if (productsWithBarcodes.length === 0) {
    alert('No products with barcodes selected');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print barcodes');
    return;
  }

  const printContent = generateMultipleBarcodeHTML(productsWithBarcodes);
  printWindow.document.write(printContent);
  printWindow.document.close();
};

// Legacy function for backward compatibility
export const printMultipleBarcodesLegacy = (products: Product[]): void => {
  const productsWithQuantity = products.map(product => ({ product, quantity: 1 }));
  printMultipleBarcodes(productsWithQuantity);
};