import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
      <p className="text-xs text-slate-400">Last updated: August 2026</p>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
        <p>By accessing AI Success Hub, you agree to abide by these Terms of Service and applicable privacy regulations.</p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. User Accounts & Data</h2>
        <p>You retain full copyright and ownership of all uploaded files, PDFs, images, and AI text outputs.</p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Fair Use & API Limits</h2>
        <p>Free tier users receive daily usage allocations. Pro users enjoy unlimited web conversions.</p>
      </div>
    </div>
  );
};
