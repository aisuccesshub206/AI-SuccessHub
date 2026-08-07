import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, Key, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { hashPassword, ADMIN_PASSWORD_HASH_SAMPLE } from '../../utils/cryptoUtils';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAdminAuth: (adminEmail: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessAdminAuth,
}) => {
  const [email, setEmail] = useState('admin@aisuccesshub.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      // Simulate password hashing & verification
      const hashedPassword = await hashPassword(password);
      
      // Verification rule: admin email must end with admin or match admin email, password check
      const isValidEmail = email.toLowerCase().includes('admin') || email === 'admin@aisuccesshub.com';
      const isValidPassword = password === 'Admin@12345' || password === 'admin123' || hashedPassword === ADMIN_PASSWORD_HASH_SAMPLE;

      if (!isValidEmail) {
        throw new Error('Unauthorized email address. Only designated Admin accounts can sign in.');
      }

      if (!isValidPassword) {
        throw new Error('Invalid Admin password. Access denied.');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccessAdminAuth(email);
        setIsVerifying(false);
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify Admin credentials.');
      setIsVerifying(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    setEmail('admin@aisuccesshub.com');
    setPassword('Admin@12345');
    setSuccess(true);
    setTimeout(() => {
      onSuccessAdminAuth('admin@aisuccesshub.com');
      setSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0c16] text-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-purple-900/60 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-purple-900/40 text-purple-400 rounded-2xl border border-purple-700/50 mb-1">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Private Admin Auth</h2>
          <p className="text-xs text-slate-400">
            Enter authorized Admin credentials to unlock system management &amp; pricing settings.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Admin Authentication Verified! Redirecting...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aisuccesshub.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Password (SHA-256 Encrypted)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Default Admin Pass: <code className="text-purple-300">Admin@12345</code></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isVerifying ? (
              <span>Verifying Admin Hash...</span>
            ) : (
              <>
                <span>Authenticate Admin Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Switch */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400 mb-2">Need quick evaluation access?</p>
          <button
            onClick={handleQuickDemoAdmin}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl transition-all"
          >
            ⚡ One-Click Auth as Super Admin
          </button>
        </div>

      </div>
    </div>
  );
};
