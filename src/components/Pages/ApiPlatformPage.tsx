import React, { useState } from 'react';
import { ApiKey, ApiEndpointDoc } from '../../types';
import { INITIAL_API_KEYS, API_ENDPOINTS_DOCS } from '../../data/v2Data';
import {
  Code2,
  Key,
  Plus,
  Copy,
  Trash2,
  Play,
  CheckCircle2,
  Activity,
  Layers,
  ShieldAlert,
  Server,
  Zap,
  Terminal,
} from 'lucide-react';

interface ApiPlatformPageProps {
  apiKeys?: ApiKey[];
  endpoints?: ApiEndpointDoc[];
  onCreateKey?: (name: string) => void;
  onRevokeKey?: (id: string) => void;
}

export const ApiPlatformPage: React.FC<ApiPlatformPageProps> = ({
  apiKeys = INITIAL_API_KEYS,
  endpoints = API_ENDPOINTS_DOCS,
  onCreateKey,
  onRevokeKey,
}) => {
  const safeEndpoints = endpoints && endpoints.length > 0 ? endpoints : API_ENDPOINTS_DOCS;
  const safeKeys = apiKeys || INITIAL_API_KEYS;

  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDoc>(safeEndpoints[0]);
  const [keyNameInput, setKeyNameInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyNameInput.trim()) return;
    if (onCreateKey) {
      onCreateKey(keyNameInput);
    }
    setKeyNameInput('');
    setShowCreateModal(false);
  };

  const handleTestEndpoint = () => {
    setIsTesting(true);
    setTestOutput(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestOutput(selectedEndpoint.sampleResponse);
    }, 700);
  };

  const maskKey = (key: string) => {
    if (!key) return 'ash_live_************9e7f';
    const prefix = key.startsWith('ash_') || key.startsWith('sk_') ? key.slice(0, 8) : 'ash_live_';
    const suffix = key.slice(-4);
    return `${prefix}************${suffix}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            Developer API Platform V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            High-Speed AI & PDF REST APIs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Integrate conversion, OCR, AI summarization, writing, image generation, and document analysis into your app.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* API Usage Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Total Requests (This Month)</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">52,120</div>
          <div className="text-[11px] text-emerald-400 font-semibold">+18.4% vs last month</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Avg Response Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">184 ms</div>
          <div className="text-[11px] text-emerald-400 font-semibold">99.98% Uptime SLA</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Rate Limit Usage</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">1,200 / min</div>
          <div className="text-[11px] text-indigo-300 font-semibold">Developer Pro Tier</div>
        </div>

        <div className="p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
          <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
            <span>Active Keys</span>
            <Key className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{safeKeys.filter((k) => k.status === 'active').length} Keys</div>
          <div className="text-[11px] text-slate-400">Scoped with SSL Auth</div>
        </div>
      </div>

      {/* Main Workspace: API Keys & Interactive API Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: API Keys Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              API Secret Keys ({safeKeys.length})
            </h3>

            <div className="space-y-3">
              {safeKeys.map((keyObj) => (
                <div
                  key={keyObj.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{keyObj.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        keyObj.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}
                    >
                      {keyObj.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <code className="text-xs text-indigo-300 font-mono bg-black/40 px-2 py-1 rounded border border-white/5 flex-1 truncate">
                      {maskKey(keyObj.key)}
                    </code>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(keyObj.key);
                        setCopiedKeyId(keyObj.id);
                        setTimeout(() => setCopiedKeyId(null), 2000);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy Key"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {keyObj.status === 'active' && (
                      <button
                        onClick={() => onRevokeKey && onRevokeKey(keyObj.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Used {keyObj.lastUsed}</span>
                    <span>{keyObj.requestsCount.toLocaleString()} requests</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive API Documentation & Live Playground */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                API Endpoints Documentation
              </h3>

              {/* Endpoint Tabs */}
              <div className="flex flex-wrap gap-1">
                {safeEndpoints.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpoint(ep);
                      setTestOutput(null);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      selectedEndpoint.id === ep.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ep.category}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Endpoint Overview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 font-bold text-xs rounded border border-emerald-800/60">
                  {selectedEndpoint.method}
                </span>
                <code className="text-xs font-mono text-indigo-300 bg-black/50 px-3 py-1 rounded border border-white/10">
                  {selectedEndpoint.path}
                </code>
              </div>

              <h4 className="text-base font-bold text-white">{selectedEndpoint.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedEndpoint.description}</p>
            </div>

            {/* Sample Request Code Box */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>cURL Sample Request</span>
                <button
                  onClick={() => navigator.clipboard.writeText(selectedEndpoint.sampleRequest)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy cURL
                </button>
              </div>

              <pre className="p-4 bg-black/80 border border-white/10 rounded-xl text-xs text-indigo-200 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {selectedEndpoint.sampleRequest}
              </pre>
            </div>

            {/* Live Test Button & Output */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleTestEndpoint}
                disabled={isTesting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
              >
                <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Sending Request...' : 'Test Endpoint Live'}</span>
              </button>

              {testOutput && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Response (HTTP 200 OK)
                  </div>
                  <pre className="p-4 bg-black/90 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {testOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreate} className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                Generate New API Key
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold block">Key Identifier / Label</label>
              <input
                type="text"
                required
                placeholder="e.g. Production Webhook Server"
                value={keyNameInput}
                onChange={(e) => setKeyNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md">
                Generate Secret Key
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
