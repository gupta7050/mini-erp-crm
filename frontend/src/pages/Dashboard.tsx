import React, { useEffect, useState } from 'react';
import { 
  IndianRupee, 
  Package, 
  AlertTriangle, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { StatusBadge, StockBadge } from '../components/UI/Badge';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res: any = await api.get('/dashboard/stats');
        setStats(res.stats);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Operational Dashboard" description="Live Wholesale ERP & CRM Performance Overview" />

      <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
            Loading operational metrics...
          </div>
        ) : (
          <>
            {/* Quick Actions & Role Welcome */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white">Welcome back, {user?.name}!</h3>
                <p className="text-xs text-slate-400">
                  Role: <span className="font-semibold text-indigo-300">{user?.role}</span> • System synchronized with wholesale stock.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {['ADMIN', 'SALES'].includes(user?.role || '') && (
                  <Link
                    to="/challans/new"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Create Challan
                  </Link>
                )}
                {['ADMIN', 'WAREHOUSE'].includes(user?.role || '') && (
                  <Link
                    to="/products"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
                  >
                    <Package className="w-4 h-4 text-amber-400" /> Manage Inventory
                  </Link>
                )}
              </div>
            </div>

            {/* Metric KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Revenue */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Confirmed Revenue</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-2xl font-extrabold text-white tracking-tight">
                    ₹{stats?.challans.totalRevenue.toLocaleString('en-IN') || 0}
                  </h4>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3 h-3" /> {stats?.challans.confirmedCount || 0} Confirmed Challans
                  </p>
                </div>
              </div>

              {/* Total Stock Value */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Inventory Value</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-2xl font-extrabold text-white tracking-tight">
                    ₹{stats?.inventory.totalStockValue.toLocaleString('en-IN') || 0}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Across {stats?.inventory.totalProducts || 0} Products
                  </p>
                </div>
              </div>

              {/* Low Stock Warning Count */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Low Stock Alerts</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-2xl font-extrabold text-amber-400 tracking-tight">
                    {stats?.inventory.lowStockCount || 0} Items
                  </h4>
                  <p className="text-[11px] text-amber-300/80 mt-1 font-medium">
                    Action required to avoid stockouts
                  </p>
                </div>
              </div>

              {/* Total Customers & Leads */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">CRM Customers</span>
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-2xl font-extrabold text-white tracking-tight">
                    {stats?.customers.total || 0}
                  </h4>
                  <p className="text-[11px] text-sky-400 mt-1 font-medium">
                    {stats?.customers.leads || 0} Active Leads • {stats?.customers.active || 0} Active Customers
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Low Stock Items Alert Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Low Stock Inventory Banners
                  </h4>
                  <Link to="/products" className="text-xs text-indigo-400 hover:underline font-medium">
                    View All
                  </Link>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stats?.inventory.lowStockProducts.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-6">
                      All products are currently healthy in stock.
                    </div>
                  ) : (
                    stats?.inventory.lowStockProducts.map((p) => (
                      <div key={p.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} • {p.location}</p>
                        </div>
                        <StockBadge stock={p.currentStock} minAlert={p.minStockAlert} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Follow-ups Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" /> Pending Customer Follow-Ups
                  </h4>
                  <Link to="/customers" className="text-xs text-indigo-400 hover:underline font-medium">
                    CRM Hub
                  </Link>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stats?.followUps.upcoming.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-6">
                      No follow-ups scheduled for today.
                    </div>
                  ) : (
                    stats?.followUps.upcoming.map((c) => (
                      <Link
                        key={c.id}
                        to={`/customers/${c.id}`}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 block hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-white">{c.name}</p>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{c.businessName}</p>
                        {c.followUpDate && (
                          <p className="text-[10px] text-indigo-300 mt-1 font-medium">
                            Scheduled: {new Date(c.followUpDate).toLocaleDateString()}
                          </p>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Sales Challans */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Recent Sales Challans
                  </h4>
                  <Link to="/challans" className="text-xs text-indigo-400 hover:underline font-medium">
                    View Challans
                  </Link>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stats?.challans.recent.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-6">
                      No challans created yet.
                    </div>
                  ) : (
                    stats?.challans.recent.map((ch) => (
                      <div key={ch.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono font-bold text-indigo-300">{ch.challanNumber}</p>
                          <p className="text-[11px] text-slate-300 truncate max-w-[150px]">{ch.customerName}</p>
                          <p className="text-[10px] text-slate-400">₹{ch.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <StatusBadge status={ch.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
