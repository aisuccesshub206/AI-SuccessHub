import React from 'react';
import { BlogArticle } from '../../types/blog';
import {
  Brain,
  ShieldCheck,
  ListOrdered,
  Link,
  Target,
  FileCheck,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface BlogExpertModeProps {
  article: BlogArticle;
  isExpertEnabled: boolean;
  onToggleExpert: (enabled: boolean) => void;
}

export const BlogExpertMode: React.FC<BlogExpertModeProps> = ({
  article,
  isExpertEnabled,
  onToggleExpert,
}) => {
  const expert = article.expertData;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Expert AI Content Strategy & SEO Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Advanced SEO breakdown, snippet engineering, gap analysis, and link strategy (Hidden by default).
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isExpertEnabled}
            onChange={(e) => onToggleExpert(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">
            {isExpertEnabled ? 'Expert Mode ON' : 'Off'}
          </span>
        </label>
      </div>

      {/* Expert Strategy Panels */}
      {isExpertEnabled && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* 1. Keyword Strategy & Featured Snippet Candidate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Keyword Strategy & Intent
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {expert.keywordStrategy}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Featured Snippet Opportunity
              </span>
              <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                {expert.featuredSnippetOpportunity}
              </p>
            </div>

          </div>

          {/* 2. Content Outline Structure Tree */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-indigo-500" />
              Content Outline Architecture
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {expert.contentOutline.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Link Opportunities & Content Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Internal Links */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Link className="w-4 h-4" />
                Recommended Internal Links
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {expert.internalLinkOpportunities.map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>{link}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* External Citations */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4" />
                Authoritative Citation References
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {expert.externalReferences.map((ref, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-teal-500">•</span>
                    <span>{ref}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
