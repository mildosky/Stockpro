import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { Product, Sale, SaleItem, StockMovement, BusinessType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface POSPageProps {
  products: Product[];
  sales: Sale[];
  businessType: BusinessType;
  onAddSale: (sale: Sale) => void;
  onUpdateProducts: (products: Product[]) => void;
  onAddMovement: (movement: StockMovement) => void;
  stockMovements: StockMovement[];
}

export default function POSPage({ products, sales, businessType, onAddSale, onUpdateProducts, onAddMovement, stockMovements }: POSPageProps) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory && p.businessType === businessType && p.active;
    });
  }, [products, search, selectedCategory, businessType]);

  const categories = useMemo(() => {
    const cats = new Set(products.filter(p => p.businessType === businessType).map(p => p.categoryId));
    return Array.from(cats);
  }, [products, businessType]);

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartCost = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.costPrice * item.quantity : 0);
  }, 0);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellingPrice,
        total: product.sellingPrice,
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.unitPrice };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const checkout = (paymentMethod: 'cash' | 'card' | 'mobile') => {
    if (cart.length === 0) return;

    const receiptNumber = `RCP-${String(Date.now()).slice(-6)}`;
    const now = new Date().toISOString();

    const sale: Sale = {
      id: uuidv4(),
      items: cart,
      total: parseFloat(cartTotal.toFixed(2)),
      cost: parseFloat(cartCost.toFixed(2)),
      profit: parseFloat((cartTotal - cartCost).toFixed(2)),
      paymentMethod,
      date: now,
      receiptNumber,
    };

    onAddSale(sale);

    // Update stock for non-restaurant items
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.productId === p.id);
      if (cartItem && p.businessType !== 'restaurant') {
        const newStock = Math.max(0, p.currentStock - cartItem.quantity);
        return { ...p, currentStock: newStock, updatedAt: now };
      }
      return p;
    });
    onUpdateProducts(updatedProducts);

    // Record stock movements for non-restaurant items
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.businessType !== 'restaurant') {
        const movement: StockMovement = {
          id: uuidv4(),
          productId: item.productId,
          type: 'sale',
          quantity: item.quantity,
          date: now,
          reference: receiptNumber,
          notes: `Sold ${item.quantity} x ${item.productName}`,
        };
        onAddMovement(movement);
      }
    });

    setLastReceipt(sale);
    setShowSuccess(true);
    setCart([]);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const todaySales = sales.filter(s => format(new Date(s.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-4 h-full">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
          <CheckCircle size={20} />
          <div>
            <p className="font-semibold">Sale Complete!</p>
            <p className="text-sm opacity-90">Receipt: {lastReceipt?.receiptNumber}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-800">Point of Sale</h1>
            <div className="text-sm text-slate-500">
              Today: <span className="font-semibold text-indigo-600">${todayRevenue.toFixed(2)}</span> ({todaySales.length} sales)
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search products or scan barcode..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white" />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            <button onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              All
            </button>
            {categories.map(catId => {
              const cat = products.find(p => p.categoryId === catId);
              if (!cat) return null;
              return (
                <button key={catId} onClick={() => setSelectedCategory(catId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === catId ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 content-start">
            {filteredProducts.map(product => {
              const inCart = cart.find(item => item.productId === product.id);
              const isLow = product.currentStock <= product.minStock && product.businessType !== 'restaurant';
              return (
                <button key={product.id} onClick={() => addToCart(product)}
                  className={`p-3 rounded-xl border text-left transition-all hover:shadow-md ${inCart ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200'} ${isLow ? 'opacity-60' : ''}`}>
                  <div className="text-lg mb-1">{product.unit === 'plate' || product.unit === 'slice' || product.unit === 'glass' ? '🍽️' : '📦'}</div>
                  <p className="font-medium text-xs text-slate-700 truncate">{product.name}</p>
                  <p className="text-sm font-bold text-indigo-600">${product.sellingPrice.toFixed(2)}</p>
                  {inCart && <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-500 text-white text-[10px] rounded-full">×{inCart.quantity}</span>}
                  {isLow && <p className="text-[10px] text-red-500 mt-0.5">Low stock!</p>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-indigo-600" />
              <h2 className="font-bold text-slate-700">Cart</h2>
              <span className="ml-auto bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{cart.length} items</span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px]">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.productName}</p>
                    <p className="text-xs text-slate-400">${item.unitPrice.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.productId, -1)} className="w-6 h-6 flex items-center justify-center bg-white border rounded text-slate-500 hover:bg-slate-100">
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, 1)} className="w-6 h-6 flex items-center justify-center bg-white border rounded text-slate-500 hover:bg-slate-100">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 w-14 text-right">${item.total.toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.productId)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary */}
          <div className="border-t border-slate-200 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cost</span>
              <span className="text-slate-400">${cartCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Profit</span>
              <span className="text-green-600 font-medium">${(cartTotal - cartCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span className="text-slate-700">Total</span>
              <span className="text-indigo-600">${cartTotal.toFixed(2)}</span>
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => checkout('cash')} disabled={cart.length === 0}
                className="flex flex-col items-center gap-1 p-3 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors">
                <Banknote size={18} />
                <span className="text-xs font-medium">Cash</span>
              </button>
              <button onClick={() => checkout('card')} disabled={cart.length === 0}
                className="flex flex-col items-center gap-1 p-3 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
                <CreditCard size={18} />
                <span className="text-xs font-medium">Card</span>
              </button>
              <button onClick={() => checkout('mobile')} disabled={cart.length === 0}
                className="flex flex-col items-center gap-1 p-3 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors">
                <Smartphone size={18} />
                <span className="text-xs font-medium">Mobile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
