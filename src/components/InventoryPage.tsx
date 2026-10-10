import { useState } from 'react';
import { Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Plus, History } from 'lucide-react';
import { Product, StockMovement, Category, PriceHistory, BusinessType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface InventoryPageProps {
  products: Product[];
  stockMovements: StockMovement[];
  priceHistory: PriceHistory[];
  categories: Category[];
  businessType: BusinessType;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateMovements: (movements: StockMovement[]) => void;
  onUpdatePriceHistory: (history: PriceHistory[]) => void;
}

export default function InventoryPage({ products, stockMovements, priceHistory, categories, businessType, onUpdateProducts, onUpdateMovements, onUpdatePriceHistory }: InventoryPageProps) {
  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'prices'>('stock');
  const [showStockModal, setShowStockModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && p.businessType === businessType;
  });

  const handleStockMovement = () => {
    if (!selectedProduct || !quantity) return;
    const qty = parseInt(quantity);
    const now = new Date().toISOString();

    // Update product stock
    let newStock = selectedProduct.currentStock;
    if (movementType === 'in') newStock += qty;
    else if (movementType === 'out') newStock -= qty;
    else newStock = qty; // adjustment sets exact stock

    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id ? { ...p, currentStock: Math.max(0, newStock), updatedAt: now } : p
    );
    onUpdateProducts(updatedProducts);

    // Record movement
    const movement: StockMovement = {
      id: uuidv4(),
      productId: selectedProduct.id,
      type: movementType,
      quantity: qty,
      date: now,
      reference: `MOV-${Date.now()}`,
      notes,
    };
    onUpdateMovements([...stockMovements, movement]);

    setShowStockModal(false);
    setQuantity('');
    setNotes('');
  };

  const handlePriceChange = () => {
    if (!selectedProduct || !newPrice) return;
    const now = new Date().toISOString();
    const price = parseFloat(newPrice);

    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id ? { ...p, sellingPrice: price, updatedAt: now } : p
    );
    onUpdateProducts(updatedProducts);

    const historyEntry: PriceHistory = {
      id: uuidv4(),
      productId: selectedProduct.id,
      oldPrice: selectedProduct.sellingPrice,
      newPrice: price,
      changedAt: now,
      reason: priceReason,
    };
    onUpdatePriceHistory([...priceHistory, historyEntry]);

    setShowPriceModal(false);
    setNewPrice('');
    setPriceReason('');
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : 'Unknown';
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Stock In';
      case 'out': return 'Stock Out';
      case 'adjustment': return 'Adjustment';
      case 'sale': return 'Sale';
      default: return type;
    }
  };

  const getProductName = (id: string) => {
    return products.find(p => p.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Stock & Inventory</h1>
        <p className="text-slate-500">Track stock levels, movements, and price changes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[
          { id: 'stock', label: 'Stock Levels', icon: Package },
          { id: 'movements', label: 'Movements', icon: History },
          { id: 'prices', label: 'Price History', icon: ArrowUpCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Stock Levels Tab */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const isLow = product.currentStock <= product.minStock;
              const stockPercent = Math.min(100, (product.currentStock / (product.minStock * 5)) * 100);
              return (
                <div key={product.id} className={`bg-white rounded-xl shadow-sm border p-4 ${isLow ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-700">{product.name}</h3>
                      <p className="text-xs text-slate-400">{getCategoryName(product.categoryId)} • {product.sku}</p>
                    </div>
                    {isLow && <AlertTriangle size={16} className="text-red-500" />}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Stock: <strong className="text-slate-700">{product.currentStock} {product.unit}</strong></span>
                      <span className="text-slate-400">Min: {product.minStock}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${isLow ? 'bg-red-500' : stockPercent > 60 ? 'bg-green-500' : 'bg-amber-500'}`}
                        style={{ width: `${stockPercent}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                      <span className="font-medium">Value:</span> ${(product.costPrice * product.currentStock).toFixed(2)}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setSelectedProduct(product); setShowStockModal(true); }}
                        className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100">
                        <ArrowUpCircle size={12} className="inline mr-1" /> Stock
                      </button>
                      <button onClick={() => { setSelectedProduct(product); setShowPriceModal(true); }}
                        className="px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-100">
                        $ Price
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Notes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...stockMovements].reverse().slice(0, 50).map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">{format(new Date(mov.date), 'MMM dd, HH:mm')}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{getProductName(mov.productId)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        mov.type === 'in' ? 'bg-green-100 text-green-700' :
                        mov.type === 'out' ? 'bg-red-100 text-red-700' :
                        mov.type === 'sale' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {mov.type === 'in' ? <ArrowUpCircle size={10} className="mr-1" /> : <ArrowDownCircle size={10} className="mr-1" />}
                        {getMovementLabel(mov.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{mov.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{mov.notes || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">{mov.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stockMovements.length === 0 && (
            <div className="text-center py-12">
              <History size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No stock movements recorded</p>
            </div>
          )}
        </div>
      )}

      {/* Price History Tab */}
      {activeTab === 'prices' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Old Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">New Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Change</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...priceHistory].reverse().map(ph => {
                  const change = ((ph.newPrice - ph.oldPrice) / ph.oldPrice * 100).toFixed(1);
                  const isIncrease = ph.newPrice > ph.oldPrice;
                  return (
                    <tr key={ph.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">{format(new Date(ph.changedAt), 'MMM dd, yyyy HH:mm')}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{getProductName(ph.productId)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 text-right">${ph.oldPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">${ph.newPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncrease ? '+' : ''}{change}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{ph.reason || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {priceHistory.length === 0 && (
            <div className="text-center py-12">
              <ArrowUpCircle size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No price changes recorded</p>
            </div>
          )}
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-800">Update Stock: {selectedProduct.name}</h2>
              <p className="text-sm text-slate-500">Current stock: {selectedProduct.currentStock} {selectedProduct.unit}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Movement Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['in', 'out', 'adjustment'] as const).map(type => (
                    <button key={type} onClick={() => setMovementType(type)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${movementType === type ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {type === 'in' ? '⬆️ Stock In' : type === 'out' ? '⬇️ Stock Out' : '🔄 Adjust'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {movementType === 'adjustment' ? 'Set Stock To' : 'Quantity'}
                </label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowStockModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleStockMovement} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* Price Change Modal */}
      {showPriceModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-slate-800">Change Price: {selectedProduct.name}</h2>
              <p className="text-sm text-slate-500">Current price: ${selectedProduct.sellingPrice.toFixed(2)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Selling Price ($)</label>
                <input type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Change</label>
                <input type="text" value={priceReason} onChange={e => setPriceReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Supplier price increase" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowPriceModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handlePriceChange} className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Update Price</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
