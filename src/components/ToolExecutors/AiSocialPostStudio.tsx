import React, { useState } from 'react';
import {
  Share2,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Image as ImageIcon,
  Send,
  Sliders,
  Eye,
  Hash,
  Download,
  Flame,
  MessageCircle,
  Heart,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export type SocialPlatformId = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'twitter' | 'linkedin' | 'pinterest' | 'threads';

interface PlatformMeta {
  id: SocialPlatformId;
  name: string;
  color: string;
  badge: string;
  bgGradient: string;
}

const PLATFORMS: PlatformMeta[] = [
  { id: 'instagram', name: 'Instagram', color: 'from-pink-500 via-purple-500 to-orange-400', badge: 'Reels & Carousels', bgGradient: 'bg-pink-950/30 border-pink-500/30' },
  { id: 'tiktok', name: 'TikTok', color: 'from-cyan-400 via-teal-500 to-emerald-400', badge: 'Viral Shorts', bgGradient: 'bg-cyan-950/30 border-cyan-500/30' },
  { id: 'linkedin', name: 'LinkedIn', color: 'from-blue-600 to-indigo-600', badge: 'Thought Leadership', bgGradient: 'bg-blue-950/30 border-blue-500/30' },
  { id: 'twitter', name: 'X / Twitter', color: 'from-slate-700 via-slate-900 to-black', badge: 'Threads & Hot Takes', bgGradient: 'bg-slate-900/60 border-slate-700/50' },
  { id: 'facebook', name: 'Facebook', color: 'from-blue-500 to-cyan-500', badge: 'Community Engagement', bgGradient: 'bg-blue-950/30 border-blue-500/30' },
  { id: 'youtube', name: 'YouTube', color: 'from-red-600 to-pink-600', badge: 'Community & Shorts', bgGradient: 'bg-red-950/30 border-red-500/30' },
  { id: 'pinterest', name: 'Pinterest', color: 'from-red-500 to-rose-500', badge: 'Visual Search', bgGradient: 'bg-rose-950/30 border-rose-500/30' },
  { id: 'threads', name: 'Threads', color: 'from-zinc-600 to-zinc-900', badge: 'Text Discussions', bgGradient: 'bg-zinc-900/60 border-zinc-700/50' },
];

const CONTENT_GOALS = [
  { id: 'viral', label: 'Go Viral', desc: 'Maximize shares & curiosity hooks' },
  { id: 'engagement', label: 'Get Engagement', desc: 'Spur comments, polls & replies' },
  { id: 'followers', label: 'Get Followers', desc: 'Build subscriber loyalty' },
  { id: 'sell', label: 'Sell a Product', desc: 'High converting social sales copy' },
  { id: 'leads', label: 'Generate Leads', desc: 'Drive traffic to landing page/bio link' },
  { id: 'educate', label: 'Educate & Value', desc: 'Step-by-step breakdown or tips' },
  { id: 'personal_brand', label: 'Build Personal Brand', desc: 'Storytelling & authentic tone' },
  { id: 'announce', label: 'Announce Something', desc: 'Exciting feature or event news' },
];

interface GeneratedContentItem {
  platform: SocialPlatformId;
  hook: string;
  alternativeHooks: string[];
  mainPost: string;
  cta: string;
  primaryHashtags: string[];
  secondaryHashtags: string[];
  nicheHashtags: string[];
  visualConcept: string;
  contentAngle: string;
}

interface AiSocialPostStudioProps {
  user: UserProfile;
  onBack?: () => void;
  onLogFileProcess?: (tool: string, detail: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly' | 'storage') => void;
  onOpenImageStudioWithPrompt?: (prompt: string) => void;
}

export const AiSocialPostStudio: React.FC<AiSocialPostStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
  onOpenImageStudioWithPrompt,
}) => {
  const { inputLanguage, outputLanguage, setInputLanguage, setOutputLanguage, languages } = useLanguage();

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>(['instagram', 'linkedin']);
  const [topicInput, setTopicInput] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('viral');
  const [webTrendsEnabled, setWebTrendsEnabled] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [activePreviewPlatform, setActivePreviewPlatform] = useState<SocialPlatformId>('instagram');
  const [webInsights, setWebInsights] = useState<{ topicAngle: string; searchIntent: string; keyDiscussionPoints: string[] } | null>(null);
  const [results, setResults] = useState<Record<SocialPlatformId, GeneratedContentItem> | null>(null);

  const togglePlatform = (id: SocialPlatformId) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        const next = selectedPlatforms.filter((p) => p !== id);
        setSelectedPlatforms(next);
        if (activePreviewPlatform === id) setActivePreviewPlatform(next[0]);
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
      setActivePreviewPlatform(id);
    }
  };

  const handleGenerate = () => {
    if (!topicInput.trim()) return;

    if (onIncrementAiUsage) onIncrementAiUsage();
    setIsGenerating(true);

    setTimeout(() => {
      // Simulate intelligent web insights analysis
      if (webTrendsEnabled) {
        setWebInsights({
          topicAngle: `High-curiosity angle blending current industry trends around "${topicInput.slice(0, 30)}..."`,
          searchIntent: 'Users are actively seeking actionable shortcuts, tools, and real-world results.',
          keyDiscussionPoints: [
            'How AI tools are democratizing content production',
            'Time-saving statistics and ROI proof points',
            'Step-by-step framework instead of vague advice',
          ],
        });
      } else {
        setWebInsights(null);
      }

      const generated: Record<SocialPlatformId, GeneratedContentItem> = {} as any;

      selectedPlatforms.forEach((p) => {
        generated[p] = createMockPlatformContent(p, topicInput, selectedGoal, outputLanguage);
      });

      setResults(generated);
      setIsGenerating(false);
      if (onLogFileProcess) onLogFileProcess('AI Social Post Generator', `Generated content for ${selectedPlatforms.join(', ')}`);
    }, 1200);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5 text-purple-400" /> Professional Social Content Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Social <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300">Post Generator</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Create platform-native viral hooks, structured posts, CTAs, and hashtags tailored to Instagram, TikTok, LinkedIn, X, YouTube, and Threads.
            </p>
          </div>

          {/* Language Selector Toolbar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-white/10 p-3 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">
              <Globe className="w-3.5 h-3.5 inline mr-1 text-purple-400" /> Input:
            </div>
            <select
              value={inputLanguage}
              onChange={(e) => setInputLanguage(e.target.value as any)}
              className="bg-slate-800 text-white text-xs rounded-xl px-2.5 py-1.5 border border-white/10 focus:outline-none focus:border-purple-500"
            >
              {languages.map((l) => (
                <option key={`in-${l.code}`} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>

            <span className="text-slate-600">→</span>

            <div className="text-xs text-slate-400 font-medium">Output:</div>
            <select
              value={outputLanguage}
              onChange={(e) => setOutputLanguage(e.target.value as any)}
              className="bg-purple-900/50 text-purple-200 font-semibold text-xs rounded-xl px-2.5 py-1.5 border border-purple-500/40 focus:outline-none"
            >
              {languages.map((l) => (
                <option key={`out-${l.code}`} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Config Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
          {/* STEP 1: SELECT PLATFORMS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center">1</span>
                Target Social Platforms
              </label>
              <span className="text-xs text-slate-400">Multi-select allowed</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PLATFORMS.map((p) => {
                const isSelected = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-400 text-white shadow-lg'
                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="font-bold">{p.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CONTENT INPUT */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center">2</span>
              What do you want to post about?
            </label>
            <textarea
              rows={4}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Topic, product, service, link, or short idea (e.g. 'Write a viral post about my new AI productivity app that saves 10 hours a week')..."
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-500">Quick ideas:</span>
              <button
                type="button"
                onClick={() => setTopicInput('Launch announcement for AI productivity suite saving 10 hours a week')}
                className="hover:text-purple-300 underline"
              >
                Product Launch
              </button>
              •
              <button
                type="button"
                onClick={() => setTopicInput('Top 5 common mistakes remote workers make in 2026 and how to fix them')}
                className="hover:text-purple-300 underline"
              >
                Top 5 Tips
              </button>
              •
              <button
                type="button"
                onClick={() => setTopicInput('Behind the scenes storytelling of building a tech startup from scratch')}
                className="hover:text-purple-300 underline"
              >
                Founder Story
              </button>
            </div>
          </div>

          {/* STEP 3: CONTENT GOAL */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-black flex items-center justify-center">3</span>
              Primary Content Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGoal(g.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    selectedGoal === g.id
                      ? 'bg-purple-950/80 border-purple-400 text-white shadow-md'
                      : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="font-bold">{g.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* TREND / WEB-AWARE MODE TOGGLE */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Trend / Web-Aware Mode</div>
                <div className="text-[10px] text-slate-400">Incorporate real search intent & trending angles</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={webTrendsEnabled}
              onChange={(e) => setWebTrendsEnabled(e.target.checked)}
              className="w-4 h-4 accent-purple-500 cursor-pointer"
            />
          </div>

          {/* GENERATE ACTION BUTTON */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !topicInput.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-600 to-indigo-500 text-white font-extrabold text-base shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> Crafting Platform Posts...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Social Content Studio
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output & Platform Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* WEB INSIGHTS (IF AVAILABLE) */}
          {webInsights && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-500/30 text-xs space-y-2 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-indigo-300">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> Web Insights & Search Intent Included
              </div>
              <p className="text-slate-300"><strong className="text-white">Angle:</strong> {webInsights.topicAngle}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {webInsights.keyDiscussionPoints.map((pt, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-900/60 border border-indigo-500/30 text-[11px] text-indigo-200">
                    • {pt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS DISPLAY */}
          {results ? (
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
              {/* Platform Preview Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
                {selectedPlatforms.map((pId) => {
                  const pMeta = PLATFORMS.find((p) => p.id === pId)!;
                  const isActive = activePreviewPlatform === pId;
                  return (
                    <button
                      key={pId}
                      onClick={() => setActivePreviewPlatform(pId)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <span>{pMeta.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Platform Result Content */}
              {results[activePreviewPlatform] && (
                <div className="space-y-6">
                  {/* Hook & Angle Box */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400" /> Primary Hook
                      </span>
                      <button
                        onClick={() => copyToClipboard(results[activePreviewPlatform].hook, 'hook')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedKey === 'hook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy Hook
                      </button>
                    </div>
                    <p className="text-sm font-extrabold text-white leading-relaxed">
                      "{results[activePreviewPlatform].hook}"
                    </p>

                    {/* Alternative Hooks */}
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400">Alternative Hooks:</span>
                      {results[activePreviewPlatform].alternativeHooks.map((ah, i) => (
                        <div key={i} className="text-xs text-slate-300 italic pl-2 border-l-2 border-purple-500/40">
                          • "{ah}"
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* REALISTIC SOCIAL PLATFORM PREVIEW CARD */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-cyan-400" /> Realistic {PLATFORMS.find((p) => p.id === activePreviewPlatform)?.name} Preview
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${results[activePreviewPlatform].mainPost}\n\n${results[activePreviewPlatform].cta}\n\n${results[activePreviewPlatform].primaryHashtags.join(' ')}`,
                            'fullPost'
                          )
                        }
                        className="text-xs text-purple-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        {copiedKey === 'fullPost' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy Complete Post
                      </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 space-y-4 shadow-xl">
                      {/* User Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{user.name}</div>
                            <div className="text-[10px] text-slate-400">
                              @{user.name.toLowerCase().replace(/\s+/g, '')} • Just now
                            </div>
                          </div>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                      </div>

                      {/* Post Body */}
                      <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {results[activePreviewPlatform].mainPost}
                      </div>

                      {/* CTA */}
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-200 text-xs font-semibold">
                        💡 {results[activePreviewPlatform].cta}
                      </div>

                      {/* Hashtags Generator Box */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5" /> Smart Hashtag Generator
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {results[activePreviewPlatform].primaryHashtags.map((h, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                              {h}
                            </span>
                          ))}
                          {results[activePreviewPlatform].secondaryHashtags.map((h, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mock Engagement Footer */}
                      <div className="flex items-center justify-between text-slate-500 text-xs pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 hover:text-pink-500 cursor-pointer" /> 1.2k</span>
                        <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 hover:text-cyan-400 cursor-pointer" /> 184</span>
                        <span className="flex items-center gap-1.5"><Share2 className="w-4 h-4 hover:text-purple-400 cursor-pointer" /> 420</span>
                        <Bookmark className="w-4 h-4 hover:text-yellow-400 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* Visual Concept & Action Bar */}
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                        <ImageIcon className="w-4 h-4 text-cyan-400" /> Visual Concept & Image Prompt
                      </div>
                      <p className="text-xs text-slate-300 max-w-lg">
                        "{results[activePreviewPlatform].visualConcept}"
                      </p>
                    </div>

                    {onOpenImageStudioWithPrompt && (
                      <button
                        type="button"
                        onClick={() => onOpenImageStudioWithPrompt(results[activePreviewPlatform].visualConcept)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" /> Generate Image
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center bg-slate-900/40 backdrop-blur-xl">
              <Share2 className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Ready to Create Social Content</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Select target platforms, enter your topic or link, and click <strong className="text-purple-300">Generate</strong> to build tailored viral posts with hashtags & previews.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function createMockPlatformContent(
  platform: SocialPlatformId,
  topic: string,
  goal: string,
  outLang: string
): GeneratedContentItem {
  const isSomali = outLang === 'so';

  if (isSomali) {
    return {
      platform,
      hook: `🚨 Halkan waxaa ku qarsan сиraha ugu weyn ee ${topic.slice(0, 35)}...`,
      alternativeHooks: [
        `Muxuu qof kastaa uga hadlayaa ${topic.slice(0, 25)} sannadkan 2026?`,
        `Haddii aad rabto inaad waqti badbaadiso, baro tillaabooyinkan.`,
      ],
      mainPost: `Haddii aad raadinaysay hab wax ku ool ah oo aad ugu guuleysato ${topic}, halkan waa 3-da tillaabo ee ugu muhiimsan:\n\n1️⃣ Qorshee Hadafkaaga oo isticmaal amarrada saxda ah.\n2️⃣ Isticmaal qalabka AI si aad u xawaareyso shaqadaada.\n3️⃣ Isku dubarid natiijooyinka si ay u noqdaan kuwo xaqiiqo ah.\n\nNatiijadu waxay kuu badbaadin doontaa saacado badan bil kasta!`,
      cta: 'U faallee ama wadaag si aad saaxiibadaa u caawiso!',
      primaryHashtags: ['#AI_Soomaalia', '#Tiknoolajiyada', '#Hormar'],
      secondaryHashtags: ['#Natiijo', '#Xirfad', '#Guul'],
      nicheHashtags: ['#SoomaaliTek', '#Business2026'],
      visualConcept: `Minimalist high contrast graphic illustrating ${topic} with golden Somali typography accents`,
      contentAngle: 'Practical, high-value educational angle',
    };
  }

  return {
    platform,
    hook: `Stop scrolling if you want to master ${topic.slice(0, 30)} in 2026... ⚡️`,
    alternativeHooks: [
      `90% of creators get ${topic.slice(0, 25)} completely wrong. Here's why:`,
      `The exact framework I used to automate ${topic.slice(0, 25)}:`,
    ],
    mainPost: `Most people overcomplicate ${topic}.\n\nHere is the exact 3-step breakdown you need to achieve high results:\n\n1. Define the core objective with strict constraints.\n2. Leverage AI tools to eliminate repetitive work.\n3. Polish the final output with human craftsmanship.\n\nSave this post before you lose it in your feed!`,
    cta: 'Which step are you taking action on today? Comment below 👇',
    primaryHashtags: [`#${platform}Growth`, '#Productivity', '#ContentCreator'],
    secondaryHashtags: ['#MarketingTips', '#AITools', '#ViralStrategy'],
    nicheHashtags: ['#SaaSGrowth', '#DigitalCreator2026'],
    visualConcept: `Clean modern isometric graphic highlighting key statistics and workflows for ${topic}`,
    contentAngle: 'Curiosity driven educational framework',
  };
}
