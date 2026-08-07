import React, { useState } from 'react';
import { X, Sparkles, User, Lock, Mail, Phone, CheckCircle2, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenForgotPassword?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenForgotPassword,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  if (!isOpen) return null;

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const pwdScore = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      if (password !== confirmPassword) {
        alert('Passwords do not match. Please verify your password entry.');
        return;
      }
      if (!agreeTerms || !agreePrivacy) {
        alert('Please accept the Terms of Service and Privacy Policy.');
        return;
      }
    }

    const emailTrimmed = email.trim().toLowerCase();
    const fullName = isRegister && (firstName || lastName)
      ? `${firstName} ${lastName}`.trim()
      : emailTrimmed.includes('@') ? emailTrimmed.split('@')[0] : 'Member User';

    const loggedInUser: UserProfile = {
      id: `usr_${Date.now()}`,
      firstName: firstName || fullName.split(' ')[0],
      lastName: lastName || fullName.split(' ')[1] || '',
      username: username || emailTrimmed.split('@')[0],
      name: fullName,
      email: emailTrimmed || 'user@aisuccesshub.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      plan: 'Free',
      storageUsedMB: 0,
      storageLimitMB: 500,
      filesProcessedCount: 0,
      favorites: ['merge-pdf', 'ai-summarizer', 'ai-video-generator'],
      role: emailTrimmed.includes('admin') ? 'admin' : emailTrimmed.includes('mod') ? 'moderator' : 'user',
      accountStatus: 'active',
      emailVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toLocaleString(),
      usage: {
        aiRequestsToday: 0,
        aiRequestsLimitDaily: 50,
        aiRequestsThisMonth: 0,
        aiRequestsLimitMonthly: 500,
        pdfOpsToday: 0,
        pdfOpsLimitDaily: 20,
        storageUsedMB: 0,
        storageLimitMB: 500,
        maxFileSizeMB: 10,
        apiRequestsThisMonth: 0,
        apiRequestsLimitMonthly: 0,
      },
    };

    if (rememberMe) {
      localStorage.setItem('ais_user_logged_in', 'true');
      localStorage.setItem('ais_user_profile', JSON.stringify(loggedInUser));
    }

    if (isRegister && !registeredSuccess) {
      setRegisteredSuccess(true);
      setTimeout(() => {
        onLoginSuccess(loggedInUser);
        onClose();
      }, 1500);
      return;
    }

    onLoginSuccess(loggedInUser);
    onClose();
  };

  const handleGoogleAuth = () => {
    const googleUser: UserProfile = {
      id: `usr_google_${Date.now()}`,
      firstName: 'Google',
      lastName: 'User',
      username: 'google_user',
      name: 'Google User',
      email: 'user.google@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      plan: 'Pro Monthly',
      storageUsedMB: 12.5,
      storageLimitMB: 10000,
      filesProcessedCount: 18,
      favorites: ['merge-pdf', 'ai-video-generator'],
      role: 'user',
      accountStatus: 'active',
      emailVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toLocaleString(),
    };
    if (rememberMe) {
      localStorage.setItem('ais_user_logged_in', 'true');
      localStorage.setItem('ais_user_profile', JSON.stringify(googleUser));
    }
    onLoginSuccess(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 my-8 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access Veo 3 Video AI, Watermark Removers & PDF Tools
          </p>
        </div>

        {/* Success Overlay after registration */}
        {registeredSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Email Verification Sent!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              We have verified your account details and sent a confirmation link to <span className="text-indigo-300 font-mono">{email}</span>. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Google OAuth Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 border border-white/10 hover:border-white/20 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-semibold">Or with Email</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="johndoe2026"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {!isRegister && onOpenForgotPassword && (
                    <button
                      type="button"
                      onClick={onOpenForgotPassword}
                      className="text-[11px] font-bold text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {isRegister && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Strength:</span>
                      <span className={pwdScore >= 4 ? 'text-emerald-400' : pwdScore >= 2 ? 'text-amber-400' : 'text-rose-400'}>
                        {pwdScore >= 4 ? 'Strong (Secure)' : pwdScore >= 2 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pwdScore >= 4 ? 'bg-emerald-500' : pwdScore >= 2 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${(pwdScore / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Checkboxes */}
              <div className="space-y-2 pt-1 text-xs text-slate-300">
                {!isRegister && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-indigo-500"
                    />
                    <span>Remember Me on this device</span>
                  </label>
                )}

                {isRegister && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="rounded accent-indigo-500"
                      />
                      <span>I accept the <a href="#terms" className="text-indigo-400 underline">Terms of Service</a></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="rounded accent-indigo-500"
                      />
                      <span>I accept the <a href="#privacy" className="text-indigo-400 underline">Privacy Policy</a></span>
                    </label>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg transition-all mt-3 cursor-pointer"
              >
                {isRegister ? 'Register & Verify Email' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-indigo-400 font-bold hover:underline ml-1"
              >
                {isRegister ? 'Sign In' : 'Sign Up Free'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
