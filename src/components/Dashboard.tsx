import { useMemo } from 'react';
import { DollarSign, Package, TrendingUp, AlertTriangle, ShoppingCart, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Product, Sale, Category, StockMovement } from '../types';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  stockMovements: StockMovement[];
}

export default function Dashboard({ products, sales, categories, stockMovements }: DashboardProps) {
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const todaySales = sales.filter(s => isAfter(new Date(s.date), today));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    const todayProfit = todaySales.reduce((sum, s) => sum + s.profit, 0);
    const lowStockItems = products.filter(p => p.currentStock <= p.minStock && p.businessType !== 'restaurant').length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.costPrice * p.currentStock), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

    return { todayRevenue, todayProfit, lowStockItems, totalStockValue, totalRevenue, todaySales: todaySales.length, totalProducts: products.length };
  }, [products, sales]);

  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = startOfDay(new Date(date.getTime() + 86400000));
      const daySales = sales.filter(s => {
        const d = new Date(s.date);
        return d >= dayStart && d < dayEnd;
      });
      data.push({
        day: format(date, 'EEE'),
        revenue: parseFloat(daySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)),
        profit: parseFloat(daySales.reduce((sum, s) => sum + s.profit, 0).toFixed(2)),
        sales: daySales.length,
      });
    }
    return data;
  }, [sales]);

  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach(p => {
      const cat = categories.find(c => c.id === p.categoryId);
      if (cat) {
        catMap.set(cat.name, (catMap.get(cat.name) || 0) + p.currentStock);
      }
    });
    return Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));
  }, [products, categories]);

  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4'];

  const recentSales = useMemo(() => {
    return [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Overview of your business performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Today's Revenue" value={`$${stats.todayRevenue.toFixed(2)}`} color="bg-green-500" change="+12%" />
        <StatCard icon={TrendingUp} label="Today's Profit" value={`$${stats.todayProfit.toFixed(2)}`} color="bg-indigo-500" change="+8%" />
        <StatCard icon={ShoppingCart} label="Today's Sales" value={stats.todaySales.toString()} color="bg-blue-500" change="+5%" />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats.lowStockItems.toString()} color="bg-red-500" change="Check now" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Revenue & Profit (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name} labelLine={false}>
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((cat, i) => (
              <span key={cat.name} className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {recentSales.map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-slate-700">{sale.receiptNumber}</p>
                  <p className="text-xs text-slate-400">{format(new Date(sale.date), 'MMM dd, HH:mm')} • {sale.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-slate-700">${sale.total.toFixed(2)}</p>
                  <p className="text-xs text-green-600">+${sale.profit.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {products.filter(p => p.currentStock <= p.minStock && p.businessType !== 'restaurant').slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-medium text-sm text-slate-700">{product.name}</p>
                  <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-red-600">{product.currentStock} left</p>
                  <p className="text-xs text-slate-400">Min: {product.minStock}</p>
                </div>
              </div>
            ))}
            {products.filter(p => p.currentStock <= p.minStock && p.businessType !== 'restaurant').length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">All items are well stocked! ✅</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <Package size={24} className="mx-auto text-indigo-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800">{stats.totalProducts}</p>
          <p className="text-xs text-slate-500">Total Products</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <BarChart3 size={24} className="mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800">{sales.length}</p>
          <p className="text-xs text-slate-500">Total Sales</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <DollarSign size={24} className="mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800">${stats.totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-slate-500">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
          <TrendingUp size={24} className="mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-slate-800">${stats.totalStockValue.toFixed(0)}</p>
          <p className="text-xs text-slate-500">Stock Value</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, change }: { icon: any; label: string; value: string; color: string; change: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          <p className="text-xs text-green-600 mt-1 font-medium">{change}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
