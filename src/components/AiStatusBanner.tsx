import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  WifiOff,
  RefreshCw,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  FileCheck2,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import {
  checkAiConnectivity,
  GlobalAiStatus,
  AiConnectivityStatus,
} from '../services/aiService';

export interface AiStatusBannerProps {
  /** Optional callback to navigate to a tool category (e.g. 'pdf' or 'utilities') */
  onSelectCategory?: (category: string) => void;
  /** Optional callback to navigate to a specific tool */
  onSelectTool?: (toolId: string) => void;
  className?: string;
}

export const AiStatusBanner: React.FC<AiStatusBannerProps> = ({
  onSelectCategory,
  onSelectTool,
  className = '',
}) => {
  const [status, setStatus] = useState<GlobalAiStatus>('checking');
  const [statusDetails, setStatusDetails] = useState<AiConnectivityStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ais_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');

  // Primary status detection function
  const evaluateStatus = useCallback(async (probe = false) => {
    setIsChecking(true);
    try {
      const result = await checkAiConnectivity(probe);
      setStatus((prev) => {
        // If recovered from error state to operational, trigger brief restored notice
        if (
          (prev === 'quota_exceeded' || prev === 'offline' || prev === 'key_missing') &&
          result.status === 'operational'
        ) {
          setShowRestoredNotice(true);
          setTimeout(() => setShowRestoredNotice(false), 6000);
        }
        return result.status;
      });
      setStatusDetails(result);
      setLastCheckTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('AiStatusBanner connectivity check failed:', err);
      setStatus('offline');
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Initial probe and event listeners
  useEffect(() => {
    // Initial evaluation
    evaluateStatus(false);

    // Online / Offline browser events
    const handleOnline = () => evaluateStatus(true);
    const handleOffline = () => {
      setStatus('offline');
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Reactive status changes emitted by aiService API calls
    const handleStatusChangeEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        status: GlobalAiStatus;
        message?: string;
      }>;
      if (customEvent.detail && customEvent.detail.status) {
        setStatus(customEvent.detail.status);
        setLastCheckTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        if (customEvent.detail.status === 'quota_exceeded') {
          // Re-open if quota was exceeded so user is informed non-intrusively
          setIsDismissed(false);
          if (customEvent.detail.message) {
            setStatusDetails((prev) => ({
              status: 'quota_exceeded',
              configured: true,
              message: customEvent.detail.message || 'Gemini API quota exceeded.',
              nonAiToolsOperational: true,
              lastChecked: new Date().toISOString(),
              consecutiveFailures: (prev?.consecutiveFailures || 0) + 1,
            }));
          }
        } else if (customEvent.detail.status === 'operational') {
          setStatusDetails((prev) => ({
            status: 'operational',
            configured: true,
            message: 'AI Service is operational.',
            nonAiToolsOperational: true,
            lastChecked: new Date().toISOString(),
            consecutiveFailures: 0,
          }));
        }
      }
    };

    window.addEventListener('ai-service-status-change', handleStatusChangeEvent);

    // Periodic check every 90 seconds
    const interval = setInterval(() => {
      // Only poll if window is visible
      if (!document.hidden) {
        evaluateStatus(false);
      }
    }, 90000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('ai-service-status-change', handleStatusChangeEvent);
      clearInterval(interval);
    };
  }, [evaluateStatus]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('ais_banner_dismissed', 'true');
    } catch {}
  };

  const handleReopen = () => {
    setIsDismissed(false);
    try {
      sessionStorage.removeItem('ais_banner_dismissed');
    } catch {}
  };

  // If operational and not showing restored notification, show nothing (or small floating status badge if user dismissed)
  const isProblematic = status === 'quota_exceeded' || status === 'key_missing' || status === 'offline';

  // Render Restored Notice Toast if recently recovered
  if (showRestoredNotice) {
    return (
      <div
        id="ai-status-restored-toast"
        role="status"
        aria-live="polite"
        className={`w-full bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 backdrop-blur-md px-4 py-2.5 text-xs text-emerald-300 transition-all flex items-center justify-between z-40 ${className}`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AI connectivity restored. All generative features and models are fully operational.</span>
          </div>
          <button
            onClick={() => setShowRestoredNotice(false)}
            className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // If everything is operational or currently checking initially without prior issues, remain non-intrusive and quiet
  if (!isProblematic) {
    return null;
  }

  // If the user has dismissed the banner, provide an ultra-discreet floating pill in the bottom right corner
  // so they know AI status without eating up vertical layout space or blocking ANY UI elements.
  if (isDismissed) {
    return (
      <div
        id="ai-status-minimized-pill"
        role="status"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-40"
      >
        <button
          onClick={handleReopen}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md shadow-lg border transition-all hover:scale-105 ${
            status === 'quota_exceeded'
              ? 'bg-amber-950/80 border-amber-500/40 text-amber-200 hover:border-amber-400'
              : status === 'offline'
              ? 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
              : 'bg-rose-950/80 border-rose-500/40 text-rose-200 hover:border-rose-400'
          }`}
          title="Click to view AI service status"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>
            {status === 'quota_exceeded'
              ? 'AI Quota Limited'
              : status === 'offline'
              ? 'Working Offline'
              : 'AI Setup Needed'}
          </span>
          <span className="text-[10px] opacity-70 px-1.5 py-0.5 rounded bg-black/40">
            Non-AI Tools Active
          </span>
        </button>
      </div>
    );
  }

  // Configuration per status
  const config = {
    quota_exceeded: {
      title: 'AI Service Temporarily Limited (API Quota Exceeded)',
      badge: 'Quota Exceeded',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      borderClass: 'border-amber-500/30 dark:border-amber-500/20',
      bgClass: 'bg-amber-950/30 dark:bg-[#181104]/80 text-amber-100',
      accentColor: 'text-amber-400',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
      description:
        'The Google Gemini AI API has temporarily reached its rate or quota limit. While AI models refresh, all 40+ PDF tools, image compressors, converters, document editors, and workflows remain 100% operational.',
      advice: 'AI requests will resume once the API quota resets. In the meantime, all local and document tools are fully available.',
    },
    key_missing: {
      title: 'AI Service Configuration Required',
      badge: 'Setup Required',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      borderClass: 'border-indigo-500/30 dark:border-indigo-500/20',
      bgClass: 'bg-indigo-950/30 dark:bg-[#0c0f1d]/80 text-indigo-100',
      accentColor: 'text-indigo-400',
      icon: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
      description:
        'GEMINI_API_KEY is not configured on the server environment. Non-AI tools (PDF merger, compression, split, convert, OCR viewer, signatures, and payments) continue to operate normally.',
      advice: 'Configure GEMINI_API_KEY in the environment settings to enable AI features.',
    },
    offline: {
      title: 'Network Offline — Working in Local Mode',
      badge: 'Offline Mode',
      badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600',
      borderClass: 'border-slate-700/50',
      bgClass: 'bg-slate-900/80 dark:bg-[#0c0d12]/90 text-slate-200',
      accentColor: 'text-slate-400',
      icon: <WifiOff className="w-4 h-4 text-slate-400 shrink-0" />,
      description:
        'You appear to be offline or the server connection was interrupted. Client-side utilities and cached document features remain active.',
      advice: 'Check your internet connection or retry the connection.',
    },
  }[status === 'checking' ? 'quota_exceeded' : status];

  return (
    <aside
      id="ai-status-banner-root"
      role="status"
      aria-live="polite"
      aria-label="AI Service Status Banner"
      className={`w-full border-b backdrop-blur-md transition-all duration-300 z-30 ${config.bgClass} ${config.borderClass} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        {/* Main Banner Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Icon & Core Message */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg bg-black/30 shrink-0">
              {config.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
                  {config.title}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                  {config.badge}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <FileCheck2 className="w-3 h-3" />
                  PDF & Non-AI Tools Operational
                </span>
              </div>

              {!isMinimized && (
                <p className="text-xs text-slate-300/90 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  {config.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions (Retry, Browse Non-AI Tools, Toggle Details, Dismiss) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Retry Button */}
            <button
              id="ai-status-retry-button"
              type="button"
              onClick={() => evaluateStatus(true)}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/10 transition-colors disabled:opacity-50"
              title="Test live connectivity to Gemini AI API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-amber-300' : ''}`} />
              <span>{isChecking ? 'Testing...' : 'Retry'}</span>
            </button>

            {/* Quick Link to Non-AI PDF Tools */}
            {onSelectCategory && (
              <button
                id="ai-status-browse-non-ai-btn"
                type="button"
                onClick={() => onSelectCategory('pdf')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-600/30 hover:bg-indigo-600/40 active:scale-95 text-indigo-200 border border-indigo-500/30 transition-colors"
                title="Browse 100% available PDF and file tools"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>PDF & Utilities</span>
              </button>
            )}

            {/* Technical Details Toggle */}
            <button
              id="ai-status-toggle-details"
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="p-1 text-xs text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              title={showTechnicalDetails ? 'Hide details' : 'Show details'}
              aria-expanded={showTechnicalDetails}
            >
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Minimize Toggle */}
            <button
              id="ai-status-minimize-btn"
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="hidden md:inline-flex p-1 text-xs text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              title={isMinimized ? 'Expand banner' : 'Collapse banner'}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss Button */}
            <button
              id="ai-status-dismiss-button"
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss banner (status remains accessible via corner pill)"
              aria-label="Dismiss AI status notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Technical Details Drawer */}
        {showTechnicalDetails && (
          <div
            id="ai-status-technical-details"
            className="mt-3 pt-3 border-t border-white/10 text-xs grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn"
          >
            <div className="bg-black/30 rounded p-2.5 border border-white/5">
              <span className="font-semibold text-white block mb-1">Status Diagnostics</span>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Mode:</span>
                  <span className="font-mono text-amber-300">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Checked:</span>
                  <span className="font-mono">{lastCheckTime || 'Just now'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Non-AI Services:</span>
                  <span className="text-emerald-400 font-medium">100% Operational</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded p-2.5 border border-white/5">
              <span className="font-semibold text-white block mb-1">What Works Right Now?</span>
              <ul className="text-slate-300 space-y-0.5 list-disc list-inside">
                <li>PDF Merge, Split, Compress, Sign & Protect</li>
                <li>Image Converter, Resizer, WebP Processor</li>
                <li>Document OCR Reader & Local Formatters</li>
                <li>EVC Plus Payment Hub & Automation Flows</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded p-2.5 border border-white/5 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-white block mb-1">Next Step</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {config.advice}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Auto-refreshes periodically</span>
                <button
                  onClick={() => evaluateStatus(true)}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Force Probe Now →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
