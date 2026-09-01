import React from 'react';
import { CustomerStatus, CustomerType, ChallanStatus, MovementType } from '../../types';

export const StatusBadge: React.FC<{ status: CustomerStatus | ChallanStatus }> = ({ status }) => {
  const styles: Record<string, string> = {
    LEAD: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    ACTIVE: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    INACTIVE: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
    DRAFT: 'bg-slate-800 text-slate-300 border-slate-700',
    CONFIRMED: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    CANCELLED: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
};

export const TypeBadge: React.FC<{ type: CustomerType }> = ({ type }) => {
  const styles: Record<CustomerType, string> = {
    RETAIL: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    WHOLESALE: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    DISTRIBUTOR: 'bg-teal-500/10 text-teal-300 border-teal-500/30'
  };

  return (
    <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${styles[type]}`}>
      {type}
    </span>
  );
};

export const StockBadge: React.FC<{ stock: number; minAlert: number }> = ({ stock, minAlert }) => {
  const isLow = stock <= minAlert;

  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
        Low Stock ({stock})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      In Stock ({stock})
    </span>
  );
};

export const MovementBadge: React.FC<{ type: MovementType }> = ({ type }) => {
  if (type === 'IN') {
    return (
      <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        + Stock IN
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
      - Stock OUT
    </span>
  );
};
