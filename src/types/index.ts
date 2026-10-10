export type BusinessType = 'restaurant' | 'supermarket';

export interface Category {
  id: string;
  name: string;
  businessType: BusinessType;
  color: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  description: string;
  businessType: BusinessType;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface PriceHistory {
  id: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  reason: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'sale';
  quantity: number;
  date: string;
  reference: string;
  notes: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  cost: number;
  profit: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  date: string;
  receiptNumber: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  todayRevenue: number;
  todayProfit: number;
  lowStockItems: number;
  totalStockValue: number;
}
