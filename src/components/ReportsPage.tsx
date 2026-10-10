import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, Filter } from 'lucide-react';
import { Sale, Product, PriceHistory, StockMovement, BusinessType } from '../types';
import { format, subDays, startOfDay, isWithinInterval, parseISO } from 'date-fns';

interface ReportsPageProps {
  sales: Sale[];
  products: Product[];
  priceHistory: PriceHistory[];
  stockMovements: StockMovement[];
  businessType: BusinessType;
}

export default function ReportsPage({ sales, products, priceHistory, stockMovements, businessType }: ReportsPageProps) {
  const [dateRange, setDateRange] = useState<'7' | '14' | '30' | '90'>('30');
  const [activeReport, setActiveReport] = useState<'overview' | 'sales' | 'products' | 'profit' | 'stock'>('overview');

  const filteredSales = useMemo(() => {
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);
    return sales.filter(s => isWithinInterval(new Date(s.date), { start: startDate, end: new Date() }));
  }, [sales, dateRange]);

  // Revenue over time
  const revenueData = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = startOfDay(new Date(date.getTime() + 86400000));
      const daySales = filteredSales.filter(s => {
        const d = new Date(s.date);
        return d >= dayStart && d < dayEnd;
      });
      data.push({
        date: format(date, days <= 14 ? 'MMM dd' : 'dd'),
        revenue: parseFloat(daySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)),
        profit: parseFloat(daySales.reduce((sum, s) => sum + s.profit, 0).toFixed(2)),
        sales: daySales.length,
      });
    }
    return data;
  }, [filteredSales, dateRange]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number; profit: number }>();
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productSales.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0, profit: 0 };
        const product = products.find(p => p.id === item.productId);
        const cost = product ? product.costPrice * item.quantity : 0;
        existing.quantity += item.quantity;
        existing.revenue += item.total;
        existing.profit += item.total - cost;
        productSales.set(item.productId, existing);
      });
    });
    return Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredSales, products]);

  // Payment method breakdown
  const paymentData = useMemo(() => {
    const methods = { cash: 0, card: 0, mobile: 0 };
    filteredSales.forEach(s => { methods[s.paymentMethod] += s.total; });
    return [
      { name: 'Cash', value: parseFloat(methods.cash.toFixed(2)), color: '#10B981' },
      { name: 'Card', value: parseFloat(methods.card.toFixed(2)), color: '#3B82F6' },
      { name: 'Mobile', value: parseFloat(methods.mobile.toFixed(2)), color: '#8B5CF6' },
    ];
  }, [filteredSales]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0);
    const totalCost = filteredSales.reduce((sum, s) => sum + s.cost, 0);
    const avgOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    return { totalRevenue, totalProfit, totalCost, avgOrderValue, profitMargin, totalTransactions: filteredSales.length };
  }, [filteredSales]);

  // Stock movement summary
  const stockSummary = useMemo(() => {
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);
    const relevantMovements = stockMovements.filter(m => isWithinInterval(new Date(m.date), { start: startDate, end: new Date() }));
    const stockIn = relevantMovements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
    const stockOut = relevantMovements.filter(m => m.type === 'out' || m.type === 'sale').reduce((sum, m) => sum + m.quantity, 0);
    const adjustments = relevantMovements.filter(m => m.type === 'adjustment').length;
    return { stockIn, stockOut, adjustments, totalMovements: relevantMovements.length };
  }, [stockMovements, dateRange]);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500">Detailed business performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <select value={dateRange} onChange={e => setDateRange(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'sales', label: 'Sales Report' },
          { id: 'products', label: 'Product Performance' },
          { id: 'profit', label: 'Profit & Loss' },
          { id: 'stock', label: 'Stock Report' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveReport(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeReport === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-xs text-slate-500">Total Revenue</span>
              </div>
              <p className="text-xl font-bold text-slate-800">${summaryStats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-indigo-500" />
                <span className="text-xs text-slate-500">Total Profit</span>
              </div>
              <p className="text-xl font-bold text-slate-800">${summaryStats.totalProfit.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-blue-500" />
                <span className="text-xs text-slate-500">Transactions</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{summaryStats.totalTransactions}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-purple-500" />
                <span className="text-xs text-slate-500">Profit Margin</span>
              </div>
              <p className="text-xl font-bold text-slate-800">{summaryStats.profitMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Revenue & Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="#6366F1" fillOpacity={0.1} strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={2} name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">Payment Methods</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {paymentData.map(item => (
                  <span key={item.name} className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}: ${item.value.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">Top Selling Products</h3>
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-300'}`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.quantity} sold</p>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">${product.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Report */}
      {activeReport === 'sales' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Daily Sales Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} name="Number of Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700">Transaction Log</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Receipt #</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Payment</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...filteredSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(sale => (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-600">{format(new Date(sale.date), 'MMM dd, HH:mm')}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-500">{sale.receiptNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{sale.items.length} items</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                          sale.paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">${sale.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium text-right">${sale.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Performance */}
      {activeReport === 'products' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Product Revenue Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={120} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="revenue" fill="#6366F1" radius={[0, 4, 4, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700">Product Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Units Sold</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Profit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((product, index) => {
                    const margin = product.revenue > 0 ? (product.profit / product.revenue * 100) : 0;
                    return (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">{product.quantity}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">${product.revenue.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium text-right">${product.profit.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-medium ${margin > 50 ? 'text-green-600' : margin > 30 ? 'text-amber-600' : 'text-red-600'}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Profit & Loss */}
      {activeReport === 'profit' && (
        <div className="space-y-6">
          {/* P&L Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
              <p className="text-sm text-green-700 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-green-800 mt-2">${summaryStats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">From {summaryStats.totalTransactions} transactions</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
              <p className="text-sm text-red-700 font-medium">Total Cost of Goods</p>
              <p className="text-3xl font-bold text-red-800 mt-2">${summaryStats.totalCost.toFixed(2)}</p>
              <p className="text-xs text-red-600 mt-1">Avg ${summaryStats.totalTransactions > 0 ? (summaryStats.totalCost / summaryStats.totalTransactions).toFixed(2) : '0.00'}/transaction</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-6">
              <p className="text-sm text-indigo-700 font-medium">Net Profit</p>
              <p className="text-3xl font-bold text-indigo-800 mt-2">${summaryStats.totalProfit.toFixed(2)}</p>
              <p className="text-xs text-indigo-600 mt-1">Margin: {summaryStats.profitMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* Profit Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Profit Trend Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} name="Revenue" dot={false} />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Price Changes Impact */}
          {priceHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-4">Price Change History</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {priceHistory.slice(-20).reverse().map(ph => {
                  const product = products.find(p => p.id === ph.productId);
                  const change = ((ph.newPrice - ph.oldPrice) / ph.oldPrice * 100).toFixed(1);
                  const isIncrease = ph.newPrice > ph.oldPrice;
                  return (
                    <div key={ph.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{product?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{format(new Date(ph.changedAt), 'MMM dd, yyyy')} • {ph.reason || 'No reason'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="text-slate-400">${ph.oldPrice.toFixed(2)}</span>
                          <span className="mx-1">→</span>
                          <span className="font-semibold">${ph.newPrice.toFixed(2)}</span>
                        </p>
                        <p className={`text-xs font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                          {isIncrease ? '↑' : '↓'} {change}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stock Report */}
      {activeReport === 'stock' && (
        <div className="space-y-6">
          {/* Stock Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Stock Received</p>
              <p className="text-xl font-bold text-green-600 mt-1">+{stockSummary.stockIn}</p>
              <p className="text-xs text-slate-400">units in period</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Stock Sold/Out</p>
              <p className="text-xl font-bold text-red-600 mt-1">-{stockSummary.stockOut}</p>
              <p className="text-xs text-slate-400">units in period</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Adjustments</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{stockSummary.adjustments}</p>
              <p className="text-xs text-slate-400">count</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Total Movements</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">{stockSummary.totalMovements}</p>
              <p className="text-xs text-slate-400">transactions</p>
            </div>
          </div>

          {/* Current Stock Levels */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700">Current Stock Levels</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Current Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Min Level</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Unit Cost</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stock Value</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.filter(p => p.businessType === businessType).map(product => {
                    const isLow = product.currentStock <= product.minStock;
                    const value = product.costPrice * product.currentStock;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{product.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{product.sku}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 text-right font-medium">{product.currentStock} {product.unit}</td>
                        <td className="px-4 py-3 text-sm text-slate-500 text-right">{product.minStock}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 text-right">${product.costPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">${value.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {isLow ? '⚠️ Low' : '✓ OK'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-slate-700">Total Stock Value</td>
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600 text-right">
                      ${products.filter(p => p.businessType === businessType).reduce((sum, p) => sum + p.costPrice * p.currentStock, 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
