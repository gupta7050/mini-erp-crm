import React from 'react';
import { Search, Bell, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  title: string;
  description?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, description }) => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {description && <p className="text-xs text-slate-400 font-normal">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* System Date Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-medium">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentDate}</span>
        </div>

        {/* Security Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Role: <strong className="font-semibold text-white">{user?.role}</strong></span>
        </div>
      </div>
    </header>
  );
};
