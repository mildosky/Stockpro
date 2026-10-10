import { Category, Product, PriceHistory, StockMovement, Sale, BusinessType } from '../types';

const KEYS = {
  categories: 'biz_categories',
  products: 'biz_products',
  priceHistory: 'biz_price_history',
  stockMovements: 'biz_stock_movements',
  sales: 'biz_sales',
  businessType: 'biz_type',
};

export function getBusinessType(): BusinessType {
  return (localStorage.getItem(KEYS.businessType) as BusinessType) || 'supermarket';
}

export function setBusinessType(type: BusinessType) {
  localStorage.setItem(KEYS.businessType, type);
}

// Categories
export function getCategories(): Category[] {
  const data = localStorage.getItem(KEYS.categories);
  return data ? JSON.parse(data) : getDefaultCategories();
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(KEYS.categories, JSON.stringify(categories));
}

// Products
export function getProducts(): Product[] {
  const data = localStorage.getItem(KEYS.products);
  return data ? JSON.parse(data) : getDefaultProducts();
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(KEYS.products, JSON.stringify(products));
}

// Price History
export function getPriceHistory(): PriceHistory[] {
  const data = localStorage.getItem(KEYS.priceHistory);
  return data ? JSON.parse(data) : [];
}

export function savePriceHistory(history: PriceHistory[]) {
  localStorage.setItem(KEYS.priceHistory, JSON.stringify(history));
}

// Stock Movements
export function getStockMovements(): StockMovement[] {
  const data = localStorage.getItem(KEYS.stockMovements);
  return data ? JSON.parse(data) : [];
}

export function saveStockMovements(movements: StockMovement[]) {
  localStorage.setItem(KEYS.stockMovements, JSON.stringify(movements));
}

// Sales
export function getSales(): Sale[] {
  const data = localStorage.getItem(KEYS.sales);
  return data ? JSON.parse(data) : getDefaultSales();
}

export function saveSales(sales: Sale[]) {
  localStorage.setItem(KEYS.sales, JSON.stringify(sales));
}

function getDefaultCategories(): Category[] {
  return [
    { id: 'cat-1', name: 'Beverages', businessType: 'supermarket', color: '#3B82F6', icon: '🥤' },
    { id: 'cat-2', name: 'Snacks', businessType: 'supermarket', color: '#F59E0B', icon: '🍿' },
    { id: 'cat-3', name: 'Dairy', businessType: 'supermarket', color: '#10B981', icon: '🧀' },
    { id: 'cat-4', name: 'Grains & Cereals', businessType: 'supermarket', color: '#8B5CF6', icon: '🌾' },
    { id: 'cat-5', name: 'Fresh Produce', businessType: 'supermarket', color: '#22C55E', icon: '🥬' },
    { id: 'cat-6', name: 'Main Dishes', businessType: 'restaurant', color: '#EF4444', icon: '🍛' },
    { id: 'cat-7', name: 'Appetizers', businessType: 'restaurant', color: '#F97316', icon: '🥗' },
    { id: 'cat-8', name: 'Desserts', businessType: 'restaurant', color: '#EC4899', icon: '🍰' },
    { id: 'cat-9', name: 'Drinks', businessType: 'restaurant', color: '#06B6D4', icon: '🍹' },
    { id: 'cat-10', name: 'Household', businessType: 'supermarket', color: '#64748B', icon: '🧹' },
  ];
}

function getDefaultProducts(): Product[] {
  const now = new Date().toISOString();
  return [
    { id: 'p-1', name: 'Coca Cola 500ml', categoryId: 'cat-1', sku: 'BEV-001', barcode: '5901234123457', costPrice: 0.80, sellingPrice: 1.50, currentStock: 120, minStock: 20, unit: 'bottle', description: 'Carbonated soft drink', businessType: 'supermarket', createdAt: now, updatedAt: now, active: true },
    { id: 'p-2', name: 'Potato Chips Large', categoryId: 'cat-2', sku: 'SNK-001', barcode: '5901234123464', costPrice: 1.20, sellingPrice: 2.50, currentStock: 45, minStock: 10, unit: 'pack', description: 'Crispy potato chips', businessType: 'supermarket', createdAt: now, updatedAt: now, active: true },
    { id: 'p-3', name: 'Fresh Milk 1L', categoryId: 'cat-3', sku: 'DRY-001', barcode: '5901234123471', costPrice: 1.50, sellingPrice: 2.80, currentStock: 30, minStock: 15, unit: 'liter', description: 'Full cream fresh milk', businessType: 'supermarket', createdAt: now, updatedAt: now, active: true },
    { id: 'p-4', name: 'Basmati Rice 5kg', categoryId: 'cat-4', sku: 'GRN-001', barcode: '5901234123488', costPrice: 5.00, sellingPrice: 8.50, currentStock: 8, minStock: 10, unit: 'bag', description: 'Premium basmati rice', businessType: 'supermarket', createdAt: now, updatedAt: now, active: true },
    { id: 'p-5', name: 'Tomatoes 1kg', categoryId: 'cat-5', sku: 'FRP-001', barcode: '5901234123495', costPrice: 1.00, sellingPrice: 2.00, currentStock: 25, minStock: 10, unit: 'kg', description: 'Fresh ripe tomatoes', businessType: 'supermarket', createdAt: now, updatedAt: now, active: true },
    { id: 'p-6', name: 'Grilled Chicken Plate', categoryId: 'cat-6', sku: 'MNU-001', barcode: 'REST-001', costPrice: 4.50, sellingPrice: 12.00, currentStock: 999, minStock: 5, unit: 'plate', description: 'Grilled chicken with rice and salad', businessType: 'restaurant', createdAt: now, updatedAt: now, active: true },
    { id: 'p-7', name: 'Caesar Salad', categoryId: 'cat-7', sku: 'MNU-002', barcode: 'REST-002', costPrice: 2.50, sellingPrice: 8.00, currentStock: 999, minStock: 5, unit: 'plate', description: 'Fresh caesar salad with croutons', businessType: 'restaurant', createdAt: now, updatedAt: now, active: true },
    { id: 'p-8', name: 'Chocolate Cake Slice', categoryId: 'cat-8', sku: 'MNU-003', barcode: 'REST-003', costPrice: 1.80, sellingPrice: 5.50, currentStock: 999, minStock: 5, unit: 'slice', description: 'Rich chocolate cake', businessType: 'restaurant', createdAt: now, updatedAt: now, active: true },
    { id: 'p-9', name: 'Fresh Orange Juice', categoryId: 'cat-9', sku: 'MNU-004', barcode: 'REST-004', costPrice: 1.00, sellingPrice: 3.50, currentStock: 999, minStock: 5, unit: 'glass', description: 'Freshly squeezed orange juice', businessType: 'restaurant', createdAt: now, updatedAt: now, active: true },
    { id: 'p-10', name: 'Dish Soap 750ml', categoryId: 'cat-10', sku: 'HH-001', barcode: '5901234123501', costPrice: 1.50, sellingPrice: 3.00, currentStock: 35, minStock: 10, unit: 'bottle', description: 'Lemon scented dish soap', businessType: 'supermarket', createdAt: now, updatedAt: now, active: true },
  ];
}

function getDefaultSales(): Sale[] {
  const now = new Date();
  const sales: Sale[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const numSales = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < numSales; j++) {
      const items = [];
      const numItems = Math.floor(Math.random() * 4) + 1;
      let total = 0;
      let cost = 0;
      
      for (let k = 0; k < numItems; k++) {
        const qty = Math.floor(Math.random() * 3) + 1;
        const price = (Math.random() * 10 + 1).toFixed(2);
        const costP = (parseFloat(price) * 0.5).toFixed(2);
        const itemTotal = parseFloat((qty * parseFloat(price)).toFixed(2));
        const itemCost = parseFloat((qty * parseFloat(costP)).toFixed(2));
        
        items.push({
          productId: `p-${k + 1}`,
          productName: ['Coca Cola', 'Chips', 'Milk', 'Rice', 'Tomatoes'][k],
          quantity: qty,
          unitPrice: parseFloat(price),
          total: itemTotal,
        });
        
        total += itemTotal;
        cost += itemCost;
      }
      
      sales.push({
        id: `sale-${i}-${j}`,
        items,
        total: parseFloat(total.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
        profit: parseFloat((total - cost).toFixed(2)),
        paymentMethod: ['cash', 'card', 'mobile'][Math.floor(Math.random() * 3)] as 'cash' | 'card' | 'mobile',
        date: date.toISOString(),
        receiptNumber: `RCP-${String(1000 + i * 10 + j).padStart(6, '0')}`,
      });
    }
  }
  
  return sales;
}
