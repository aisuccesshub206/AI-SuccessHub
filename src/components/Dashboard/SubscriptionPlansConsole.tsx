import React, { useState } from 'react';
import {
  DollarSign,
  Crown,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Check,
  Save,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  Trash2,
  Tag,
} from 'lucide-react';
import { PricingPlan } from '../../types';

interface SubscriptionPlansConsoleProps {
  plans: PricingPlan[];
  onUpdatePlans: (updatedPlans: PricingPlan[]) => void;
}

export const SubscriptionPlansConsole: React.FC<SubscriptionPlansConsoleProps> = ({
  plans,
  onUpdatePlans,
}) => {
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State for Editing/Creating
  const [formPlan, setFormPlan] = useState<PricingPlan>({
    id: '',
    name: '',
    tier: 'pro',
    priceMonthly: 15,
    priceYearly: 10,
    priceLifetime: 199,
    badge: '',
    popular: false,
    enabled: true,
    description: '',
    limits: {
      aiRequestsDaily: -1,
      aiRequestsMonthly: 500,
      pdfOpsDaily: -1,
      maxFileSizeMB: 500,
      storageLimitMB: 51200,
      apiRequestsMonthly: 1000,
      autoDeleteDays: null,
    },
    features: ['Access to AI tools', 'Batch file converter'],
    ctaText: 'Subscribe Now',
  });

  const [featureInput, setFeatureInput] = useState('');

  // Handle Edit Trigger
  const handleOpenEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormPlan({
      ...plan,
      tier: plan.tier || 'pro',
      limits: plan.limits || {
        aiRequestsDaily: -1,
        aiRequestsMonthly: 500,
        pdfOpsDaily: -1,
        maxFileSizeMB: 500,
        storageLimitMB: 51200,
        apiRequestsMonthly: 1000,
        autoDeleteDays: null,
      },
      enabled: plan.enabled !== false,
    });
    setIsCreating(false);
  };

  // Handle Create Trigger
  const handleOpenCreate = () => {
    setFormPlan({
      id: `plan-${Date.now()}`,
      name: 'Custom Team Tier',
      tier: 'pro',
      priceMonthly: 29,
      priceYearly: 24,
      badge: 'New Tier',
      popular: false,
      enabled: true,
      description: 'Dedicated team seat access with high-volume AI processing limit.',
      limits: {
        aiRequestsDaily: -1,
        aiRequestsMonthly: 2000,
        pdfOpsDaily: -1,
        maxFileSizeMB: 1024,
        storageLimitMB: 102400,
        apiRequestsMonthly: 5000,
        autoDeleteDays: null,
      },
      features: ['Unlimited AI Copilot', 'Priority 24/7 Support', 'Dedicated API Key'],
      ctaText: 'Get Started',
    });
    setEditingPlan(null);
    setIsCreating(true);
  };

  // Save Plan
  const handleSavePlan = () => {
    if (!formPlan.name.trim()) return;

    if (isCreating) {
      onUpdatePlans([...plans, formPlan]);
    } else if (editingPlan) {
      onUpdatePlans(plans.map((p) => (p.id === editingPlan.id ? formPlan : p)));
    }

    setEditingPlan(null);
    setIsCreating(false);
  };

  // Toggle Plan Active Enabled Status
  const handleTogglePlanStatus = (planId: string) => {
    onUpdatePlans(
      plans.map((p) => {
        if (p.id === planId) {
          return { ...p, enabled: p.enabled === false ? true : false };
        }
        return p;
      })
    );
  };

  // Add Feature to form
  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormPlan((prev) => ({
      ...prev,
      features: [...prev.features, featureInput.trim()],
    }));
    setFeatureInput('');
  };

  // Remove Feature from form
  const handleRemoveFeature = (idx: number) => {
    setFormPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Subscription Plans &amp; Dynamic Price Controller</h2>
            <p className="text-xs text-slate-400">
              Only Administrators can control pricing. Changes immediately publish across the platform and user checkout modals.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEnabled = plan.enabled !== false;

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border relative transition-all flex flex-col justify-between ${
                !isEnabled
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : plan.popular
                  ? 'bg-gradient-to-b from-indigo-950/80 to-[#090a16] border-indigo-500/50 shadow-2xl shadow-indigo-950/50'
                  : 'bg-[#07070e]/80 border-white/10'
              }`}
            >
              {/* Top Row Badges & Controls */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isEnabled ? '● Active in Store' : '○ Disabled (Hidden)'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePlanStatus(plan.id)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors"
                    title={isEnabled ? 'Disable Plan' : 'Enable Plan'}
                  >
                    {isEnabled ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-rose-400" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded-xl border border-indigo-800/60 transition-colors"
                    title="Edit Plan & Prices"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Plan Details */}
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>{plan.name}</span>
                  {plan.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                      {plan.badge}
                    </span>
                  )}
                </h3>

                <p className="text-xs text-slate-400 min-h-[32px]">{plan.description}</p>

                {/* Price Display */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">${plan.priceMonthly}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    Billed Yearly: ${plan.priceYearly}/mo (${plan.priceYearly * 12}/yr)
                  </div>
                  {plan.priceLifetime && (
                    <div className="text-[11px] text-amber-400 font-bold">
                      Pay Once Lifetime: ${plan.priceLifetime}
                    </div>
                  )}
                </div>

                {/* Features List Preview */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features Included ({plan.features.length})</div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-[10px] text-slate-500 italic">
                        + {plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit Pricing &amp; Features</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Editing or Creating a Plan */}
      {(editingPlan || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b0c18] border border-purple-900/60 text-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative my-8 shadow-2xl">
            <button
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>{isCreating ? 'Create New Subscription Plan' : `Edit Pricing for ${formPlan.name}`}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Adjust monthly rate, yearly discount rate, pay-once lifetime price, features, and active store visibility.
            </p>

            <div className="space-y-4 text-xs">
              {/* Plan Name & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formPlan.name}
                    onChange={(e) => setFormPlan({ ...formPlan, name: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Badge / Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular, 30% OFF"
                    value={formPlan.badge || ''}
                    onChange={(e) => setFormPlan({ ...formPlan, badge: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={formPlan.description}
                  onChange={(e) => setFormPlan({ ...formPlan, description: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Price Inputs */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Price Configuration ($ USD)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Monthly Price ($/mo)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPlan.priceMonthly}
                      onChange={(e) => setFormPlan({ ...formPlan, priceMonthly: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Yearly Billed ($/mo)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPlan.priceYearly}
                      onChange={(e) => setFormPlan({ ...formPlan, priceYearly: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Lifetime Billed ($ Pay Once)</label>
                    <input
                      type="number"
                      min={0}
                      value={formPlan.priceLifetime || ''}
                      onChange={(e) => setFormPlan({ ...formPlan, priceLifetime: Number(e.target.value) })}
                      placeholder="Optional"
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Account Limits Configuration */}
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Usage &amp; Account Limits Enforcement</span>
                  <span className="text-[10px] text-slate-400 lowercase font-normal">(-1 = unlimited)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">AI Reqs / Day (-1 = unlim)</label>
                    <input
                      type="number"
                      value={formPlan.limits?.aiRequestsDaily ?? 10}
                      onChange={(e) =>
                        setFormPlan({
                          ...formPlan,
                          limits: { ...formPlan.limits, aiRequestsDaily: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">AI Reqs / Month (-1 = unlim)</label>
                    <input
                      type="number"
                      value={formPlan.limits?.aiRequestsMonthly ?? 500}
                      onChange={(e) =>
                        setFormPlan({
                          ...formPlan,
                          limits: { ...formPlan.limits, aiRequestsMonthly: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">PDF Ops / Day (-1 = unlim)</label>
                    <input
                      type="number"
                      value={formPlan.limits?.pdfOpsDaily ?? 5}
                      onChange={(e) =>
                        setFormPlan({
                          ...formPlan,
                          limits: { ...formPlan.limits, pdfOpsDaily: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Max Upload File (MB)</label>
                    <input
                      type="number"
                      value={formPlan.limits?.maxFileSizeMB ?? 10}
                      onChange={(e) =>
                        setFormPlan({
                          ...formPlan,
                          limits: { ...formPlan.limits, maxFileSizeMB: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cloud Storage (MB)</label>
                    <input
                      type="number"
                      value={formPlan.limits?.storageLimitMB ?? 500}
                      onChange={(e) =>
                        setFormPlan({
                          ...formPlan,
                          limits: { ...formPlan.limits, storageLimitMB: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">API Calls / Month</label>
                    <input
                      type="number"
                      value={formPlan.limits?.apiRequestsMonthly ?? 0}
                      onChange={(e) =>
                        setFormPlan({
                          ...formPlan,
                          limits: { ...formPlan.limits, apiRequestsMonthly: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Features List Management */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plan Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a new feature bullet point..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    className="flex-1 p-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-white/5 rounded-2xl border border-white/5">
                  {formPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white/5 rounded-xl text-xs">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        {feat}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={formPlan.enabled !== false}
                    onChange={(e) => setFormPlan({ ...formPlan, enabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span>Publish Plan to Store (Enabled)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={formPlan.popular || false}
                    onChange={(e) => setFormPlan({ ...formPlan, popular: e.target.checked })}
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span>Mark as "Most Popular"</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlan(null);
                    setIsCreating(false);
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSavePlan}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Pricing &amp; Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
