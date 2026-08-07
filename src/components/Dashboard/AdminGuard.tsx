import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminGuardProps {
  user: UserProfile;
  onNavigateHome: () => void;
  onSuccessAdminAuth?: (adminEmail: string) => void;
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  user,
  onNavigateHome,
  children,
}) => {
  // If user is Admin, render the Admin Dashboard directly
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  // If normal user attempts direct access, show standard 403 Access Denied
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#090a14] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl space-y-5">
        <div className="inline-flex p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl">
          <ShieldAlert className="w-10 h-10 text-rose-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">403 - Access Denied</h1>
          <p className="text-xs text-slate-400">
            You do not have permission to view this page or perform this action.
          </p>
        </div>

        <button
          onClick={onNavigateHome}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
};
