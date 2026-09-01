import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, User, Tag, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { MovementBadge } from '../components/UI/Badge';
import { api } from '../services/api';
import { StockMovement } from '../types';

export const StockMovements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;

      const res: any = await api.get('/products/movements', { params });
      setMovements(res.movements || []);
    } catch (err) {
      console.error('Error loading movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [typeFilter]);

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Stock Movement Audit Logs" description="Complete Immutable Trail of Inward & Outward Inventory Changes" />

      <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Filter Controls */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Movement Filter</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Movement Types (IN & OUT)</option>
            <option value="IN">Stock IN (+ Inward)</option>
            <option value="OUT">Stock OUT (- Outward)</option>
          </select>
        </div>

        {/* Movements Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden backdrop-blur-md">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading movement logs...</div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No stock movement records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Qty Changed</th>
                    <th className="py-3.5 px-4">Reason / Reference</th>
                    <th className="py-3.5 px-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{m.product?.name || 'Deleted Product'}</p>
                        <p className="text-[10px] text-indigo-300 font-mono">SKU: {m.product?.sku}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <MovementBadge type={m.type} />
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-sm text-white">
                        {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {m.reason}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" /> {m.createdBy?.name || 'System User'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
