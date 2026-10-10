import { useState, useRef } from 'react';
import { Printer, Tag, Search, Download } from 'lucide-react';
import { Product, Category, BusinessType } from '../types';

interface StickersPageProps {
  products: Product[];
  categories: Category[];
  businessType: BusinessType;
}

export default function StickersPage({ products, categories, businessType }: StickersPageProps) {
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [stickerStyle, setStickerStyle] = useState<'standard' | 'compact' | 'detailed'>('standard');
  const printRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    return matchesSearch && p.businessType === businessType;
  });

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : '';
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Price Stickers</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 10mm; }
            .stickers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
            .sticker { border: 1px dashed #ccc; padding: 4mm; border-radius: 4px; text-align: center; page-break-inside: avoid; }
            .sticker-name { font-weight: bold; font-size: 11px; margin-bottom: 2mm; }
            .sticker-price { font-size: 18px; font-weight: bold; color: #4338ca; margin: 2mm 0; }
            .sticker-info { font-size: 9px; color: #666; }
            .sticker-barcode { font-family: monospace; font-size: 8px; margin-top: 2mm; letter-spacing: 2px; }
            .sticker-sku { font-size: 8px; color: #888; margin-top: 1mm; }
            @media print { body { padding: 5mm; } }
          </style>
        </head>
        <body>
          <div class="stickers-grid">
            ${printContent.innerHTML}
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const selectedItems = products.filter(p => selectedProducts.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Price Stickers & Labels</h1>
          <p className="text-slate-500">Generate printable price tags and barcode stickers</p>
        </div>
        <button onClick={handlePrint} disabled={selectedProducts.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <Printer size={18} /> Print Stickers ({selectedProducts.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Select Products</h3>
            <button onClick={selectAll} className="text-xs text-indigo-600 hover:underline">
              {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredProducts.map(product => (
              <label key={product.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedProducts.includes(product.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleProduct(product.id)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{product.name}</p>
                  <p className="text-xs text-slate-400">{getCategoryName(product.categoryId)}</p>
                </div>
                <span className="text-sm font-bold text-indigo-600">${product.sellingPrice.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sticker Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Sticker Preview</h3>
            <div className="flex gap-2">
              {(['standard', 'compact', 'detailed'] as const).map(style => (
                <button key={style} onClick={() => setStickerStyle(style)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${stickerStyle === style ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {selectedItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Tag size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select products from the left to preview stickers</p>
            </div>
          ) : (
            <div ref={printRef} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {selectedItems.map(product => (
                <div key={product.id} className={`border-2 border-dashed border-slate-200 rounded-xl p-4 text-center ${stickerStyle === 'compact' ? 'py-2 px-3' : ''}`}>
                  {stickerStyle === 'standard' && (
                    <>
                      <p className="font-bold text-sm text-slate-700 mb-1">{product.name}</p>
                      <p className="text-xs text-slate-400 mb-2">{getCategoryName(product.categoryId)}</p>
                      <p className="text-2xl font-bold text-indigo-600 my-2">${product.sellingPrice.toFixed(2)}</p>
                      <div className="mt-2 border-t pt-2">
                        <p className="font-mono text-[10px] tracking-[3px] text-slate-600">||||| |||| |||||</p>
                        <p className="text-[9px] text-slate-400 mt-1">{product.barcode || product.sku}</p>
                      </div>
                    </>
                  )}
                  {stickerStyle === 'compact' && (
                    <>
                      <p className="font-bold text-xs text-slate-700 truncate">{product.name}</p>
                      <p className="text-lg font-bold text-indigo-600">${product.sellingPrice.toFixed(2)}</p>
                      <p className="text-[8px] text-slate-400 font-mono">{product.barcode || product.sku}</p>
                    </>
                  )}
                  {stickerStyle === 'detailed' && (
                    <>
                      <p className="font-bold text-sm text-slate-700 mb-1">{product.name}</p>
                      <p className="text-xs text-slate-400 mb-1">{getCategoryName(product.categoryId)}</p>
                      <p className="text-xs text-slate-500 mb-2">{product.description}</p>
                      <p className="text-2xl font-bold text-indigo-600 my-2">${product.sellingPrice.toFixed(2)}</p>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <p>SKU: {product.sku}</p>
                        <p>Unit: per {product.unit}</p>
                        <p>Cost: ${product.costPrice.toFixed(2)}</p>
                      </div>
                      <div className="mt-2 border-t pt-2">
                        <p className="font-mono text-[10px] tracking-[3px] text-slate-600">||||| |||| ||||| |||</p>
                        <p className="text-[9px] text-slate-400 mt-1">{product.barcode}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
