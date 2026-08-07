import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  DollarSign,
  Tag,
  Plus,
  BarChart2,
  TrendingUp,
  Zap,
  Code2,
  Smartphone,
  Crown,
  Settings,
  Key,
  Globe,
  Sliders,
  Power,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Lock,
  Trash2,
} from 'lucide-react';
import { AdminStats, EvcPaymentConfig, EvcPaymentRequest, PaymentAuditLog, UserProfile, PricingPlan, ApiKey } from '../../types';
import { EvcAdminConsole } from './EvcAdminConsole';
import { UserManagementConsole } from './UserManagementConsole';
import { SubscriptionPlansConsole } from './SubscriptionPlansConsole';
import { DatabaseConsole } from './DatabaseConsole';
import { AiVideoProvidersConsole } from './AiVideoProvidersConsole';
import { Video } from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
  evcPayments: EvcPaymentRequest[];
  evcConfig: EvcPaymentConfig;
  evcAuditLogs: PaymentAuditLog[];
  users: UserProfile[];
  plans: PricingPlan[];
  apiKeys?: ApiKey[];
  onCreateKey?: (name: string) => void;
  onRevokeKey?: (id: string) => void;
  onApproveEvcPayment: (paymentId: string, durationMonths: number, adminNotes?: string) => void;
  onRejectEvcPayment: (paymentId: string, rejectionReason: string) => void;
  onUpdateEvcConfig: (newConfig: EvcPaymentConfig) => void;
  onUpdateUserRole: (userId: string, newRole: 'user' | 'admin') => void;
  onUpdateUserPlan: (userId: string, newPlan: string) => void;
  onToggleAccountStatus: (userId: string, newStatus: 'active' | 'suspended') => void;
  onAddUser: (newUser: UserProfile) => void;
  onUpdatePlans: (updatedPlans: PricingPlan[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBack,
  evcPayments,
  evcConfig,
  evcAuditLogs,
  users,
  plans,
  apiKeys = [],
  onCreateKey,
  onRevokeKey,
  onApproveEvcPayment,
  onRejectEvcPayment,
  onUpdateEvcConfig,
  onUpdateUserRole,
  onUpdateUserPlan,
  onToggleAccountStatus,
  onAddUser,
  onUpdatePlans,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<
    'users' | 'payment_approval' | 'subscriptions' | 'analytics' | 'ai_usage' | 'settings' | 'api_keys' | 'evc_settings' | 'ai_providers'
  >('users');

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: users.length + 18400,
    activeProSubscribers: users.filter((u) => u.plan !== 'Free').length + 2830,
    monthlyRevenueUSD: 42800,
    totalFilesProcessed: 2850000,
    serverStorageUsedGB: 384.2,
    activeServers: 12,
    conversionRatePercent: 15.4,
    customerLtvUSD: 1420,
    monthlyRecurringRevenueUSD: 42800,
    apiRequestsTotal: 1240000,
  });

  const [coupons, setCoupons] = useState<{ code: string; discount: string; uses: number }[]>([
    { code: 'SAVE50', discount: '50% OFF', uses: 480 },
    { code: 'WELCOME2026', discount: '20% OFF', uses: 1240 },
    { code: 'VIPLIFETIME', discount: '$30 OFF', uses: 310 },
  ]);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('30% OFF');

  // Website Settings Local State
  const [siteSettings, setSiteSettings] = useState({
    siteTitle: 'AI SuccessHub SaaS Platform',
    maintenanceMode: false,
    announcementBanner: '🚀 Launch Special: Upgrade to Pro and get 50% off with promo code SAVE50!',
    signUpMode: 'public', // 'public' | 'invite_only'
    defaultDailyAiLimit: 10,
    maxUploadSizeMB: 100,
  });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // System API Keys local state backup
  const [newApiKeyName, setNewApiKeyName] = useState('');

  const addCoupon = () => {
    if (!newCouponCode.trim()) return;
    setCoupons((prev) => [...prev, { code: newCouponCode.toUpperCase(), discount: newDiscount, uses: 0 }]);
    setNewCouponCode('');
  };

  const handleSaveWebsiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const pendingCount = evcPayments.filter((p) => p.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-purple-800/60 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-600/30 text-purple-300 rounded-2xl border border-purple-500/30">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>System Administrator Control Center</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Super Admin Authorized
              </span>
            </h1>
            <p className="text-xs text-purple-200 mt-1">
              Complete administrative command for user RBAC, payment approvals, subscriptions, AI usage &amp; platform settings
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
        >
          Exit Dashboard
        </button>
      </div>

      {/* Main 8-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        
        {/* 1. User Management */}
        <button
          onClick={() => setActiveMainTab('users')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'users'
              ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-xl ring-1 ring-indigo-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>User Management</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
            {users.length}
          </span>
        </button>

        {/* 2. Payment Approval */}
        <button
          onClick={() => setActiveMainTab('payment_approval')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'payment_approval'
              ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-xl ring-1 ring-amber-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>Payment Approval</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>

        {/* 3. Subscription Management */}
        <button
          onClick={() => setActiveMainTab('subscriptions')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'subscriptions'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-xl ring-1 ring-emerald-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4 text-emerald-400" />
          <span>Subscription Management</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
            {plans.length}
          </span>
        </button>

        {/* 4. Analytics */}
        <button
          onClick={() => setActiveMainTab('analytics')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'analytics'
              ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-xl ring-1 ring-purple-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-purple-400" />
          <span>Analytics &amp; MRR</span>
        </button>

        {/* 5. AI Usage */}
        <button
          onClick={() => setActiveMainTab('ai_usage')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'ai_usage'
              ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-xl ring-1 ring-cyan-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>AI Usage &amp; Telemetry</span>
        </button>

        {/* 6. Website Settings */}
        <button
          onClick={() => setActiveMainTab('settings')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'settings'
              ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-xl ring-1 ring-rose-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-rose-400" />
          <span>Website Settings</span>
        </button>

        {/* 7. API Key Management */}
        <button
          onClick={() => setActiveMainTab('api_keys')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'api_keys'
              ? 'bg-blue-950 border-blue-500 text-blue-300 shadow-xl ring-1 ring-blue-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4 text-blue-400" />
          <span>API Key Management</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
            {apiKeys.length}
          </span>
        </button>

        {/* 8. EVC Payment Settings */}
        <button
          onClick={() => setActiveMainTab('evc_settings')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'evc_settings'
              ? 'bg-teal-950 border-teal-500 text-teal-300 shadow-xl ring-1 ring-teal-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 text-teal-400" />
          <span>EVC Payment Settings</span>
        </button>

        {/* 9. AI Video Providers */}
        <button
          onClick={() => setActiveMainTab('ai_providers')}
          className={`px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all flex items-center gap-2 ${
            activeMainTab === 'ai_providers'
              ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-xl ring-1 ring-indigo-500/40'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4 text-indigo-400" />
          <span>AI Video Providers</span>
        </button>

      </div>

      {/* ==================== TAB CONTENT RENDERING ==================== */}

      {/* 1. USER MANAGEMENT TAB */}
      {activeMainTab === 'users' && (
        <UserManagementConsole
          users={users}
          onUpdateUserRole={onUpdateUserRole}
          onUpdateUserPlan={onUpdateUserPlan}
          onToggleAccountStatus={onToggleAccountStatus}
          onAddUser={onAddUser}
        />
      )}

      {/* 2. PAYMENT APPROVAL TAB */}
      {activeMainTab === 'payment_approval' && (
        <EvcAdminConsole
          initialTab="pending"
          payments={evcPayments}
          config={evcConfig}
          auditLogs={evcAuditLogs}
          onApprovePayment={onApproveEvcPayment}
          onRejectPayment={onRejectEvcPayment}
          onUpdateConfig={onUpdateEvcConfig}
        />
      )}

      {/* 3. SUBSCRIPTION MANAGEMENT TAB */}
      {activeMainTab === 'subscriptions' && (
        <SubscriptionPlansConsole
          plans={plans}
          onUpdatePlans={onUpdatePlans}
        />
      )}

      {/* 4. ANALYTICS TAB */}
      {activeMainTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#07070e]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Monthly Recurring Revenue (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                ${stats.monthlyRevenueUSD.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">+24.2% YoY Growth</div>
            </div>

            <div className="bg-[#07070e]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Customer Lifetime Value (LTV)</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                ${stats.customerLtvUSD.toLocaleString()}
              </div>
              <div className="text-[11px] text-purple-300 font-semibold">Net Retention: 114%</div>
            </div>

            <div className="bg-[#07070e]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Active Paid Subscribers</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats.activeProSubscribers.toLocaleString()}
              </div>
              <div className="text-[11px] text-indigo-300 font-semibold">{stats.conversionRatePercent}% Conversion Rate</div>
            </div>

            <div className="bg-[#07070e]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Registered Users</span>
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-[11px] text-cyan-300 font-semibold">Global SaaS Community</div>
            </div>
          </div>

          {/* Promo Coupons Manager */}
          <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Promo Coupons &amp; Discount Codes
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Coupon Code (e.g. SUMMER2026)"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 flex-1"
              />
              <input
                type="text"
                placeholder="Discount (e.g. 30% OFF)"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 sm:w-32"
              />
              <button
                onClick={addCoupon}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {coupons.map((c, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold font-mono text-purple-400">{c.code}</div>
                    <div className="text-[10px] text-slate-400">{c.discount}</div>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">{c.uses} redemptions</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. AI USAGE TAB */}
      {activeMainTab === 'ai_usage' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Daily AI Requests Today</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">18,420</div>
              <div className="text-[11px] text-slate-400">99.8% Successful Completions</div>
            </div>

            <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Monthly Gemini Token Usage</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-300">8.4M Tokens</div>
              <div className="text-[11px] text-slate-400">Google Gemini Flash Engine</div>
            </div>

            <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-2">
              <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                <span>Average AI Latency</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">180ms</div>
              <div className="text-[11px] text-slate-400">Sub-Second Response Pipeline</div>
            </div>
          </div>

          {/* AI Feature Consumption Breakdown */}
          <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              AI Tools &amp; Model Feature Distribution
            </h3>

            <div className="space-y-3">
              {[
                { name: 'AI Document Summarizer & Multi-PDF Chat', usage: '42%', count: '780,000 requests', color: 'bg-indigo-500' },
                { name: 'Universal File Converter Engine', usage: '28%', count: '520,000 requests', color: 'bg-purple-500' },
                { name: 'Vision OCR & Document Parser', usage: '18%', count: '330,000 requests', color: 'bg-cyan-500' },
                { name: 'Generative AI Studio & Image Creator', usage: '12%', count: '210,000 requests', color: 'bg-amber-500' },
              ].map((tool, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{tool.name}</span>
                      <span className="ml-2 text-[10px] text-slate-400">({tool.count})</span>
                    </div>
                    <span className="font-extrabold text-indigo-400">{tool.usage}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${tool.color}`} style={{ width: tool.usage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. WEBSITE SETTINGS TAB */}
      {activeMainTab === 'settings' && (
        <form onSubmit={handleSaveWebsiteSettings} className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-400" />
                Platform Website Settings
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure global platform branding, maintenance mode, and sign-up policies</p>
            </div>
            {settingsSavedToast && (
              <div className="px-3 py-1.5 bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Settings Saved Successfully!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Site Title */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Platform Title Name
              </label>
              <input
                type="text"
                value={siteSettings.siteTitle}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Maintenance Mode Toggle */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300 flex items-center gap-2">
                <Power className="w-4 h-4 text-rose-400" />
                Maintenance Mode Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, maintenanceMode: !siteSettings.maintenanceMode })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
                    siteSettings.maintenanceMode
                      ? 'bg-rose-950 border-rose-500 text-rose-300'
                      : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{siteSettings.maintenanceMode ? 'Maintenance Mode ACTIVE' : 'Platform Online (Normal)'}</span>
                </button>
              </div>
            </div>

            {/* Announcement Banner */}
            <div className="space-y-2 md:col-span-2">
              <label className="font-semibold text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                Global Announcement Banner
              </label>
              <input
                type="text"
                value={siteSettings.announcementBanner}
                onChange={(e) => setSiteSettings({ ...siteSettings, announcementBanner: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Default Free Tier Daily AI Limit */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Default Daily Free AI Requests Quota
              </label>
              <input
                type="number"
                value={siteSettings.defaultDailyAiLimit}
                onChange={(e) => setSiteSettings({ ...siteSettings, defaultDailyAiLimit: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Sign-Up Restriction Mode */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                User Registration Mode
              </label>
              <select
                value={siteSettings.signUpMode}
                onChange={(e) => setSiteSettings({ ...siteSettings, signUpMode: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="public">Open Public Registration</option>
                <option value="invite_only">Invite Only / Closed Registration</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* 7. API KEY MANAGEMENT TAB */}
      {activeMainTab === 'api_keys' && (
        <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-400" />
                System API Key Management Console
              </h3>
              <p className="text-xs text-slate-400 mt-1">Manage master API keys, rate limits, and access keys across services</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="New Key Name (e.g. Master Backend Service)"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
                className="px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 flex-1 sm:w-64"
              />
              <button
                onClick={() => {
                  if (!newApiKeyName.trim()) return;
                  if (onCreateKey) onCreateKey(newApiKeyName);
                  setNewApiKeyName('');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Key</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No active system API keys registered.</div>
            ) : (
              apiKeys.map((keyObj) => (
                <div key={keyObj.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{keyObj.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        keyObj.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                      }`}>
                        {keyObj.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-mono text-slate-400 text-[11px] bg-black/40 px-2.5 py-1 rounded-lg inline-block border border-white/5">
                      {keyObj.key.length > 8 ? `${keyObj.key.slice(0, 8)}************${keyObj.key.slice(-4)}` : 'ash_live_************9e7f'}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-slate-400 text-[11px]">
                    <div>
                      <div>Rate Limit</div>
                      <div className="font-bold text-slate-200">{keyObj.rateLimitPerMin} req/min</div>
                    </div>
                    <div>
                      <div>Total Usage</div>
                      <div className="font-bold text-slate-200">{keyObj.requestsCount} calls</div>
                    </div>
                    {keyObj.status === 'active' && onRevokeKey && (
                      <button
                        onClick={() => onRevokeKey(keyObj.id)}
                        className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl font-bold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. EVC PAYMENT SETTINGS TAB */}
      {activeMainTab === 'evc_settings' && (
        <EvcAdminConsole
          initialTab="settings"
          payments={evcPayments}
          config={evcConfig}
          auditLogs={evcAuditLogs}
          onApprovePayment={onApproveEvcPayment}
          onRejectPayment={onRejectEvcPayment}
          onUpdateConfig={onUpdateEvcConfig}
        />
      )}

      {/* 9. AI VIDEO PROVIDERS TAB */}
      {activeMainTab === 'ai_providers' && (
        <AiVideoProvidersConsole />
      )}

    </div>
  );
};
