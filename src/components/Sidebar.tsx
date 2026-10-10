import { useState } from 'react';
import { LayoutDashboard, Package, BarChart3, ShoppingCart, Tags, TrendingUp, Menu, X, Store, UtensilsCrossed } from 'lucide-react';
import { BusinessType } from '../types';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  businessType: BusinessType;
  onBusinessTypeChange: (type: BusinessType) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products & Items', icon: Package },
  { id: 'inventory', label: 'Stock & Inventory', icon: BarChart3 },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
  { id: 'stickers', label: 'Price Stickers', icon: Tags },
  { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp },
];

export default function Sidebar({ currentPage, onPageChange, businessType, onBusinessTypeChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              {businessType === 'restaurant' ? <UtensilsCrossed size={20} /> : <Store size={20} />}
            </div>
            <div>
              <h1 className="font-bold text-lg">StockPro</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>
        </div>

        {/* Business Type Toggle */}
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Business Mode</p>
          <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => onBusinessTypeChange('supermarket')}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${businessType === 'supermarket' ? 'bg-indigo-500 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <Store size={12} className="inline mr-1" /> Mart
            </button>
            <button
              onClick={() => onBusinessTypeChange('restaurant')}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${businessType === 'restaurant' ? 'bg-indigo-500 text-white shadow' : 'text-slate-300 hover:text-white'}`}
            >
              <UtensilsCrossed size={12} className="inline mr-1" /> Restaurant
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onPageChange(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">StockPro v1.0</p>
            <p className="text-xs text-slate-500">© 2026 All rights reserved</p>
          </div>
        </div>
      </aside>
    </>
  );
}
