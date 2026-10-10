import { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductsPage from './components/ProductsPage';
import InventoryPage from './components/InventoryPage';
import POSPage from './components/POSPage';
import StickersPage from './components/StickersPage';
import ReportsPage from './components/ReportsPage';
import InstallPrompt from './components/InstallPrompt';
import { Product, Category, Sale, StockMovement, PriceHistory, BusinessType } from './types';
import {
  getCategories, saveCategories,
  getProducts, saveProducts,
  getSales, saveSales,
  getStockMovements, saveStockMovements,
  getPriceHistory, savePriceHistory,
  getBusinessType, setBusinessType,
} from './utils/storage';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-500 text-sm mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [businessType, setBusinessTypeState] = useState<BusinessType>(getBusinessType());
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    try {
      setCategories(getCategories());
      setProducts(getProducts());
      setSales(getSales());
      setStockMovements(getStockMovements());
      setPriceHistory(getPriceHistory());
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load data:', err);
      setIsLoaded(true);
    }
  }, []);

  // Persist changes
  useEffect(() => { if (isLoaded) saveCategories(categories); }, [categories, isLoaded]);
  useEffect(() => { if (isLoaded) saveProducts(products); }, [products, isLoaded]);
  useEffect(() => { if (isLoaded) saveSales(sales); }, [sales, isLoaded]);
  useEffect(() => { if (isLoaded) saveStockMovements(stockMovements); }, [stockMovements, isLoaded]);
  useEffect(() => { if (isLoaded) savePriceHistory(priceHistory); }, [priceHistory, isLoaded]);

  const handleBusinessTypeChange = useCallback((type: BusinessType) => {
    setBusinessTypeState(type);
    setBusinessType(type);
  }, []);

  const handleSaveProducts = useCallback((updated: Product[]) => {
    setProducts(updated);
  }, []);

  const handleAddSale = useCallback((sale: Sale) => {
    setSales(prev => [...prev, sale]);
  }, []);

  const handleAddMovement = useCallback((movement: StockMovement) => {
    setStockMovements(prev => [...prev, movement]);
  }, []);

  const handleUpdateMovements = useCallback((movements: StockMovement[]) => {
    setStockMovements(movements);
  }, []);

  const handleUpdatePriceHistory = useCallback((history: PriceHistory[]) => {
    setPriceHistory(history);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading StockPro...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard products={products} sales={sales} categories={categories} stockMovements={stockMovements} />;
      case 'products':
        return <ProductsPage products={products} categories={categories} businessType={businessType} onSave={handleSaveProducts} />;
      case 'inventory':
        return <InventoryPage
          products={products} stockMovements={stockMovements} priceHistory={priceHistory}
          categories={categories} businessType={businessType}
          onUpdateProducts={handleSaveProducts} onUpdateMovements={handleUpdateMovements}
          onUpdatePriceHistory={handleUpdatePriceHistory} />;
      case 'pos':
        return <POSPage products={products} sales={sales} businessType={businessType}
          onAddSale={handleAddSale} onUpdateProducts={handleSaveProducts}
          onAddMovement={handleAddMovement} stockMovements={stockMovements} />;
      case 'stickers':
        return <StickersPage products={products} categories={categories} businessType={businessType} />;
      case 'reports':
        return <ReportsPage sales={sales} products={products} priceHistory={priceHistory}
          stockMovements={stockMovements} businessType={businessType} />;
      default:
        return <Dashboard products={products} sales={sales} categories={categories} stockMovements={stockMovements} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        businessType={businessType}
        onBusinessTypeChange={handleBusinessTypeChange}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 pt-16 lg:pt-6">
          {renderPage()}
        </div>
      </main>
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
