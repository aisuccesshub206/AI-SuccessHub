import React, { useState } from 'react';
import { BlogSettings } from '../../types/blog';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Settings,
  Target,
  Globe,
  Key,
  FileText,
  Loader2,
  Wand2,
} from 'lucide-react';

interface BlogSimpleInputProps {
  topic: string;
  setTopic: (val: string) => void;
  settings: BlogSettings;
  setSettings: (val: BlogSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const BlogSimpleInput: React.FC<BlogSimpleInputProps> = ({
  topic,
  setTopic,
  settings,
  setSettings,
  onGenerate,
  isGenerating,
}) => {
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const updateSetting = <K extends keyof BlogSettings>(key: K, value: BlogSettings[K]) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const SAMPLE_TOPICS = [
    'Best AI tools for small businesses in 2026',
    'How to build a personal brand on LinkedIn without paid ads',
    'Complete guide to remote team management & asynchronous communication',
    '10 proven strategies to reduce customer churn in B2B SaaS',
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Primary Input Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Blog Writer Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter a topic to generate a complete, SEO-optimized, human-grade blog post.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
            showSettingsDrawer
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Blog Settings</span>
          {showSettingsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Topic Input Field */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
          Topic / Blog Idea *
        </label>
        <div className="relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Example: Best AI tools for small businesses in 2026"
            className="w-full px-4 py-3.5 pr-10 text-base font-medium rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-all shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Wand2 className="w-5 h-5" />
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Try an example:</span>
          {SAMPLE_TOPICS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setTopic(sample)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Target Audience & Keyword Fields Toggle */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => setShowOptionalFields(!showOptionalFields)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          {showOptionalFields ? 'Hide Optional Parameters' : '+ Add Target Audience, Website Name or Keywords (Optional)'}
          {showOptionalFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showOptionalFields && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                Target Audience
              </label>
              <input
                type="text"
                value={settings.targetAudienceOptional || ''}
                onChange={(e) => updateSetting('targetAudienceOptional', e.target.value)}
                placeholder="e.g. Small business owners, CTOs, Marketing teams"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                Website / Business Name
              </label>
              <input
                type="text"
                value={settings.websiteNameOptional || ''}
                onChange={(e) => updateSetting('websiteNameOptional', e.target.value)}
                placeholder="e.g. AI Success Hub"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                Main Keyword
              </label>
              <input
                type="text"
                value={settings.mainKeywordOptional || ''}
                onChange={(e) => updateSetting('mainKeywordOptional', e.target.value)}
                placeholder="e.g. best AI tools for small business"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Additional Instructions
              </label>
              <input
                type="text"
                value={settings.additionalInstructionsOptional || ''}
                onChange={(e) => updateSetting('additionalInstructionsOptional', e.target.value)}
                placeholder="e.g. Include a comparison table and practical tips"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Optional Settings Drawer / Panel */}
      {showSettingsDrawer && (
        <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            Article Configuration Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Writing Tone</label>
              <select
                value={settings.tone}
                onChange={(e) => updateSetting('tone', e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Conversational">Conversational</option>
                <option value="Expert">Expert & Authoritative</option>
                <option value="Persuasive">Persuasive</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Article Length</label>
              <select
                value={settings.length}
                onChange={(e) => updateSetting('length', e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Short">Short (~800 words)</option>
                <option value="Medium">Medium (~1,200 words)</option>
                <option value="Long">Long (~1,800 words)</option>
                <option value="Comprehensive">Comprehensive (~2,500 words)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
              <select
                value={settings.audience}
                onChange={(e) => updateSetting('audience', e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Beginners">Beginners</option>
                <option value="Professionals">Professionals</option>
                <option value="Business Owners">Business Owners</option>
                <option value="Students">Students</option>
                <option value="General Audience">General Audience</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="English">English (US)</option>
                <option value="English UK">English (UK)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Portuguese">Portuguese</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Action Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || !topic.trim()}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI is Architecting & Writing Your SEO Blog...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Complete Blog Post</span>
          </>
        )}
      </button>
    </div>
  );
};
