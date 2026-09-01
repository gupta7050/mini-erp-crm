import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageSquarePlus, 
  Clock, 
  FileText,
  UserCheck
} from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { StatusBadge, TypeBadge } from '../components/UI/Badge';
import { api } from '../services/api';
import { Customer, FollowUp, CustomerStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // New Follow Up Note state
  const [noteText, setNoteText] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextStatus, setNextStatus] = useState<CustomerStatus | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomerDetails = async () => {
    try {
      const res: any = await api.get(`/customers/${id}`);
      setCustomer(res.customer);
    } catch (err) {
      console.error('Error fetching customer detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/customers/${id}/followups`, {
        note: noteText,
        followUpDate: nextFollowUpDate || null,
        nextStatus: nextStatus || customer?.status
      });

      setNoteText('');
      setNextFollowUpDate('');
      setNextStatus('');
      fetchCustomerDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to add follow-up note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit = ['ADMIN', 'SALES'].includes(user?.role || '');

  return (
    <div className="flex-1 min-h-screen bg-slate-950 flex flex-col">
      <Navbar title="Customer Profile & Follow-Up Log" description="CRM Follow-Up Timeline & Order History" />

      <main className="p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        <Link
          to="/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers Directory
        </Link>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading customer profile...</div>
        ) : !customer ? (
          <div className="text-center py-12 text-slate-500 text-xs">Customer profile not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Customer Details Overview */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{customer.name}</h3>
                    <p className="text-xs text-indigo-300 font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" /> {customer.businessName}
                    </p>
                  </div>
                  <StatusBadge status={customer.status} />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <TypeBadge type={customer.type} />
                  {customer.gstNumber && (
                    <span className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded">
                      GST: {customer.gstNumber}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 pt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-400" />
                    <span>{customer.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-400">{customer.address}</span>
                  </div>
                </div>

                {customer.followUpDate && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Next Follow-Up Date</span>
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(customer.followUpDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {customer.notes && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">Account Notes</span>
                    <p className="text-xs text-slate-300 italic bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                      "{customer.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Order History Summary */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Customer Sales Challans ({customer.challans?.length || 0})
                </h4>

                <div className="space-y-2">
                  {customer.challans?.length === 0 ? (
                    <p className="text-xs text-slate-500">No sales challans generated yet.</p>
                  ) : (
                    customer.challans?.map((ch: any) => (
                      <div key={ch.id} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-mono text-indigo-300 font-bold">{ch.challanNumber}</p>
                          <p className="text-[10px] text-slate-400">{new Date(ch.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">₹{ch.totalAmount.toLocaleString('en-IN')}</p>
                          <span className="text-[10px] uppercase font-bold text-indigo-400">{ch.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 2 Columns: Follow-Up Timeline & Add Note */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add Follow Up Note Form */}
              {canEdit && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-indigo-400" /> Record CRM Follow-Up Activity
                  </h4>

                  <form onSubmit={handleAddFollowUp} className="space-y-3 text-xs">
                    <div>
                      <textarea
                        required
                        rows={3}
                        placeholder="Write detailed follow-up note (e.g. Discussed pricing, catalog sent, client agreed to buy 50 units)..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Next Follow-Up Date</label>
                        <input
                          type="date"
                          value={nextFollowUpDate}
                          onChange={(e) => setNextFollowUpDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Update Status (Optional)</label>
                        <select
                          value={nextStatus}
                          onChange={(e) => setNextStatus(e.target.value as CustomerStatus)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Keep current ({customer.status})</option>
                          <option value="LEAD">Set to LEAD</option>
                          <option value="ACTIVE">Set to ACTIVE</option>
                          <option value="INACTIVE">Set to INACTIVE</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Logging...' : 'Post Follow-Up Note'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Follow-Up Timeline Log */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> CRM Follow-Up Activity Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {customer.followUps?.length === 0 ? (
                    <p className="text-xs text-slate-500">No previous follow-up notes recorded.</p>
                  ) : (
                    customer.followUps?.map((f) => (
                      <div key={f.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-900"></div>
                        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-200 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-indigo-400" /> {f.createdBy?.name || 'Staff User'}
                            </span>
                            <span>{new Date(f.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">{f.note}</p>
                          {f.followUpDate && (
                            <p className="text-[10px] text-indigo-300 font-medium pt-1">
                              Scheduled Next Follow-Up: {new Date(f.followUpDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
