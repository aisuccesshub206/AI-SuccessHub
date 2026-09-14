import React from 'react';
import { BlogArticle, BlogSeoData } from '../../types/blog';
import {
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Key,
  Globe,
  Tag,
  BarChart2,
  AlertCircle,
} from 'lucide-react';

interface BlogSeoPanelProps {
  article: BlogArticle;
  onChange: (updated: BlogArticle) => void;
  onOptimizeSeo: () => void;
  isOptimizing: boolean;
}

export const BlogSeoPanel: React.FC<BlogSeoPanelProps> = ({
  article,
  onChange,
  onOptimizeSeo,
  isOptimizing,
}) => {
  const seo = article.seo;

  const updateSeo = <K extends keyof BlogSeoData>(key: K, value: BlogSeoData[K]) => {
    onChange({
      ...article,
      seo: {
        ...article.seo,
        [key]: value,
      },
    });
  };

  const seoTitleLength = seo.seoTitle?.length || 0;
  const metaDescLength = seo.metaDescription?.length || 0;

  // Calculate dynamic SEO Score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      
      {/* SEO Score Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center min-w-[80px] ${getScoreColor(seo.seoScore)}`}>
            <span className="text-2xl font-black">{seo.seoScore}</span>
            <span className="text-[10px] font-bold tracking-wider uppercase">SEO SCORE</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" />
              Search Engine Optimization (SEO)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fine-tune meta tags, keyword placement, and search engine intent to maximize organic reach.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOptimizeSeo}
          disabled={isOptimizing}
          className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>{isOptimizing ? 'Optimizing Tags...' : 'AI Auto-Optimize SEO'}</span>
        </button>
      </div>

      {/* Main SEO Metadata Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Meta Tags & Keyword Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            Meta Tags & Google Search Appearance
          </h4>

          {/* SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SEO Meta Title</label>
              <span className={`text-[11px] font-mono ${seoTitleLength > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                {seoTitleLength} / 60 chars
              </span>
            </div>
            <input
              type="text"
              value={seo.seoTitle}
              onChange={(e) => updateSeo('seoTitle', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Meta Description</label>
              <span className={`text-[11px] font-mono ${metaDescLength > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                {metaDescLength} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={seo.metaDescription}
              onChange={(e) => updateSeo('metaDescription', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* URL Slug */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Slug</label>
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden px-3 py-2 text-xs text-slate-500">
              <span className="font-mono text-slate-400">https://yourdomain.com/blog/</span>
              <input
                type="text"
                value={seo.suggestedSlug}
                onChange={(e) => updateSeo('suggestedSlug', e.target.value)}
                className="w-full bg-transparent text-slate-900 dark:text-white font-mono font-bold focus:outline-none ml-1"
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              Primary Keyword
            </label>
            <input
              type="text"
              value={seo.primaryKeyword}
              onChange={(e) => updateSeo('primaryKeyword', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400"
            />
          </div>

          {/* Secondary Keywords */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Secondary Keywords (Comma separated)
            </label>
            <input
              type="text"
              value={seo.secondaryKeywords.join(', ')}
              onChange={(e) => updateSeo('secondaryKeywords', e.target.value.split(',').map((s) => s.trim()))}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Google Search Snippet Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Google Search Preview</span>
            <div className="text-xs text-emerald-600 font-mono truncate">
              https://yourdomain.com/blog/{seo.suggestedSlug || 'article'}
            </div>
            <div className="text-base font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer leading-snug">
              {seo.seoTitle || article.title}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {seo.metaDescription || 'No meta description provided.'}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive SEO Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
            SEO Audit & Content Health Checklist
          </h4>

          <div className="space-y-3">
            {seo.checklist.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
              >
                {item.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
