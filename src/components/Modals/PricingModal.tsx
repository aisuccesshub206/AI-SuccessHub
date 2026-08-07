import React, { useState } from 'react';
import { X, Crown, Check, Smartphone, CreditCard } from 'lucide-react';
import { PRICING_PLANS } from '../../data/pricingData';
import { PricingPlan, UserProfile } from '../../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  plans?: PricingPlan[];
  onUpgradePlan: (planName: 'Pro Monthly' | 'Pro Yearly' | 'Lifetime') => void;
  onOpenEvcModal?: (planId: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  user,
  plans = PRICING_PLANS,
  onUpgradePlan,
  onOpenEvcModal,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePlans = plans.filter((p) => p.enabled !== false);

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      onClose();
      return;
    }

    setLoadingPlan(planId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          userEmail: user.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const selectedPlan = planId === 'lifetime' ? 'Lifetime' : billingCycle === 'yearly' ? 'Pro Yearly' : 'Pro Monthly';
        onUpgradePlan(selectedPlan);
        alert(`🎉 Stripe Checkout Completed! Your account has been upgraded to ${selectedPlan}.`);
        onClose();
      }
    } catch (err) {
      console.error('Stripe Checkout Error:', err);
      alert('Failed to initiate Stripe payment.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleOpenEvc = (planId: string) => {
    onClose();
    if (onOpenEvcModal) {
      onOpenEvcModal(planId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold mb-3">
            <Crown className="w-3.5 h-3.5" />
            <span>Unlock Premium Productivity</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Choose the Perfect Plan for Your Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Get unlimited AI Copilot queries, batch PDF compression, and zero file size restrictions.
          </p>

          {/* Billing Switcher */}
          <div className="mt-6 inline-flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-amber-400 text-slate-900 rounded font-black">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Local Somalia EVC Plus Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950 border border-cyan-800/60 rounded-2xl text-cyan-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-900/60 rounded-xl text-cyan-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">EVC Plus Payment System</div>
              <div className="text-[11px] text-cyan-300/80">
                Payment Number: <span className="font-mono font-bold text-amber-300">+252 61 594 1664</span> | USSD Code: <span className="font-mono font-bold text-amber-300">79937333133*15#</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleOpenEvc(billingCycle === 'yearly' ? 'yearly' : 'monthly')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shrink-0 transition-colors shadow-lg"
          >
            Pay with EVC Plus &rarr;
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePlans.map((plan) => {
            const price = plan.id === 'lifetime' 
              ? plan.priceLifetime 
              : billingCycle === 'yearly' 
              ? plan.priceYearly 
              : plan.priceMonthly;

            const targetPlanId = plan.id === 'lifetime' ? 'lifetime' : billingCycle;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                  plan.popular
                    ? 'border-indigo-500 dark:border-indigo-500 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 shadow-xl ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-md uppercase tracking-wider">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${price}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                      {plan.id === 'lifetime' ? 'one-time payment' : '/ month'}
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => handleOpenEvc(targetPlanId)}
                    className={`w-full py-3 text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 ${
                      plan.popular
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Pay with EVC Plus ({plan.ctaText})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

