import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Printer, 
  Building2, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { StatusBadge } from '../components/UI/Badge';
import { InvoicePDFModal } from '../components/Invoice/InvoicePDFModal';
import { api } from '../services/api';
import { SalesChallan } from '../types';
import { useAuth } from '../context/AuthContext';

export const Challans: React.FC = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);
  const [actionError, setActionError] = useState<string>('');

  const fetchChallans = async () => {
    setLoading(true);
    setActionError('');
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res: any = await api.get('/challans', { params });
      setChallans(res.challans || []);
    } catch (err) {
      console.error('Error fetching sales challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (challanId: string, newStatus: 'CONFIRMED' | 'CANCELLED') => {
    setActionError('');
    try {
      await api.patch(`/challans/${challanId}/status`, { status: newStatus });
      fetchChallans();
    } catch (err: any) {
      setActionError(err.message || `Failed to update status to ${newStatus}`);
    }
  };

  const canCreate = ['ADMIN', 'SALES'].includes(user?.role || '');

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Sales Challan & Invoices" description="Multi-Item Dispatch Challans & Automated Stock Reduction" />

      <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Error Alert Banner */}
        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError('')} className="text-rose-400 hover:text-white font-bold">Dismiss</button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search challan #, customer name, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Challan Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {canCreate && (
              <Link
                to="/challans/new"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" /> Generate New Challan
              </Link>
            )}
          </div>
        </div>

        {/* Sales Challans Data Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden backdrop-blur-md">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading sales challans...</div>
          ) : challans.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No sales challans recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Challan # & Date</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items Count</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {challans.map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-indigo-300">{ch.challanNumber}</p>
                        <p className="text-[10px] text-slate-400">{new Date(ch.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{ch.customerName}</p>
                        <p className="text-[11px] text-slate-400">{ch.customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {ch.items.length} Lines ({ch.totalQuantity} Units)
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        ₹{ch.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={ch.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Invoice PDF Preview */}
                          <button
                            onClick={() => setSelectedChallan(ch)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                            title="View Invoice & Download PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-400" /> Invoice PDF
                          </button>

                          {/* Confirm Status Action */}
                          {ch.status === 'DRAFT' && (
                            <button
                              onClick={() => handleUpdateStatus(ch.id, 'CONFIRMED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Confirm Challan & Reduce Stock"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                            </button>
                          )}

                          {/* Cancel Status Action */}
                          {ch.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleUpdateStatus(ch.id, 'CANCELLED')}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-medium transition-colors"
                              title="Cancel Challan"
                            >
                              Cancel
                            </button>
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

      {/* Invoice PDF Modal */}
      {selectedChallan && (
        <InvoicePDFModal challan={selectedChallan} onClose={() => setSelectedChallan(null)} />
      )}
    </div>
  );
};
