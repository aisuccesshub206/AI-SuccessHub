import React from 'react';
import { X, Crown, Zap, AlertTriangle, Check, ArrowRight, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  limitReason?: string; // e.g. "AI daily limit reached", "File exceeds 10MB", "Pro feature lock"
  onOpenPricing: () => void;
  onOpenEvcModal?: (planId: string) => void;
}

export const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  user,
  limitReason = 'Your free limit has been reached. Upgrade to Pro to unlock more features.',
  onOpenPricing,
  onOpenEvcModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Heading */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Zap className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Usage Limit Reached</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Upgrade Required to Continue
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto font-medium">
            "{limitReason}"
          </p>
        </div>

        {/* Current Plan vs Pro Benefits */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Current Plan</span>
            <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
              {user.plan} Tier
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>What you get with Pro ($12/mo):</span>
            </div>

            <ul className="grid grid-cols-1 gap-1.5 text-slate-700 dark:text-slate-300 pl-1">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>500 AI Requests</strong> per month (vs 10/day)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Unlimited PDF Processing</strong> (OCR, Sign, Merge)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Up to 500MB</strong> file upload limit (vs 10MB)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>50GB Cloud Storage</strong> with permanent history</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenPricing();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 text-slate-950" />
            <span>Upgrade to Pro Now &rarr;</span>
          </button>

          {onOpenEvcModal && (
            <button
              onClick={() => {
                onClose();
                onOpenEvcModal('monthly');
              }}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay via EVC Plus / ZAAD / Sahal</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            I'll stay on Free tier for now
          </button>
        </div>
      </div>
    </div>
  );
};
