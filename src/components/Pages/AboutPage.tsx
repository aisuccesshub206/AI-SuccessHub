import React from 'react';
import { Sparkles, ShieldCheck, Zap, Globe, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          About AI Success Hub
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Democratizing high-performance PDF manipulation and artificial intelligence for over 1.2 million professionals globally.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
        <p>
          AI Success Hub was engineered to solve a fundamental productivity gap: professionals were forced to jump between separate tools for merging PDFs, compressing documents, extracting page text, and generating AI content summaries.
        </p>
        <p>
          We unified these capabilities into a single, lightning-fast web application powered by browser WebAssembly and Google Gemini 3.6 Flash models.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
            <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <div className="font-bold text-slate-900 dark:text-white">Privacy First</div>
            <div className="text-xs text-slate-500">Local browser processing</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
            <Zap className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <div className="font-bold text-slate-900 dark:text-white">Sub-Second Speed</div>
            <div className="text-xs text-slate-500">Instant client execution</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
            <Globe className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
            <div className="font-bold text-slate-900 dark:text-white">Global Scale</div>
            <div className="text-xs text-slate-500">50+ languages supported</div>
          </div>
        </div>
      </div>
    </div>
  );
};
