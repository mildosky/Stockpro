import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package, Filter } from 'lucide-react';
import { Product, Category, BusinessType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  businessType: BusinessType;
  onSave: (products: Product[]) => void;
}

export default function ProductsPage({ products, categories, businessType, onSave }: ProductsPageProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '', categoryId: '', sku: '', barcode: '', costPrice: '', sellingPrice: '',
    currentStock: '', minStock: '', unit: '', description: '',
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchesType = p.businessType === businessType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const relevantCategories = categories.filter(c => c.businessType === businessType);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', categoryId: relevantCategories[0]?.id || '', sku: '', barcode: '', costPrice: '', sellingPrice: '', currentStock: '', minStock: '10', unit: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, categoryId: product.categoryId, sku: product.sku, barcode: product.barcode,
      costPrice: product.costPrice.toString(), sellingPrice: product.sellingPrice.toString(),
      currentStock: product.currentStock.toString(), minStock: product.minStock.toString(),
      unit: product.unit, description: product.description,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? {
        ...p, ...formData,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        currentStock: parseInt(formData.currentStock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        updatedAt: now,
      } : p);
      onSave(updated);
    } else {
      const newProduct: Product = {
        id: uuidv4(),
        ...formData,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        currentStock: parseInt(formData.currentStock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        businessType,
        createdAt: now,
        updatedAt: now,
        active: true,
      };
      onSave([...products, newProduct]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      onSave(products.filter(p => p.id !== id));
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? `${cat.icon} ${cat.name}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products & Items</h1>
          <p className="text-slate-500">Manage your {businessType === 'restaurant' ? 'menu items' : 'products'} inventory</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={18} /> Add {businessType === 'restaurant' ? 'Menu Item' : 'Product'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none bg-white">
            <option value="all">All Categories</option>
            {relevantCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cost</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Margin</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const margin = ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(0);
                const isLow = product.currentStock <= product.minStock;
                return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Package size={14} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-700">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{getCategoryName(product.categoryId)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">${product.costPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">${product.sellingPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {product.currentStock} {isLow && '⚠️'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="text-green-600 font-medium">{margin}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEditModal(product)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No products found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-slate-800">{editingProduct ? 'Edit' : 'Add'} {businessType === 'restaurant' ? 'Menu Item' : 'Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Product name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    {relevantCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., kg, piece, plate" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="e.g., BEV-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Barcode</label>
                  <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Barcode number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price ($) *</label>
                  <input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price ($) *</label>
                  <input type="number" step="0.01" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                  <input type="number" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock Level</label>
                  <input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="10" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" rows={2} placeholder="Product description..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {editingProduct ? 'Update' : 'Add'} Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
