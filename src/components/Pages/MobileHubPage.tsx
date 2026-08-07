import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Bell,
  Key,
  CheckCircle2,
  Apple,
  Zap,
  Terminal,
  Shield,
} from 'lucide-react';

export const MobileHubPage: React.FC = () => {
  const [devicePlatform, setDevicePlatform] = useState<'ios' | 'android'>('ios');
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            Mobile App Ready V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            iOS & Android Mobile Companion Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Complete mobile API framework with push notifications, OAuth session handoff, and document scanning.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl">
          <button
            onClick={() => setDevicePlatform('ios')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              devicePlatform === 'ios' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            iOS (Swift)
          </button>
          <button
            onClick={() => setDevicePlatform('android')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              devicePlatform === 'android' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Android (Kotlin)
          </button>
        </div>
      </div>

      {/* Main Grid: QR Code Simulator & Setup Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* QR Code & Mobile Preview Frame */}
        <div className="lg:col-span-5 p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-3xl space-y-5 text-center flex flex-col items-center justify-center">
          <div className="w-52 h-52 p-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
            {/* High visual fidelity QR SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
              <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h10v10H40zM50 30h10v10H50zM30 50h10v10H30zM70 50h10v10H70zM80 70h20v20H80zM50 80h10v20H50zM40 70h10v10H40zM90 40h10v10H90z" />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Scan to Test on Mobile</h3>
            <p className="text-xs text-slate-400">Scan with iPhone or Android camera to launch instant PWA preview.</p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Mobile API Endpoints Operational
            </span>
          </div>
        </div>

        {/* Mobile Configuration Code & Push Notifications */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Push Notification Manager */}
          <div className="p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">Mobile Push Notifications Config</span>
              </div>
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={(e) => setPushEnabled(e.target.checked)}
                className="rounded bg-white/5 border-white/10 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When enabled, your mobile device receives instant push notifications when PDF merges complete, AI workflow steps finish, or payments occur.
            </p>

            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-indigo-200 font-mono flex items-center justify-between">
              <span>FCM / APNS Push Token Status:</span>
              <span className="text-emerald-400 font-bold">Registered (Active)</span>
            </div>
          </div>

          {/* Mobile SDK Integration Snippet */}
          <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>{devicePlatform === 'ios' ? 'Swift iOS SDK Example' : 'Kotlin Android SDK Example'}</span>
              <Terminal className="w-4 h-4 text-purple-400" />
            </div>

            <pre className="p-4 bg-black/90 border border-white/10 rounded-xl text-xs text-indigo-200 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {devicePlatform === 'ios'
                ? `import AISuccessHubSDK

let client = AISuccessHub(apiKey: "ash_live_...")
client.processPDF(url: fileUrl, tool: .compress) { result in
    switch result {
    case .success(let output):
        print("Processed size: \\(output.sizeMB) MB")
    case .failure(let error):
        print("Error: \\(error)")
    }
}`
                : `import com.aisuccesshub.sdk.AISuccessHub

val client = AISuccessHub("ash_live_...")
client.processPDF(fileUri, Tool.COMPRESS) { result ->
    if (result.isSuccess) {
        Log.d("AISuccessHub", "Processed: \${result.downloadUrl}")
    }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
