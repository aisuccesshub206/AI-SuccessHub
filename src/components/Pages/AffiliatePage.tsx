import React, { useState } from 'react';
import { AffiliateStats, AffiliateReferral } from '../../types';
import {
  DollarSign,
  Copy,
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  ExternalLink,
  Wallet,
  Sparkles,
} from 'lucide-react';

interface AffiliatePageProps {
  stats: AffiliateStats;
  referrals: AffiliateReferral[];
  onRequestPayout: (amount: number) => void;
}

export const AffiliatePage: React.FC<AffiliatePageProps> = ({
  stats,
  referrals,
  onRequestPayout,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(stats.referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePayout = () => {
    if (stats.pendingCommissionUSD <= 0) {
      alert('You currently have no pending commissions to withdraw.');
      return;
    }
    onRequestPayout(stats.pendingCommissionUSD);
    setPayoutRequested(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Affiliate & Creator Program V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Earn 30% Lifetime Recurring Commission
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Share AI Success Hub with your audience and earn recurring commissions on every Pro & Enterprise referral.
          </p>
        </div>

        <button
          onClick={handlePayout}
          disabled={payoutRequested || stats.pendingCommissionUSD <= 0}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all"
        >
          <Wallet className="w-4 h-4" />
          <span>{payoutRequested ? 'Payout Pending Approval' : `Withdraw $${stats.pendingCommissionUSD.toFixed(2)}`}</span>
        </button>
      </div>

      {/* Referral Link Copy Bar */}
      <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Your Unique Partner Link & Code</span>
          <span className="text-emerald-400 font-mono">30% Commission Active</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-indigo-300 font-mono truncate">
            {stats.referralLink}
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Total Referral Clicks</span>
            <ExternalLink className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.totalClicks.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Verified unique visitors</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Conversions</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.conversions}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">{stats.conversionRate}% Conv Rate</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Pending Payout</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-300">${stats.pendingCommissionUSD.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400">Ready for withdrawal</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Total Earned</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">${stats.totalEarnedUSD.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">Lifetime Earnings</div>
        </div>
      </div>

      {/* Main Grid: Referrals Log & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Referrals Activity Table */}
        <div className="lg:col-span-8 p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Recent Referral Conversions
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Referred User / Org</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Your Commission</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">{ref.referredUser}</td>
                    <td className="p-3 text-indigo-300">{ref.plan}</td>
                    <td className="p-3 text-slate-400">{ref.date}</td>
                    <td className="p-3 font-bold text-emerald-400">+${ref.commissionUSD.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          ref.status === 'Paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Affiliate Leaderboard */}
        <div className="lg:col-span-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top Creator Leaderboard
          </h3>

          <div className="space-y-3">
            {[
              { rank: '1', name: 'TechCrunch Affiliate', earned: '$14,280', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
              { rank: '2', name: 'Your Account (Active)', earned: '$1,700', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', isYou: true },
              { rank: '3', name: 'DevTool Digest', earned: '$1,240', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
              { rank: '4', name: 'SaaS Growth Hub', earned: '$980', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
            ].map((leader) => (
              <div
                key={leader.rank}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  leader.isYou
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                    : 'bg-white/5 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-xs text-amber-400 w-4 text-center">#{leader.rank}</span>
                  <img src={leader.avatar} alt={leader.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-bold">{leader.name}</span>
                </div>
                <span className="font-extrabold text-xs text-emerald-400">{leader.earned}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
