import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  AlertTriangle,
  Building2,
  Package
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { api } from '../services/api';
import { Customer, Product } from '../types';

interface ChallanRow {
  productId: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  availableStock: number;
  sku: string;
  name: string;
}

export const CreateChallan: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [items, setItems] = useState<ChallanRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [custRes, prodRes]: any = await Promise.all([
          api.get('/customers'),
          api.get('/products')
        ]);
        setCustomers(custRes.customers || []);
        setProducts(prodRes.products || []);
        
        if (custRes.customers?.length > 0) {
          setSelectedCustomerId(custRes.customers[0].id);
        }
      } catch (err) {
        console.error('Error initializing challan form:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];

    setItems([
      ...items,
      {
        productId: defaultProd.id,
        name: defaultProd.name,
        sku: defaultProd.sku,
        unitPrice: defaultProd.unitPrice,
        quantity: 1,
        subtotal: defaultProd.unitPrice * 1,
        availableStock: defaultProd.currentStock
      }
    ]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const newItems = [...items];
    const qty = newItems[index].quantity;

    newItems[index] = {
      productId: prod.id,
      name: prod.name,
      sku: prod.sku,
      unitPrice: prod.unitPrice,
      quantity: qty,
      subtotal: prod.unitPrice * qty,
      availableStock: prod.currentStock
    };

    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qtyStr: string) => {
    const qty = parseInt(qtyStr, 10) || 0;
    const newItems = [...items];
    const item = newItems[index];

    newItems[index] = {
      ...item,
      quantity: qty,
      subtotal: item.unitPrice * qty
    };

    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleSubmit = async (status: 'DRAFT' | 'CONFIRMED') => {
    setErrorMsg('');
    if (!selectedCustomerId) {
      setErrorMsg('Please select a customer');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Please add at least one product item to the challan');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/challans', {
        customerId: selectedCustomerId,
        status,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        }))
      });

      navigate('/challans');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create sales challan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Create Sales Challan" description="Wholesale Dispatch Order & Snapshot Generation" />

      <main className="p-6 space-y-6 flex-1 max-w-5xl w-full mx-auto">
        <Link
          to="/challans"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Challans List
        </Link>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading form metadata...</div>
        ) : (
          <div className="space-y-6">
            {/* Customer Selection Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" /> Select Customer / Consignee *
              </label>

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.businessName}) • Mobile: {c.mobile}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Builder Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" /> Challan Product Line Items
                </h3>

                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Item Line
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No items added yet. Click "+ Add Item Line" above to select products.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
                      {/* Product Dropdown */}
                      <div className="md:col-span-5">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Select Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku}) — Available Stock: {p.currentStock}
                            </option>
                          ))}
                        </select>
                        <p className={`text-[10px] mt-1 font-medium ${item.availableStock < item.quantity ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                          Available Stock: {item.availableStock} Units {item.availableStock < item.quantity && '(INSUFFICIENT STOCK!)'}
                        </p>
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Unit Price (₹)</label>
                        <input
                          type="number"
                          readOnly
                          value={item.unitPrice}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 font-bold"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1 uppercase">Subtotal (₹)</label>
                        <p className="font-extrabold text-white text-sm py-2">₹{item.subtotal.toLocaleString('en-IN')}</p>
                      </div>

                      {/* Remove Button */}
                      <div className="md:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Remove item line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Calculation Footer */}
              {items.length > 0 && (
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    Total Lines: <strong className="text-white">{items.length}</strong> • Total Quantity: <strong className="text-white">{totalQuantity} Pcs</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Grand Total:</span>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">₹{totalAmount.toLocaleString('en-IN')}</h2>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('DRAFT')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit('CONFIRMED')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Reduce Stock Immediately
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
