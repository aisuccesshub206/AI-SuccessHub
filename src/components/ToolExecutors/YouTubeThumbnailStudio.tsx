import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Download,
  Loader2,
  Copy,
  Check,
  Tv,
  Smartphone,
  RefreshCw,
  Trash2,
  History,
  Maximize2,
  X,
  Flame,
  AlertCircle,
  Layers,
  Smile,
  Layout,
  Palette,
  Eye,
  Sliders,
  CheckCircle2,
  Video,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface YouTubeThumbnailStudioProps {
  user?: UserProfile;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

interface ThumbnailHistoryItem {
  id: string;
  videoTitle: string;
  hookText: string;
  subjectPlacement: string;
  facialExpression: string;
  style: string;
  aspectRatio: string;
  quality: string;
  imageUrl: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'ais_youtube_thumbnail_studio_history';

export const YouTubeThumbnailStudio: React.FC<YouTubeThumbnailStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Main form state
  const [videoTitle, setVideoTitle] = useState(() => {
    try {
      const transferred = sessionStorage.getItem('ais_transfer_prompt');
      if (transferred) {
        sessionStorage.removeItem('ais_transfer_prompt');
        return transferred;
      }
    } catch {}
    return '';
  });
  const [hookText, setHookText] = useState('INSANE RESULTS!');
  const [subjectPlacement, setSubjectPlacement] = useState<string>('Right Side (Face on Right, Text on Left)');
  const [facialExpression, setFacialExpression] = useState<string>('Shocked / Wide Open Eyes');
  const [contrastStyle, setContrastStyle] = useState<string>('Viral Neon Glow (Cyan & Magenta)');
  const [style, setStyle] = useState<string>('Cinematic');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [quality, setQuality] = useState<'1080p' | '1440p' | '2160p'>('2160p');
  const [channelName, setChannelName] = useState('Creator Studio Pro');

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingText, setLoadingText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  // Feedback & UI state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');

  // History state
  const [history, setHistory] = useState<ThumbnailHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save thumbnail history:', e);
    }
  }, [history]);

  // Hook presets
  const hookPresets = [
    'INSANE RESULTS!',
    "DON'T DO THIS!",
    '100 DAYS',
    'I WAS WRONG...',
    'IT FINALLY HAPPENED',
    'SECRET REVEALED',
    'DO NOT BUY',
    'THE TRUTH ABOUT...',
  ];

  // Popular CTR ideas
  const popularCtrIdeas = [
    'I Spent 100 Days in Minecraft Hardcore Survival With 1 Heart',
    'How I Scaled an AI Business from $0 to $50,000/Month in 30 Days',
    'Testing the World’s Most Expensive Futuristic Cyberpunk Gadget',
    'Why 99% of Developers Are Prompting AI Completely Wrong',
    'Inside a Secret $120,000,000 Underground Nuclear Bunker Tour',
    '10 Uncomfortable Morning Habits That Will Make You Rich in 2026',
  ];

  // Subject Placement Options
  const placementOptions = [
    { label: 'Right Side (Classic YouTube)', desc: 'Face on Right, Text on Left', value: 'Right Side (Face on Right, Text on Left)' },
    { label: 'Left Side', desc: 'Face on Left, Text on Right', value: 'Left Side (Face on Left, Text on Right)' },
    { label: 'Centered Hero', desc: 'Dramatic subject in dead center', value: 'Centered Hero (Dramatic Focal Point)' },
    { label: 'Split Comparison', desc: 'Before vs After / Versus format', value: 'Split Screen Comparison (Versus / Before and After)' },
  ];

  // Expressions
  const expressionOptions = [
    { label: 'Shocked / O-M-G', desc: 'Wide open mouth, intense expression', value: 'Shocked / Wide Open Eyes' },
    { label: 'Excited / Big Smile', desc: 'High energy, happy hype', value: 'Excited / Hyped Smile' },
    { label: 'Serious / Mysterious', desc: 'Intense cold stare, dramatic brow', value: 'Serious / Intense Stare' },
    { label: 'Angry / Challenging', desc: 'Fierce, competitive look', value: 'Angry / Determined' },
    { label: 'Curious / Thinking', desc: 'Puzzled, pointing at subject', value: 'Curious / Thinking' },
    { label: 'No Face (Object/Tech Only)', desc: 'Clean product/environment focus', value: 'None / Object only' },
  ];

  // Visual Contrast & Aura
  const contrastOptions = [
    { label: 'Viral Neon Glow', desc: 'Cyan & magenta rim light aura', value: 'Viral Neon Glow (Cyan & Magenta)' },
    { label: 'Dark Mystery Vignette', desc: 'Shadows with laser-sharp highlights', value: 'Dark Mystery Vignette with Rim Light' },
    { label: 'Explosive Drama & Sparks', desc: 'Warm cinematic particles and ember glow', value: 'Explosive Action Drama and Sparks' },
    { label: 'Clean Studio Pro', desc: 'Modern high-key tech lighting', value: 'Clean High-Key Studio Tech Lighting' },
    { label: 'Bold Comic Pop', desc: 'Vivid comic outlines & saturated pop art', value: 'Bold High-Contrast Comic Pop Art' },
  ];

  // Styles
  const styleOptions = [
    { name: 'Cinematic', desc: 'Movie-grade anamorphic lighting, shallow depth of field' },
    { name: 'Hyper Realistic', desc: 'Unreal Engine 5 crisp render, 4K micro-textures' },
    { name: 'Stylized 3D', desc: 'Vibrant 3D animated character render, volumetric lighting' },
    { name: 'Anime / Manga', desc: 'High-energy vivid anime artwork with aura effects' },
    { name: 'Gaming Esports', desc: 'Intense competitive aura, high contrast neon colors' },
    { name: 'Bold Graphic', desc: 'Punchy saturated colors with sharp subject outlines' },
  ];

  const handleGenerate = async () => {
    setApiError(null);
    if (!videoTitle.trim()) {
      setValidationError('Please enter your YouTube video title or topic.');
      return;
    }

    if (user && user.usage && user.usage.aiRequestsToday >= user.usage.aiRequestsLimitDaily) {
      if (onTriggerUsageLimit) onTriggerUsageLimit('ai_daily');
      setApiError(`Daily AI limit reached (${user.usage.aiRequestsToday}/${user.usage.aiRequestsLimitDaily}) for your ${user.plan} plan.`);
      return;
    }

    setGenerating(true);
    setLoadingStep(1);
    setLoadingText('Analyzing video topic for high click-through-rate...');

    const progressInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev === 1) {
          setLoadingText(`Framing ${subjectPlacement} with ${facialExpression}...`);
          return 2;
        } else if (prev === 2) {
          setLoadingText(`Applying ${contrastStyle} rim lighting & 16:9 composition...`);
          return 3;
        } else if (prev === 3) {
          setLoadingText(`Rendering ${quality} YouTube-optimized canvas...`);
          return 4;
        }
        return prev;
      });
    }, 1800);

    try {
      const response = await aiService.generateImage({
        user,
        tool: 'thumbnail-generator',
        isThumbnail: true,
        prompt: videoTitle.trim(),
        hookText: hookText.trim(),
        subjectPlacement,
        facialExpression,
        contrastStyle,
        style,
        aspectRatio,
        quality,
      });

      clearInterval(progressInterval);

      if (!response.success) {
        if (response.reason === 'ai_daily' || response.reason === 'ai_monthly') {
          if (onTriggerUsageLimit) onTriggerUsageLimit(response.reason);
        }
        setApiError(response.error || 'Failed to generate YouTube thumbnail.');
        return;
      }

      if (response.data?.imageUrl) {
        const imageUrl = response.data.imageUrl;
        setGeneratedImageUrl(imageUrl);
        setGeneratedPrompt(`${videoTitle} - Hook: "${hookText}" | ${subjectPlacement} | ${facialExpression}`);

        const newHistoryItem: ThumbnailHistoryItem = {
          id: `thumb_${Date.now()}`,
          videoTitle: videoTitle.trim(),
          hookText: hookText.trim(),
          subjectPlacement,
          facialExpression,
          style,
          aspectRatio,
          quality,
          imageUrl,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
        onLogFileProcess(`yt_thumb_${aspectRatio.replace(':', 'x')}_${Date.now()}.png`, videoTitle.length, 1024 * 850, 'YouTube Thumbnail Generator');
        if (onIncrementAiUsage) onIncrementAiUsage();
      } else {
        setApiError('Thumbnail generation returned no image data.');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setApiError(`Communication error: ${err.message || 'Failed to reach AI generator'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (imgUrl: string = generatedImageUrl || '', fileName = 'youtube_thumbnail.png') => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Tools Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Thumbnail Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Saved ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Title (Distinct YouTube Red & Dark Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-rose-700 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-red-600/30">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 backdrop-blur-md text-xs font-bold text-red-100 border border-red-400/30">
              <Tv className="w-3.5 h-3.5 text-yellow-300" />
              <span>YouTube Algorithm & CTR Optimizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              YouTube Thumbnail Generator
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed">
              Create high-click-potential YouTube thumbnails, Shorts covers, and attention-grabbing video artwork with customizable subject placement, facial expressions, and live feed preview.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <div className="p-2.5 rounded-xl bg-red-600/30 text-red-400">
              <Flame className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">CTR Boosted Engine</div>
              <div className="text-[11px] text-red-200">High-contrast, bold composition</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Generator View */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
              
              {/* 1. YouTube Video Title & Topic */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  YouTube Video Title or Topic <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 'How I built a $50K/mo AI app from my bedroom' or '100 Days Hardcore Survival in Minecraft'"
                  value={videoTitle}
                  onChange={(e) => {
                    setVideoTitle(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className={`w-full p-4 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                    validationError
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                />
                {validationError && (
                  <p className="text-xs text-red-500 font-semibold">{validationError}</p>
                )}

                {/* Popular CTR Ideas */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                    Popular CTR Ideas (Click to populate):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularCtrIdeas.map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setVideoTitle(idea);
                          if (validationError) setValidationError(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all truncate max-w-[280px]"
                      >
                        + {idea}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Thumbnail Hook Text Overlay */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Thumbnail Text Hook (Short & Punchy)
                  </label>
                  <span className="text-[11px] text-slate-400">Keep under 4 words</span>
                </div>
                <input
                  type="text"
                  value={hookText}
                  onChange={(e) => setHookText(e.target.value)}
                  placeholder="e.g. INSANE RESULTS, DON'T DO THIS, 100 DAYS"
                  className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hookPresets.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHookText(h)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                        hookText === h
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Subject Placement */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Subject Placement
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {placementOptions.map((opt) => {
                    const isSelected = subjectPlacement === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSubjectPlacement(opt.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-200 ring-2 ring-red-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Facial Expression Controls */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Facial Expression (If person is included)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {expressionOptions.map((expr) => {
                    const isSelected = facialExpression === expr.value;
                    return (
                      <button
                        key={expr.value}
                        type="button"
                        onClick={() => setFacialExpression(expr.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{expr.label}</div>
                        <div className={`text-[9px] mt-0.5 truncate ${isSelected ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>{expr.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Visual Contrast & Lighting Aura */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Contrast & Lighting Aura
                </label>
                <select
                  value={contrastStyle}
                  onChange={(e) => setContrastStyle(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {contrastOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} — {c.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Visual Style & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                    Visual Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {styleOptions.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.desc})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        aspectRatio === '16:9'
                          ? 'bg-red-600 text-white font-bold border-red-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">16:9 Landscape</div>
                      <div className="text-[10px] opacity-80">YouTube Video</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        aspectRatio === '9:16'
                          ? 'bg-red-600 text-white font-bold border-red-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">9:16 Vertical</div>
                      <div className="text-[10px] opacity-80">Shorts / TikTok</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 7. Output Quality */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                  Output Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '1080p', label: '1080p HD', tag: 'Fast' },
                    { value: '1440p', label: '1440p 2K', tag: 'Crisp' },
                    { value: '2160p', label: '2160p 4K', tag: 'Ultra HD' },
                  ].map((q) => {
                    const isSelected = quality === q.value;
                    return (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => setQuality(q.value as any)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold border-transparent shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{q.label}</div>
                        <div className="text-[10px] opacity-75">{q.tag}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Banner */}
              {apiError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-bold">Thumbnail Generation Error</div>
                    <p className="text-[11px] text-red-600 dark:text-red-400">{apiError}</p>
                  </div>
                  <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Primary Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-4 px-6 font-black text-sm text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:opacity-95 disabled:opacity-50 rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Rendering 16:9 Thumbnail...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-yellow-300" />
                    <span>Generate AI Thumbnail (4K)</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Right Column: Live YouTube Feed Simulator & Output (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              
              {/* Header with Device Toggle */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                    <Tv className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    YouTube Feed Preview
                  </h2>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Generating Animation */}
              {generating ? (
                <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-6 bg-slate-950 rounded-2xl border border-red-500/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-rose-600 animate-spin p-1">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                      <Flame className="w-7 h-7 text-red-400 animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-white">Rendering YouTube Thumbnail</div>
                    <p className="text-xs text-red-300 font-medium animate-pulse">{loadingText}</p>
                  </div>
                  <div className="flex items-center gap-1.5 w-full max-w-xs p-1 bg-white/5 rounded-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                          loadingStep >= step ? 'bg-red-500 shadow-sm shadow-red-500/50' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : generatedImageUrl ? (
                /* Generated YouTube Video Simulation Card */
                <div className="space-y-4 animate-in fade-in">
                  
                  {/* YouTube Feed Card Simulation */}
                  <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                    <div className="relative group">
                      <div className={`w-full overflow-hidden ${aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[440px]' : 'aspect-video'}`}>
                        <img
                          src={generatedImageUrl}
                          alt={videoTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Video timestamp badge (14:28) */}
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-white font-mono shadow-md">
                        14:28
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10">
                        <Flame className="w-3 h-3 text-red-500" />
                        <span>CTR Score 97.2%</span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 bg-red-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase shadow-md">
                        {quality} 4K
                      </div>

                      {/* Fullscreen view button */}
                      <button
                        onClick={() => setFullscreenModal(true)}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs"
                      >
                        <Maximize2 className="w-5 h-5" />
                        <span>Expand Preview</span>
                      </button>
                    </div>

                    {/* Simulated YouTube Feed Details */}
                    <div className="p-3.5 flex items-start gap-3 bg-slate-900/90 border-t border-slate-800">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md">
                        YT
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                          {videoTitle || 'Your High CTR YouTube Video Title Here'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">{channelName}</span>
                          <CheckCircle2 className="w-3 h-3 text-slate-400 inline" />
                          <span>•</span>
                          <span>1.4M views</span>
                          <span>•</span>
                          <span>3 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleDownload(generatedImageUrl, `youtube_thumbnail_${Date.now()}.png`)}
                      className="py-3 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download 16:9</span>
                    </button>

                    <button
                      onClick={() => handleCopyPrompt(generatedPrompt)}
                      className="py-3 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPrompt ? 'Copied' : 'Copy CTR Prompt'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate Thumbnail</span>
                  </button>

                </div>
              ) : (
                /* Empty Canvas State */
                <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="p-4 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500">
                    <Tv className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Live Feed Simulator Ready
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter your YouTube video title and click "Generate AI Thumbnail" to see how your thumbnail performs in the YouTube feed.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Saved YouTube Thumbnails
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thumbnails generated on this device saved locally in your browser.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all saved thumbnail history?')) setHistory([]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No saved YouTube thumbnails yet. Generate one to see it here!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group relative"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.videoTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      {item.aspectRatio}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.videoTitle}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Hook: "{item.hookText}"</span>
                      <span>{item.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setVideoTitle(item.videoTitle);
                          setHookText(item.hookText);
                          setGeneratedImageUrl(item.imageUrl);
                          setActiveTab('generator');
                        }}
                        className="flex-1 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-lg text-xs font-bold hover:bg-red-100"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDownload(item.imageUrl, `thumbnail_${item.id}.png`)}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setHistory((prev) => prev.filter((h) => h.id !== item.id))}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-red-500 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {fullscreenModal && generatedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-white">Full-Resolution YouTube Thumbnail</h3>
              </div>
              <button
                onClick={() => setFullscreenModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex items-center justify-center bg-slate-950">
              <img
                src={generatedImageUrl}
                alt="Fullscreen Preview"
                referrerPolicy="no-referrer"
                className="max-h-[70vh] rounded-xl object-contain shadow-2xl"
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{videoTitle}</span>
              <button
                onClick={() => handleDownload(generatedImageUrl)}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-red-500"
              >
                <Download className="w-4 h-4" /> Download 4K
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
