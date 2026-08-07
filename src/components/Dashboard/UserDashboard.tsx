import React, { useState } from 'react';
import {
  UserProfile,
  ProcessedFile,
  ToolItem,
} from '../../types';
import {
  LayoutDashboard,
  HardDrive,
  FileCheck,
  Crown,
  Star,
  Download,
  Clock,
  Sparkles,
  Zap,
  User,
  Settings,
  Lock,
  Globe,
  Sun,
  Moon,
  Trash2,
  CheckCircle2,
  Camera,
} from 'lucide-react';

interface UserDashboardProps {
  user: UserProfile;
  recentFiles: ProcessedFile[];
  tools: ToolItem[];
  onSelectTool: (toolId: string) => void;
  onOpenPricing: () => void;
  onOpenSubscriptionManagement?: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onDeleteAccount?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  recentFiles,
  tools,
  onSelectTool,
  onOpenPricing,
  onOpenSubscriptionManagement,
  onUpdateProfile,
  onDeleteAccount,
  darkMode = true,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  
  // Profile Form States
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const [selectedLang, setSelectedLang] = useState('en');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password Form States
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Delete Account Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const favoriteTools = tools.filter((t) => user.favorites.includes(t.id));

  // Defaults for usage
  const usage = user.usage || {
    aiRequestsToday: 0,
    aiRequestsLimitDaily: user.plan === 'Free' ? 10 : -1,
    aiRequestsThisMonth: user.plan.includes('Pro') ? 180 : 0,
    aiRequestsLimitMonthly: user.plan.includes('Pro') ? 500 : user.plan === 'Enterprise' ? -1 : 300,
    pdfOpsToday: 0,
    pdfOpsLimitDaily: user.plan === 'Free' ? 5 : -1,
    storageUsedMB: user.storageUsedMB || 0,
    storageLimitMB: user.storageLimitMB || 500,
    maxFileSizeMB: user.plan === 'Free' ? 10 : user.plan.includes('Pro') ? 500 : 5120,
    apiRequestsThisMonth: user.plan === 'Enterprise' ? 12400 : 0,
    apiRequestsLimitMonthly: user.plan === 'Enterprise' ? 50000 : 0,
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName,
        email: editEmail,
        avatar: avatarUrl,
      });
    }
    setProfileSuccessMsg('Profile updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New passwords do not match.');
      return;
    }

    setPasswordSuccessMsg('Password updated successfully!');
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-md"
          />
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>Welcome back, {user.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                {user.plan} Plan
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenSubscriptionManagement && (
            <button
              onClick={onOpenSubscriptionManagement}
              className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600/80 hover:bg-indigo-600 rounded-2xl border border-indigo-500/40 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Manage Subscription &amp; Limits</span>
            </button>
          )}

          {user.plan === 'Free' && (
            <button
              onClick={onOpenPricing}
              className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Crown className="w-4 h-4 text-slate-900" />
              <span>Upgrade to Pro Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview &amp; Usage</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile &amp; Account Settings</span>
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-5 h-5 text-indigo-500" />
              <span>Personal Profile</span>
            </h3>

            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Profile Photo URL
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Avatar Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30"
                  />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Security & Preferences */}
          <div className="space-y-6">
            {/* Change Password Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Lock className="w-5 h-5 text-indigo-500" />
                <span>Security &amp; Change Password</span>
              </h3>

              {passwordSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  {passwordErrorMsg}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* Language & Theme Preferences */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Globe className="w-5 h-5 text-indigo-500" />
                <span>Preferences</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Language
                  </label>
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="en">English (US)</option>
                    <option value="so">Soomaali (Somali)</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="fr">Français (French)</option>
                    <option value="es">Español (Spanish)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Appearance Mode
                  </label>
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </span>
                    <span className="text-[10px] text-indigo-500 font-bold uppercase">Toggle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 space-y-3">
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Danger Zone</span>
              </h4>
              <p className="text-xs text-slate-400">
                Permanently remove your personal account, saved AI workflows, and Knowledge Base files.
              </p>

              {showDeleteConfirm ? (
                <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl space-y-3 text-xs">
                  <div className="font-bold text-rose-200">Are you absolutely sure? This cannot be undone.</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteAccount) onDeleteAccount();
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs transition-all"
                >
                  Delete Personal Account
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>

      {/* Account Limits & Usage Tracker Card Row */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span>Active Subscription Limits &amp; Daily Tracking</span>
          </h3>

          {onOpenSubscriptionManagement && (
            <button
              onClick={onOpenSubscriptionManagement}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Full Tier Matrix &rarr;
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* AI Usage */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>AI Tools Requests</span>
              <span className="text-[10px] text-indigo-500 font-bold">
                {user.plan === 'Free' ? '10 / day' : user.plan.includes('Pro') ? '500 / mo' : 'Unlimited'}
              </span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {usage.aiRequestsLimitDaily > 0
                ? `${usage.aiRequestsToday} / ${usage.aiRequestsLimitDaily} used today`
                : `${usage.aiRequestsThisMonth} / 500 used`}
            </div>
            {usage.aiRequestsLimitDaily > 0 && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    usage.aiRequestsToday >= usage.aiRequestsLimitDaily ? 'bg-rose-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, (usage.aiRequestsToday / usage.aiRequestsLimitDaily) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* PDF Ops */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>PDF Operations</span>
              <span className="text-[10px] text-emerald-500 font-bold">
                {user.plan === 'Free' ? '5 / day' : 'Unlimited'}
              </span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {usage.pdfOpsLimitDaily > 0
                ? `${usage.pdfOpsToday} / ${usage.pdfOpsLimitDaily} used today`
                : 'Unlimited Processing'}
            </div>
            {usage.pdfOpsLimitDaily > 0 && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (usage.pdfOpsToday / usage.pdfOpsLimitDaily) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Storage Used */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>Cloud Storage</span>
              <span className="text-[10px] text-amber-500 font-bold">
                {user.plan === 'Free' ? '500 MB' : user.plan.includes('Pro') ? '50 GB' : '1 TB+'}
              </span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {user.storageUsedMB.toFixed(1)} MB / {user.storageLimitMB} MB
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (user.storageUsedMB / user.storageLimitMB) * 100)}%` }}
              />
            </div>
          </div>

          {/* Max File Upload Limit */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>Max File Size</span>
              <span className="text-[10px] text-cyan-500 font-bold">Upload Cap</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {usage.maxFileSizeMB >= 1024 ? `${usage.maxFileSizeMB / 1024} GB` : `${usage.maxFileSizeMB} MB`}
            </div>
            <div className="text-[10px] text-slate-400">
              {user.plan === 'Free' ? 'Auto-deleted in 30 days' : 'Permanent cloud history'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Cloud Storage Used</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {user.storageUsedMB.toFixed(1)} MB / {user.storageLimitMB} MB
            </div>
            <div className="w-32 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${Math.min(100, (user.storageUsedMB / user.storageLimitMB) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Files Processed</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {recentFiles.length + user.filesProcessedCount} Files
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
              +100% Privacy Protected
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Favorite Tools</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {user.favorites.length} Saved
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Quick 1-Click Launch
            </div>
          </div>
        </div>

      </div>

      {/* Favorite Tools Quick Launcher */}
      {favoriteTools.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>Your Favorite Shortcuts</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {favoriteTools.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTool(t.id)}
                className="p-3 text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between group"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {t.name}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Files Processed Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          <span>Recent File Activity & History</span>
        </h3>

        {recentFiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">File Name</th>
                  <th className="p-3">Tool Used</th>
                  <th className="p-3">Original Size</th>
                  <th className="p-3">Processed Size</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {file.fileName}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                        {file.toolUsed}
                      </span>
                    </td>
                    <td className="p-3">{(file.originalSize / 1024).toFixed(1)} KB</td>
                    <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {(file.processedSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="p-3 text-slate-400">{file.createdAt}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Downloading ${file.fileName}...`)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No recent files processed yet. Try running a PDF merge, split, or AI summarizer tool!
          </div>
        )}
      </div>
        </>
      )}

    </div>
  );
};
