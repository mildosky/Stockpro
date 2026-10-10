import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductsPage from './components/ProductsPage';
import InventoryPage from './components/InventoryPage';
import POSPage from './components/POSPage';
import StickersPage from './components/StickersPage';
import ReportsPage from './components/ReportsPage';
import { Product, Category, Sale, StockMovement, PriceHistory, BusinessType } from './types';
import {
  getCategories, saveCategories,
  getProducts, saveProducts,
  getSales, saveSales,
  getStockMovements, saveStockMovements,
  getPriceHistory, savePriceHistory,
  getBusinessType, setBusinessType,
} from './utils/storage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [businessType, setBusinessTypeState] = useState<BusinessType>(getBusinessType());
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [sales, setSales] = useState<Sale[]>(getSales());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(getStockMovements());
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>(getPriceHistory());

  // Persist changes
  useEffect(() => { saveCategories(categories); }, [categories]);
  useEffect(() => { saveProducts(products); }, [products]);
  useEffect(() => { saveSales(sales); }, [sales]);
  useEffect(() => { saveStockMovements(stockMovements); }, [stockMovements]);
  useEffect(() => { savePriceHistory(priceHistory); }, [priceHistory]);

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
    </div>
  );
}
