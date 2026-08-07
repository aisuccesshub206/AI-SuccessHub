import React, { useState } from 'react';
import { PRICING_PLANS } from '../../data/pricingData';
import { Check, Crown, HelpCircle, ChevronDown, Smartphone } from 'lucide-react';
import { UserProfile, PricingPlan } from '../../types';

interface PricingPageProps {
  user: UserProfile;
  plans?: PricingPlan[];
  onOpenPricingModal: () => void;
  onOpenEvcModal?: (planId: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ user, plans = PRICING_PLANS, onOpenPricingModal, onOpenEvcModal }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activePlans = plans.filter((p) => p.enabled !== false);

  const faqs = [
    {
      q: 'How do I pay with EVC Plus, ZAAD, or Sahal in Somalia?',
      a: 'Select any plan and choose "Pay with EVC Plus". You will see our merchant phone number and USSD dial code (*770*61XXXXXXX*AMOUNT#). Dial the code on your phone, complete transfer, and paste your transaction ID & receipt screenshot for instant admin verification.',
    },
    {
      q: 'Are my uploaded PDF documents private and secure?',
      a: 'Yes, 100%. All processing runs locally in your browser sandbox or over ephemeral SSL-encrypted memory pipelines. Files are automatically erased after processing.',
    },
    {
      q: 'Can I cancel my Pro subscription at any time?',
      a: 'Absolutely. You can cancel or modify your subscription anytime from your User Dashboard with 1-click.',
    },
    {
      q: 'What is the Lifetime VIP license?',
      a: 'The Lifetime VIP license allows you to pay once and unlock all current and future PDF tools, AI Copilots, and API access keys forever with no recurring fees.',
    },
    {
      q: 'Do you offer refunds if I am not satisfied?',
      a: 'Yes, we offer a 14-day money-back guarantee with zero questions asked.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <Crown className="w-3.5 h-3.5" />
          <span>Simple, Transparent SaaS Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Supercharge Your Workflow Today
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          No hidden charges. Upgrade via Card or Somalia Mobile Money (EVC Plus, ZAAD, Sahal).
        </p>
      </div>

      {/* Somalia Mobile Money Callout Box */}
      <div className="max-w-4xl mx-auto p-5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950 border border-cyan-700/50 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-900/80 text-cyan-300 rounded-2xl shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-cyan-400 tracking-wider">Local Payment Support</div>
            <h3 className="text-base font-bold text-white">Somalia EVC Plus, ZAAD &amp; Sahal Mobile Payments</h3>
            <p className="text-xs text-slate-300">
              No credit card needed! Pay in USD directly from your mobile phone and submit receipt for rapid activation.
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenEvcModal && onOpenEvcModal('monthly')}
          className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-lg shrink-0"
        >
          EVC Payment Portal &rarr;
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activePlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-8 border flex flex-col justify-between transition-all duration-200 ${
              plan.popular
                ? 'border-indigo-500 bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 shadow-2xl ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                {plan.badge && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  ${plan.id === 'lifetime' ? plan.priceLifetime : plan.priceYearly}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  {plan.id === 'lifetime' ? 'one-time' : '/ month billed annually'}
                </span>
              </div>

              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onOpenEvcModal ? onOpenEvcModal(plan.id) : onOpenPricingModal()}
                className={`w-full py-3.5 text-xs font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay via EVC Plus ({plan.ctaText})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-500" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

