import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  User,
  Phone,
  FileText,
  Eye,
  X,
  Settings,
  AlertTriangle,
  RotateCcw,
  Plus,
  Save,
  Lock,
  Download,
  BarChart3,
  TrendingUp,
  History,
} from 'lucide-react';
import { EvcPaymentConfig, EvcPaymentRequest, PaymentAuditLog } from '../../types';

interface EvcAdminConsoleProps {
  payments: EvcPaymentRequest[];
  config: EvcPaymentConfig;
  auditLogs: PaymentAuditLog[];
  initialTab?: 'pending' | 'history' | 'settings' | 'reports' | 'logs';
  onApprovePayment: (paymentId: string, durationMonths: number, adminNotes?: string) => void;
  onRejectPayment: (paymentId: string, rejectionReason: string) => void;
  onUpdateConfig: (newConfig: EvcPaymentConfig) => void;
}

export const EvcAdminConsole: React.FC<EvcAdminConsoleProps> = ({
  payments,
  config,
  auditLogs,
  initialTab = 'pending',
  onApprovePayment,
  onRejectPayment,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'settings' | 'reports' | 'logs'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // Modal for Viewing Receipt Screenshot
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Duration Customization state per pending item
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});

  // Editable Config State
  const [editableConfig, setEditableConfig] = useState<EvcPaymentConfig>({ ...config });
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  // Filtered Payments
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const historyPayments = payments.filter((p) => p.status !== 'pending');

  const filteredHistory = historyPayments.filter((p) => {
    const matchesQuery =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = filterMethod === 'all' || p.paymentMethod === filterMethod;

    return matchesQuery && matchesMethod;
  });

  // Analytics Math
  const totalApprovedUSD = payments
    .filter((p) => p.status === 'approved')
    .reduce((sum, p) => sum + p.amountPaidUSD, 0);

  const pendingUSD = pendingPayments.reduce((sum, p) => sum + p.amountPaidUSD, 0);
  const totalApprovedCount = payments.filter((p) => p.status === 'approved').length;
  const totalRejectedCount = payments.filter((p) => p.status === 'rejected').length;

  // Handle Approve
  const handleApprove = (pId: string) => {
    const duration = customDurations[pId] || 1;
    onApprovePayment(pId, duration, 'Approved manually via Somalia Mobile Money Console');
  };

  // Handle Reject
  const handleConfirmReject = () => {
    if (rejectingPaymentId && rejectionReasonInput.trim()) {
      onRejectPayment(rejectingPaymentId, rejectionReasonInput.trim());
      setRejectingPaymentId(null);
      setRejectionReasonInput('');
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editableConfig);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Console Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0C0C18] via-slate-900 to-indigo-950 border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded-2xl">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">EVC Plus Admin Payment Approval Console</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800">
                EVC Plus Manual Payments
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Approve or reject EVC Plus payment confirmations (+252 61 594 1664 / Code: 79937333133*15#), manage subscription durations, and inspect payment receipts.
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-center min-w-[100px]">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Pending</div>
            <div className="text-sm font-extrabold text-amber-400">{pendingPayments.length} Requests</div>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-center min-w-[110px]">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Revenue</div>
            <div className="text-sm font-extrabold text-emerald-400">${totalApprovedUSD.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Pending Approvals ({pendingPayments.length})</span>
          {pendingPayments.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-md'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-indigo-400" />
          <span>Payment History ({historyPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-md'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-300" />
          <span>EVC Merchant Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Mobile Revenue Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-md'
              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingPayments.length === 0 ? (
            <div className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">All Mobile Payments Processed!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no pending EVC Plus, ZAAD, or Sahal payment submissions awaiting approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingPayments.map((p) => {
                const duration = customDurations[p.id] || (p.durationMonths || 1);

                return (
                  <div
                    key={p.id}
                    className="p-5 bg-[#080812] border border-amber-500/30 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Left Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          Txn ID: {p.transactionId}
                        </span>
                        <span className="text-[11px] text-slate-400">{p.submittedAt}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">User Name &amp; Email</div>
                          <div className="font-bold text-white text-xs">{p.fullName}</div>
                          <div className="text-[11px] text-slate-400 truncate">{p.email}</div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Somalia Mobile Phone</div>
                          <div className="font-mono font-bold text-cyan-300">{p.phoneNumber}</div>
                          <div className="text-[10px] text-slate-400 capitalize">Method: {p.paymentMethod.replace('_', ' ')}</div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Plan &amp; Amount</div>
                          <div className="font-bold text-white">{p.planName}</div>
                          <div className="text-xs font-black text-emerald-400">${p.amountPaidUSD} USD</div>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Screenshot Preview & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-5">
                      
                      {/* Receipt Image Button */}
                      <button
                        onClick={() => setSelectedReceiptUrl(p.screenshotUrl)}
                        className="group relative p-1 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500 transition-all flex items-center gap-2 pr-3"
                      >
                        <img
                          src={p.screenshotUrl}
                          alt="Receipt"
                          className="w-10 h-12 object-cover rounded-lg border border-white/10"
                        />
                        <div className="text-left">
                          <div className="text-[11px] font-bold text-white group-hover:text-cyan-300 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-cyan-400" /> View Receipt
                          </div>
                          <div className="text-[9px] text-slate-400">EVC Proof Image</div>
                        </div>
                      </button>

                      {/* Approval Duration Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Set Duration:</label>
                        <select
                          value={duration}
                          onChange={(e) =>
                            setCustomDurations({ ...customDurations, [p.id]: Number(e.target.value) })
                          }
                          className="px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value={1} className="bg-slate-900 text-white">1 Month Pro</option>
                          <option value={3} className="bg-slate-900 text-white">3 Months Pro</option>
                          <option value={6} className="bg-slate-900 text-white">6 Months Pro</option>
                          <option value={12} className="bg-slate-900 text-white">1 Year Pro</option>
                          <option value={999} className="bg-slate-900 text-white">Lifetime VIP</option>
                        </select>
                      </div>

                      {/* Approve / Reject Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => setRejectingPaymentId(p.id)}
                          className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          
          {/* Search & Method Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Txn ID, Name, Phone, Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Method:</span>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="px-3 py-2 text-xs bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
              >
                <option value="all">All Methods</option>
                <option value="evc_plus">EVC Plus</option>
                <option value="zaad">ZAAD</option>
                <option value="sahal">Sahal</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          <div className="p-4 bg-[#080812] border border-white/10 rounded-3xl overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase text-slate-400 border-b border-white/10 font-bold">
                <tr>
                  <th className="p-3">User &amp; Contact</th>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Plan / Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                      No historical mobile transactions found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 space-y-0.5">
                        <div className="font-bold text-white">{p.fullName}</div>
                        <div className="text-[11px] text-slate-400">{p.email}</div>
                        <div className="text-[10px] text-cyan-300 font-mono">{p.phoneNumber}</div>
                      </td>

                      <td className="p-3 font-mono font-bold text-amber-300">
                        {p.transactionId}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white">{p.planName}</div>
                        <div className="text-emerald-400 font-black">${p.amountPaidUSD} USD</div>
                      </td>

                      <td className="p-3 text-[11px] text-slate-400">
                        {p.submittedAt}
                      </td>

                      <td className="p-3">
                        {p.status === 'approved' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved ({p.durationMonths}m)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedReceiptUrl(p.screenshotUrl)}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-cyan-300 rounded-lg text-[10px] font-bold border border-white/10 inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: EVC MERCHANT SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 bg-[#080812] border border-white/10 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                Somalia Mobile Merchant Settings
              </h3>
              <p className="text-xs text-slate-400">Configure phone numbers, USSD codes, and USD prices.</p>
            </div>

            {configSavedNotice && (
              <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold rounded-xl animate-in fade-in">
                ✓ Settings Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            {/* Merchant Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Merchant Name</label>
              <input
                type="text"
                value={editableConfig.merchantName}
                onChange={(e) => setEditableConfig({ ...editableConfig, merchantName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* EVC Phone */}
            <div className="space-y-1">
              <label className="font-bold text-cyan-300">Hormuud EVC Plus Number</label>
              <input
                type="text"
                value={editableConfig.merchantPhone}
                onChange={(e) => setEditableConfig({ ...editableConfig, merchantPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* EVC USSD Pattern */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">EVC USSD Dial Pattern</label>
              <input
                type="text"
                value={editableConfig.evcUssdCode}
                onChange={(e) => setEditableConfig({ ...editableConfig, evcUssdCode: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-amber-300 font-mono focus:outline-none"
              />
            </div>

            {/* ZAAD Phone */}
            <div className="space-y-1">
              <label className="font-bold text-amber-300">Telesom ZAAD Number</label>
              <input
                type="text"
                value={editableConfig.zaadNumber}
                onChange={(e) => setEditableConfig({ ...editableConfig, zaadNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-amber-300 font-mono font-bold focus:outline-none"
              />
            </div>

            {/* Sahal Phone */}
            <div className="space-y-1">
              <label className="font-bold text-emerald-300">Golis Sahal Number</label>
              <input
                type="text"
                value={editableConfig.sahalNumber}
                onChange={(e) => setEditableConfig({ ...editableConfig, sahalNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-emerald-300 font-mono font-bold focus:outline-none"
              />
            </div>

            {/* Plan Prices */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Pro Monthly USD ($)</label>
              <input
                type="number"
                value={editableConfig.monthlyPriceUSD}
                onChange={(e) => setEditableConfig({ ...editableConfig, monthlyPriceUSD: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Pro Yearly USD ($)</label>
              <input
                type="number"
                value={editableConfig.yearlyPriceUSD}
                onChange={(e) => setEditableConfig({ ...editableConfig, yearlyPriceUSD: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Lifetime VIP USD ($)</label>
              <input
                type="number"
                value={editableConfig.lifetimePriceUSD}
                onChange={(e) => setEditableConfig({ ...editableConfig, lifetimePriceUSD: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none"
              />
            </div>

          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Merchant Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: REVENUE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 bg-[#080812] border border-white/10 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold">Total Approved EVC Revenue</div>
              <div className="text-3xl font-black text-emerald-400">${totalApprovedUSD.toLocaleString()} USD</div>
              <div className="text-[11px] text-emerald-300 font-semibold">{totalApprovedCount} Successful Approvals</div>
            </div>

            <div className="p-6 bg-[#080812] border border-white/10 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold">Pending Approval Queue</div>
              <div className="text-3xl font-black text-amber-400">${pendingUSD.toLocaleString()} USD</div>
              <div className="text-[11px] text-amber-300 font-semibold">{pendingPayments.length} Awaiting Review</div>
            </div>

            <div className="p-6 bg-[#080812] border border-white/10 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold">Rejected Transactions</div>
              <div className="text-3xl font-black text-rose-400">{totalRejectedCount}</div>
              <div className="text-[11px] text-slate-400">Security & Fraud Guard Active</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 bg-[#080812] border border-white/10 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Security &amp; Admin Audit Trail
          </h3>

          <div className="space-y-2 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-300">{log.action}</span>
                    <span className="text-slate-400">by {log.adminEmail}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">{log.details}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL RECEIPT SCREENSHOT MODAL */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 text-center shadow-2xl relative">
            <button
              onClick={() => setSelectedReceiptUrl(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-white">EVC Plus Receipt Screenshot</h3>
            
            <div className="p-2 bg-black rounded-2xl border border-white/10 inline-block overflow-hidden max-h-[480px]">
              <img src={selectedReceiptUrl} alt="EVC Receipt Full" className="max-h-[440px] w-auto mx-auto rounded-xl" />
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="px-6 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 font-bold text-white rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0A0A10] border border-rose-800/60 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" /> Reject EVC Payment Request
            </h3>

            <p className="text-xs text-slate-300">
              Please enter the reason for rejecting this transaction. The user will be notified in their Notification Center.
            </p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Transaction ID not found on Hormuud EVC Plus ledger or receipt amount mismatched."
              className="w-full p-3 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingPaymentId(null)}
                className="px-4 py-2 text-xs text-slate-400 font-bold hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReasonInput.trim()}
                className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
