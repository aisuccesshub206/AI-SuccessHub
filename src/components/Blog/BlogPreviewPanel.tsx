import React, { useState } from 'react';
import { BlogArticle } from '../../types/blog';
import {
  Monitor,
  Smartphone,
  Calendar,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
  Sparkles,
} from 'lucide-react';

interface BlogPreviewPanelProps {
  article: BlogArticle;
}

export const BlogPreviewPanel: React.FC<BlogPreviewPanelProps> = ({ article }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6">
      
      {/* Device Switcher Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Live Website Article Preview
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              deviceMode === 'desktop'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop View</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              deviceMode === 'mobile'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile View</span>
          </button>
        </div>
      </div>

      {/* Preview Container Wrapper */}
      <div className={`mx-auto transition-all duration-300 ${deviceMode === 'mobile' ? 'max-w-md' : 'max-w-4xl'}`}>
        
        {/* Mock Blog Web Page Frame */}
        <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden font-sans">
          
          {/* Mock Header Navigation */}
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                B
              </div>
              <span className="tracking-tight text-sm text-slate-900 font-extrabold">
                {article.settings.websiteNameOptional || 'AI Success Blog'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-500 text-[11px]">
              <span className="hidden sm:inline hover:text-slate-900 cursor-pointer">Articles</span>
              <span className="hidden sm:inline hover:text-slate-900 cursor-pointer">Guides</span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold">Subscribe</span>
            </div>
          </div>

          {/* Main Article Content Container */}
          <div className="p-6 md:p-10 space-y-8">
            
            {/* Category Pill & Title */}
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                {article.seo.primaryKeyword || 'AI & Productivity'}
              </span>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {article.title}
              </h1>

              {/* Author & Meta Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={article.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{article.author.name}</div>
                    <div className="text-[11px] text-slate-500">{article.author.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTimeMinutes} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {article.featuredImage.url && (
              <div className="space-y-2">
                <div className="rounded-2xl overflow-hidden shadow-lg h-[260px] md:h-[380px]">
                  <img
                    src={article.featuredImage.url}
                    alt={article.featuredImage.altText}
                    className="w-full h-full object-cover"
                  />
                </div>
                {article.featuredImage.caption && (
                  <p className="text-xs text-slate-500 text-center italic">
                    {article.featuredImage.caption}
                  </p>
                )}
              </div>
            )}

            {/* Rendered HTML Article Body */}
            <div
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              className="prose max-w-none text-slate-800 text-base leading-relaxed space-y-4 font-sans"
            />

            {/* Rendered Interactive FAQ Section */}
            {article.faqs && article.faqs.length > 0 && (
              <div className="pt-8 border-t border-slate-200 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {article.faqs.map((faq, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-4 text-left font-bold text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3"
                      >
                        <span>{faq.question}</span>
                        {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {openFaqIndex === idx && (
                        <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mock Article Footer */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 cursor-pointer hover:text-indigo-600" />
                <span>Save to reading list</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 font-semibold">
                <Share2 className="w-4 h-4" />
                <span>Share Article</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
