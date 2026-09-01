import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Edit2, 
  ArrowUpDown,
  Layers,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { StockBadge } from '../components/UI/Badge';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // Form State
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    currentStock: '',
    minStockAlert: '5',
    location: ''
  });

  // Stock Adjustment Form State
  const [stockForm, setStockForm] = useState({
    quantity: '10',
    type: 'IN' as 'IN' | 'OUT',
    reason: 'Supplier Restock Inward'
  });

  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.lowStockOnly = 'true';

      const res: any = await api.get('/products', { params });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockOnly]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: '',
      category: 'Power Tools',
      unitPrice: '',
      currentStock: '0',
      minStockAlert: '5',
      location: 'Rack A-01'
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      unitPrice: p.unitPrice.toString(),
      currentStock: p.currentStock.toString(),
      minStockAlert: p.minStockAlert.toString(),
      location: p.location
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleOpenStockAdjust = (p: Product) => {
    setAdjustingProduct(p);
    setStockForm({
      quantity: '10',
      type: 'IN',
      reason: 'Inward Shipment Restock'
    });
    setErrorMsg('');
    setIsStockModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productForm);
        setIsEditModalOpen(false);
      } else {
        await api.post('/products', productForm);
        setIsAddModalOpen(false);
      }
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    setErrorMsg('');

    try {
      await api.post(`/products/${adjustingProduct.id}/adjust-stock`, stockForm);
      setIsStockModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Stock adjustment failed');
    }
  };

  const canManage = ['ADMIN', 'WAREHOUSE'].includes(user?.role || '');
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Product & Inventory Directory" description="Stock Control, Warehouse Locations & Movements" />

      <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search product by name, SKU, category, warehouse location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filters & Add Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                lowStockOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Low Stock Alerts</span>
            </button>

            {canManage && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            )}

            <Link
              to="/stock-movements"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Movement Audit Logs
            </Link>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden backdrop-blur-md">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading inventory catalog...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No products found matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Product & SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4">Stock Health</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{p.name}</p>
                        <p className="text-[11px] text-indigo-300 font-mono">SKU: {p.sku}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        ₹{p.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StockBadge stock={p.currentStock} minAlert={p.minStockAlert} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {p.location}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage && (
                            <>
                              <button
                                onClick={() => handleOpenStockAdjust(p)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                title="Stock Adjustment IN/OUT"
                              >
                                <ArrowUpDown className="w-3 h-3" /> Adjust Stock
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Edit Product Info"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingProduct ? 'Edit Product Details' : 'Add New Inventory Product'}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="PRD-HDW-001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="Power Tools"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.unitPrice}
                    onChange={(e) => setProductForm({ ...productForm, unitPrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {!editingProduct && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={productForm.currentStock}
                      onChange={(e) => setProductForm({ ...productForm, currentStock: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Min Stock Alert *</label>
                  <input
                    type="number"
                    required
                    value={productForm.minStockAlert}
                    onChange={(e) => setProductForm({ ...productForm, minStockAlert: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Warehouse Location *</label>
                <input
                  type="text"
                  required
                  value={productForm.location}
                  onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                  placeholder="Rack A-12 / Shelf E"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && adjustingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Quick Stock Adjustment</h3>
              <p className="text-xs text-indigo-300">{adjustingProduct.name} ({adjustingProduct.sku})</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Current Inventory Stock: <strong className="text-white">{adjustingProduct.currentStock}</strong></p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleStockSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Movement Type</label>
                  <select
                    value={stockForm.type}
                    onChange={(e) => setStockForm({ ...stockForm, type: e.target.value as 'IN' | 'OUT' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IN">+ Stock IN (Restock/Inward)</option>
                    <option value="OUT">- Stock OUT (Dispatched/Manual)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason / Reference *</label>
                <input
                  type="text"
                  required
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  placeholder="e.g. Purchase Shipment PO-9801 / Warehouse Stock Audit"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
