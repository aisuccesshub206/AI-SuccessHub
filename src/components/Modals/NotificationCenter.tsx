import React, { useState } from 'react';
import { AppNotification } from '../../types';
import {
  Bell,
  Check,
  Trash2,
  FileText,
  Shield,
  CreditCard,
  Sparkles,
  Settings,
  X,
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNavigatePage: (page: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onClearAll,
  onNavigatePage,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [emailPref, setEmailPref] = useState(true);
  const [pushPref, setPushPref] = useState(true);

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'file_completed':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-amber-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0A0A10] border border-white/10 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Notification Center</h3>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-semibold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Unread
            </button>
          </div>

          <button onClick={() => setActiveTab('settings')} className="text-slate-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {activeTab === 'settings' ? (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[10px]">Notification Preferences</div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-slate-200">Email Notifications</span>
              <input type="checkbox" checked={emailPref} onChange={(e) => setEmailPref(e.target.checked)} className="rounded" />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-slate-200">Browser Push Alerts</span>
              <input type="checkbox" checked={pushPref} onChange={(e) => setPushPref(e.target.checked)} className="rounded" />
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8">No notifications</div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onMarkAsRead(n.id);
                    if (n.linkPage) {
                      onNavigatePage(n.linkPage);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-sm'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Actions */}
        {activeTab !== 'settings' && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <button onClick={onClearAll} className="text-slate-400 hover:text-rose-400 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
            <button onClick={onClose} className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
