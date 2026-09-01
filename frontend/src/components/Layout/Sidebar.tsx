import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  TrendingUp, 
  LogOut, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Sidebar: React.FC = () => {
  const { user, logout, quickSwitchRole } = useAuth();

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    SALES: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    WAREHOUSE: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    ACCOUNTS: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { to: '/customers', label: 'Customers CRM', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { to: '/products', label: 'Inventory & Products', icon: Package, roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'] },
    { to: '/stock-movements', label: 'Stock Movements', icon: TrendingUp, roles: ['ADMIN', 'WAREHOUSE'] },
    { to: '/challans', label: 'Sales Challans', icon: FileText, roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'] },
  ];

  const allowedItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide leading-tight">Apex ERP</h1>
          <p className="text-xs text-slate-400 font-medium">Distribution Portal</p>
        </div>
      </div>

      {/* Role Switcher Demo Box */}
      <div className="px-4 py-3 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-indigo-400" /> Demo Quick Switch
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => quickSwitchRole(r)}
              className={`text-xs py-1 px-2 rounded-lg font-medium transition-all ${
                user?.role === r 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-3">
          <div className="overflow-hidden pr-2">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md border ${user?.role ? roleColors[user.role] : ''}`}>
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
