import React, { useState } from 'react';
import {
  X,
  Crown,
  HardDrive,
  Cpu,
  FileCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Check,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { UserProfile, PricingPlan } from '../../types';
import { PRICING_PLANS } from '../../data/pricingData';

interface SubscriptionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  plans?: PricingPlan[];
  onUpgradePlan: (planName: string) => void;
  onCancelSubscription: () => void;
  onOpenEvcModal?: (planId: string) => void;
}

export const SubscriptionManagementModal: React.FC<SubscriptionManagementModalProps> = ({
  isOpen,
  onClose,
  user,
  plans = PRICING_PLANS,
  onUpgradePlan,
  onCancelSubscription,
  onOpenEvcModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'cancel'>('overview');
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelled, setIsCancelled] = useState(user.planStatus === 'canceling' || user.planStatus === 'canceled');

  if (!isOpen) return null;

  // Defaults for user usage tracking
  const usage = user.usage || {
    aiRequestsToday: 8,
    aiRequestsLimitDaily: user.plan === 'Free' ? 10 : -1,
    aiRequestsThisMonth: user.plan === 'Pro Monthly' || user.plan === 'Pro Yearly' ? 180 : 8,
    aiRequestsLimitMonthly: user.plan.includes('Pro') ? 500 : user.plan === 'Enterprise' ? -1 : 300,
    pdfOpsToday: 3,
    pdfOpsLimitDaily: user.plan === 'Free' ? 5 : -1,
    storageUsedMB: user.storageUsedMB || 120,
    storageLimitMB: user.storageLimitMB || 500,
    maxFileSizeMB: user.plan === 'Free' ? 10 : user.plan.includes('Pro') ? 500 : 5120,
    apiRequestsThisMonth: user.plan === 'Enterprise' ? 12400 : user.plan.includes('Pro') ? 120 : 0,
    apiRequestsLimitMonthly: user.plan === 'Enterprise' ? 50000 : user.plan.includes('Pro') ? 1000 : 0,
    autoDeleteDays: user.plan === 'Free' ? 30 : null,
  };

  const currentPlanObj = plans.find((p) => p.name.toLowerCase().includes(user.plan.toLowerCase())) || plans[0];

  const handleConfirmCancel = () => {
    setIsCancelled(true);
    onCancelSubscription();
    setActiveTab('overview');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>Subscription & Account Limits</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Manage Your Subscription
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View current usage, check plan limits, or upgrade to unlock premium tools.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Current Usage
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'comparison'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Tiers Comparison
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & LIVE USAGE TRACKER */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Active Plan Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Active Plan
                  </span>
                  {isCancelled ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                      Cancels at end of cycle
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black">{user.plan} Tier</h3>

                <p className="text-xs text-slate-300">
                  {user.plan === 'Free'
                    ? '10 AI requests/day • 5 PDF ops/day • 10MB max file size • 500MB storage'
                    : user.plan.includes('Pro')
                    ? '500 AI requests/mo • Unlimited PDF • 500MB max file size • 50GB storage'
                    : 'Unlimited AI & PDF • 5GB max file size • 1TB+ storage • Team workspace'}
                </p>

                <div className="text-[11px] text-slate-400 pt-1">
                  Next Renewal Date: <span className="text-white font-semibold">{user.nextBillingDate || 'September 4, 2026'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {user.plan === 'Free' ? (
                  <button
                    onClick={() => onUpgradePlan('Pro Monthly')}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade to Pro Plan ($12/mo)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('cancel')}
                    className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                  >
                    Cancel Subscription
                  </button>
                )}

                {onOpenEvcModal && (
                  <button
                    onClick={() => onOpenEvcModal('monthly')}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with EVC Plus</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Usage Progress Grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Live Account Usage &amp; Limits Tracking</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. AI Requests Usage */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-500" />
                      <span>AI Requests</span>
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {usage.aiRequestsLimitDaily > 0 ? 'Daily Limit' : 'Monthly Limit'}
                    </span>
                  </div>

                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {usage.aiRequestsLimitDaily > 0
                      ? `${usage.aiRequestsToday} / ${usage.aiRequestsLimitDaily} today`
                      : usage.aiRequestsLimitMonthly > 0
                      ? `${usage.aiRequestsThisMonth} / ${usage.aiRequestsLimitMonthly} /mo`
                      : 'Unlimited'}
                  </div>

                  {usage.aiRequestsLimitDaily > 0 && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usage.aiRequestsToday >= usage.aiRequestsLimitDaily
                            ? 'bg-rose-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{
                          width: `${Math.min(100, (usage.aiRequestsToday / usage.aiRequestsLimitDaily) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  {usage.aiRequestsLimitDaily > 0 && (
                    <div className="text-[10px] text-slate-500">
                      Resets daily at midnight UTC
                    </div>
                  )}
                </div>

                {/* 2. PDF Operations */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      <span>PDF Operations</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Daily Ops</span>
                  </div>

                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {usage.pdfOpsLimitDaily > 0
                      ? `${usage.pdfOpsToday} / ${usage.pdfOpsLimitDaily} today`
                      : 'Unlimited'}
                  </div>

                  {usage.pdfOpsLimitDaily > 0 ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (usage.pdfOpsToday / usage.pdfOpsLimitDaily) * 100)}%`,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Unlimited OCR, Merge, Split &amp; Edit
                    </div>
                  )}
                </div>

                {/* 3. Cloud Storage Used */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-amber-500" />
                      <span>Cloud Storage</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Total Size</span>
                  </div>

                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {usage.storageLimitMB >= 1024
                      ? `${(usage.storageUsedMB / 1024).toFixed(1)}GB / ${(usage.storageLimitMB / 1024).toFixed(0)}GB`
                      : `${usage.storageUsedMB}MB / ${usage.storageLimitMB}MB`}
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (usage.storageUsedMB / usage.storageLimitMB) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-500">
                    {usage.autoDeleteDays
                      ? `Auto-deleted after ${usage.autoDeleteDays} days`
                      : 'Permanent history guaranteed'}
                  </div>
                </div>

                {/* 4. File Size & API Limits */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-cyan-500" />
                      <span>File Upload Limit</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Max File</span>
                  </div>

                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {usage.maxFileSizeMB >= 1024
                      ? `${usage.maxFileSizeMB / 1024} GB per file`
                      : `${usage.maxFileSizeMB} MB per file`}
                  </div>

                  <div className="text-[10px] text-slate-500">
                    API Calls: {usage.apiRequestsLimitMonthly > 0 ? `${usage.apiRequestsThisMonth}/${usage.apiRequestsLimitMonthly}/mo` : '0 (Upgrade for API)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPARISON TABLE */}
        {activeTab === 'comparison' && (
          <div className="mt-6 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <th className="p-3 font-extrabold text-sm w-1/3">Feature &amp; Limits</th>
                    <th className="p-3 font-bold text-center bg-slate-50 dark:bg-slate-800/40 rounded-t-xl">
                      Free Starter
                    </th>
                    <th className="p-3 font-bold text-center bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      Pro ($12/mo)
                    </th>
                    <th className="p-3 font-bold text-center bg-slate-50 dark:bg-slate-800/40">
                      Enterprise ($59/mo)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  <tr>
                    <td className="p-3 font-semibold">AI Requests Limit</td>
                    <td className="p-3 text-center">10 requests / day</td>
                    <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      500 requests / month
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">PDF Operations</td>
                    <td className="p-3 text-center">5 ops / day</td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      Unlimited
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Max Upload File Size</td>
                    <td className="p-3 text-center">10 MB</td>
                    <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      500 MB
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      5 GB
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Cloud Storage</td>
                    <td className="p-3 text-center">500 MB (30-day auto-delete)</td>
                    <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      50 GB (Permanent)
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      1 TB+
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">OCR, E-Sign &amp; Edit PDF</td>
                    <td className="p-3 text-center text-slate-400">✕ Basic Only</td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Included
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Included
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Team Seats &amp; Workspace</td>
                    <td className="p-3 text-center text-slate-400">✕ Single User</td>
                    <td className="p-3 text-center text-slate-400">✕ Single User</td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Team Seats &amp; Roles
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Developer API Access</td>
                    <td className="p-3 text-center text-slate-400">✕ No API</td>
                    <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      1,000 reqs/mo
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      50,000 reqs/mo
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onUpgradePlan('Pro Monthly')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Upgrade to Pro Plan Now
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CANCEL SUBSCRIPTION CONFIRMATION */}
        {activeTab === 'cancel' && (
          <div className="mt-6 space-y-5 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-1">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Are you sure you want to cancel?</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                If you cancel, your account will revert to the <strong>Free Starter</strong> plan at the end of your billing cycle. You will lose access to 500MB+ file uploads, 50GB storage, and unlimited PDF OCR tools.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Please tell us why you are canceling (Optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Too expensive, missing a specific tool..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Keep My Subscription
              </button>

              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
