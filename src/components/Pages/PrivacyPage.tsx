import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy & Security</h1>
      <p className="text-xs text-slate-400">Last updated: August 2026</p>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. File Encryption & Zero Storage</h2>
        <p>AI Success Hub prioritizes end-to-end user privacy. PDF merging, splitting, and image resizing occur directly in your browser memory.</p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. AI Data Protection</h2>
        <p>Text snippets processed through Google Gemini API endpoints are encrypted in transit via SSL/TLS and never used for model training.</p>
      </div>
    </div>
  );
};
