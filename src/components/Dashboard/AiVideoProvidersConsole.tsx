import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Key,
  Globe,
  Power,
  Star,
  Trash2,
  Edit2,
  Activity,
  FileText,
  ShieldAlert,
  Sparkles,
  Search,
  Check,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';

export interface VideoProviderClient {
  id: string;
  name: string;
  type: string;
  description: string;
  baseUrl?: string;
  apiKeyConfigured: boolean;
  apiKeyMasked?: string;
  enabled: boolean;
  isDefault: boolean;
  status: 'active' | 'offline' | 'error' | 'unconfigured';
  lastTestedAt?: string;
  errorLog?: string;
}

export interface ProviderLog {
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warn';
  providerName: string;
  message: string;
}

export const AiVideoProvidersConsole: React.FC = () => {
  const [providers, setProviders] = useState<VideoProviderClient[]>([]);
  const [logs, setLogs] = useState<ProviderLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'providers' | 'logs'>('providers');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<VideoProviderClient | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('google_veo');
  const [formDescription, setFormDescription] = useState('');
  const [formBaseUrl, setFormBaseUrl] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/video-providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (e) {
      console.error('Failed to load video providers', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/video-providers/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchLogs();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProvider(null);
    setFormName('');
    setFormType('google_veo');
    setFormDescription('');
    setFormBaseUrl('');
    setFormApiKey('');
    setFormEnabled(true);
    setFormIsDefault(providers.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (provider: VideoProviderClient) => {
    setEditingProvider(provider);
    setFormName(provider.name);
    setFormType(provider.type);
    setFormDescription(provider.description);
    setFormBaseUrl(provider.baseUrl || '');
    setFormApiKey(provider.apiKeyConfigured ? '••••••••' : '');
    setFormEnabled(provider.enabled);
    setFormIsDefault(provider.isDefault);
    setIsModalOpen(true);
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingProvider) {
        // Edit existing
        const res = await fetch(`/api/admin/video-providers/${editingProvider.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            description: formDescription,
            baseUrl: formBaseUrl,
            apiKey: formApiKey,
            enabled: formEnabled,
            isDefault: formIsDefault,
          }),
        });
        if (res.ok) {
          fetchProviders();
          fetchLogs();
          setIsModalOpen(false);
        }
      } else {
        // Add new
        const res = await fetch('/api/admin/video-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            type: formType,
            description: formDescription,
            baseUrl: formBaseUrl,
            apiKey: formApiKey,
            enabled: formEnabled,
            isDefault: formIsDefault,
          }),
        });
        if (res.ok) {
          fetchProviders();
          fetchLogs();
          setIsModalOpen(false);
        }
      }
    } catch (e) {
      console.error('Failed to save provider', e);
    }
  };

  const handleDeleteProvider = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the AI Video Provider "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/video-providers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProviders();
        fetchLogs();
      }
    } catch (e) {
      console.error('Delete provider error', e);
    }
  };

  const handleToggleEnable = async (provider: VideoProviderClient) => {
    try {
      const res = await fetch(`/api/admin/video-providers/${provider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !provider.enabled }),
      });
      if (res.ok) {
        fetchProviders();
        fetchLogs();
      }
    } catch (e) {
      console.error('Toggle enable error', e);
    }
  };

  const handleSetDefault = async (provider: VideoProviderClient) => {
    try {
      const res = await fetch(`/api/admin/video-providers/${provider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true, enabled: true }),
      });
      if (res.ok) {
        fetchProviders();
        fetchLogs();
      }
    } catch (e) {
      console.error('Set default error', e);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);

    try {
      const res = await fetch(`/api/admin/video-providers/${id}/test`, { method: 'POST' });
      const data = await res.json();

      setTestResult({
        id,
        success: data.success,
        msg: data.message || data.error || 'Test finished.',
      });
      fetchProviders();
      fetchLogs();
    } catch (e: any) {
      setTestResult({
        id,
        success: false,
        msg: e.message || 'Failed to reach backend endpoint.',
      });
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Video className="w-3.5 h-3.5" /> AI Engine Routing Layer
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">AI Video Providers Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure, manage API credentials, set default providers, and test connections for Veo 3, Runway, Luma, Fal.ai & Pollinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProviders}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Provider
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'providers'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" /> Active Video Providers ({providers.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('logs');
            fetchLogs();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> API & Execution Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Providers List */}
      {activeTab === 'providers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`relative rounded-3xl bg-slate-900 border p-6 space-y-4 transition-all shadow-xl flex flex-col justify-between ${
                provider.isDefault
                  ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-950/30 to-slate-900'
                  : provider.enabled
                  ? 'border-white/10 hover:border-white/20'
                  : 'border-white/5 opacity-60 bg-slate-950'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{provider.name}</h3>
                      {provider.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{provider.description}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {provider.enabled ? (
                      provider.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                        </span>
                      ) : provider.status === 'error' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Key Required
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-400 text-[11px] font-bold">
                        <Power className="w-3.5 h-3.5" /> Disabled
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Fields */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-400" /> Secret Key:
                    </span>
                    <span className="font-mono text-slate-200">
                      {provider.apiKeyConfigured ? (
                        <span className="text-emerald-400 font-semibold">{provider.apiKeyMasked}</span>
                      ) : provider.type === 'pollinations' ? (
                        <span className="text-slate-400 italic">Not required (Public)</span>
                      ) : (
                        <span className="text-rose-400 font-semibold">Not Set</span>
                      )}
                    </span>
                  </div>

                  {provider.baseUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400" /> Endpoint:
                      </span>
                      <span className="font-mono text-slate-300 truncate max-w-[150px]">{provider.baseUrl}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                    <span className="text-slate-500">Last Tested:</span>
                    <span className="text-slate-400">
                      {provider.lastTestedAt
                        ? new Date(provider.lastTestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Connection Test Result Banner */}
                {testResult && testResult.id === provider.id && (
                  <div
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      testResult.success
                        ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                      {testResult.success ? 'Connection Operational' : 'Connection Error'}
                    </div>
                    <p>{testResult.msg}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2 mt-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleEnable(provider)}
                    title={provider.enabled ? 'Disable Provider' : 'Enable Provider'}
                    className={`p-2 rounded-xl transition-all ${
                      provider.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {!provider.isDefault && (
                    <button
                      onClick={() => handleSetDefault(provider)}
                      title="Set as Default Provider"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 transition-all"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(provider)}
                    title="Edit Provider"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProvider(provider.id, provider.name)}
                    title="Delete Provider"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleTestConnection(provider.id)}
                  disabled={testingId === provider.id}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === provider.id ? 'animate-spin' : ''}`} />
                  {testingId === provider.id ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" /> Recent API Call & Provider Error Logs
          </h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">No logs recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-4 font-mono ${
                    log.level === 'error'
                      ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                      : log.level === 'warn'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                      : 'bg-slate-950 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-400">[{log.providerName}]</span>
                      <span className="text-[10px] opacity-70">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-sans">{log.message}</p>
                  </div>
                  <span
                    className={`uppercase text-[9px] font-bold px-2 py-0.5 rounded ${
                      log.level === 'error'
                        ? 'bg-rose-500/20 text-rose-300'
                        : log.level === 'warn'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {log.level}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold">
                {editingProvider ? 'Edit Video Provider' : 'Add AI Video Provider'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Display Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Google Veo 3 / Runway Gen-3"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {!editingProvider && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Provider Architecture Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="google_veo">Google Veo 3 / Imagen Video</option>
                    <option value="runway">Runway Gen-3 Alpha</option>
                    <option value="luma">Luma Dream Machine</option>
                    <option value="fal_ai">Fal.ai Video Studio</option>
                    <option value="pollinations">Pollinations AI Video Engine (Free)</option>
                    <option value="custom">Custom Compatible API Endpoint</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="High-fidelity video synthesis engine..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Base API URL / Endpoint (Optional)</label>
                <input
                  type="text"
                  value={formBaseUrl}
                  onChange={(e) => setFormBaseUrl(e.target.value)}
                  placeholder="https://api.provider.com/v1"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  API Key / Secret Credential
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder={editingProvider?.apiKeyConfigured ? '•••••••• (Kept Secure)' : 'Paste API Key Here'}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  API Keys are encrypted on server and never sent to browser clients.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Enable Provider</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  <span>Set as Default Provider</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg cursor-pointer"
                >
                  Save Provider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
