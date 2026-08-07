import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  ArrowLeft,
  Download,
  Loader2,
  Copy,
  Check,
  Tv,
  Smartphone,
  Instagram,
  RefreshCw,
  Trash2,
  History,
  Maximize2,
  X,
  Zap,
  Flame,
  AlertCircle,
  Sliders,
  Layers,
  Star,
  CheckCircle2,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface AiImageStudioProps {
  user?: UserProfile;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

interface HistoryItem {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  quality: string;
  imageUrl: string;
  createdAt: string;
}

const LOCAL_STORAGE_HISTORY_KEY = 'ais_thumbnail_generator_history';

export const AiImageStudio: React.FC<AiImageStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Main form state
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [style, setStyle] = useState<string>('Cinematic');
  const [quality, setQuality] = useState<'HD' | '2K' | '4K' | '8K'>('4K');

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
  const [copiedLink, setCopiedLink] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to local storage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save thumbnail history:', e);
    }
  }, [history]);

  // Available Styles (8 required options)
  const stylesList = [
    { name: 'Cinematic', desc: 'Movie-grade lighting, shallow depth of field, anamorphic flare', icon: '🎬' },
    { name: 'Hyper Realistic', desc: 'Unreal Engine 5 render, 8K textures, studio lighting', icon: '📸' },
    { name: '3D Pixar', desc: 'Vibrant 3D animated character style, soft volumetric shadows', icon: '🎨' },
    { name: 'Anime', desc: 'Makoto Shinkai style, vivid sky, high-detail anime artwork', icon: '⚡' },
    { name: 'Gaming', desc: 'Esports thumbnail style, intense neon glowing aura, high contrast', icon: '🎮' },
    { name: 'Luxury Product', desc: 'Sleek dark obsidian backdrop, gold accents, studio rim light', icon: '💎' },
    { name: 'ASMR', desc: 'Warm cozy bokeh lighting, intimate macro focus, soothing mood', icon: '🎧' },
    { name: 'Cartoon', desc: 'Bold comic outlines, vibrant pop art colors, expressive style', icon: '✏️' },
  ];

  // Aspect Ratios (3 required options)
  const aspectRatiosList = [
    { value: '16:9', label: '16:9 Widescreen', tag: 'YouTube Main', icon: Tv },
    { value: '9:16', label: '9:16 Vertical', tag: 'Shorts / TikTok / Reels', icon: Smartphone },
    { value: '1:1', label: '1:1 Square', tag: 'Instagram / Feed', icon: Instagram },
  ];

  // Quality settings (4 required options)
  const qualitiesList = [
    { value: 'HD', label: '1080p HD', badge: 'Fast' },
    { value: '2K', label: '1440p 2K', badge: 'Crisp' },
    { value: '4K', label: '2160p 4K', badge: 'Recommended' },
    { value: '8K', label: '4320p 8K', badge: 'Max Detail' },
  ];

  // Quick Preset Titles/Prompts for CTR YouTube thumbnails
  const presetPrompts = [
    '100 Days in Minecraft Hardcore Survival with Dragon Boss',
    'How I Scaled an AI SaaS to $50,000/Month in 30 Days',
    'Unboxing the World’s First Holographic Cyberpunk Phone',
    '10 Daily Productivity Habits That Secretly Boost Focus',
    'Inside a $85,000,000 Futuristic Glass Mansion Tour',
    'Deep Sleep ASMR Rain Storm in a Luxury Cabin at Night',
  ];

  // Magic prompt enhancer
  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setValidationError('Please enter a topic or title first to enhance!');
      return;
    }
    setValidationError(null);
    const enhanced = `${prompt.trim()} - High CTR YouTube viral thumbnail layout, shocked facial expression, bold central focal subject, dramatic rim lighting, vibrant color scheme, 8k resolution, photorealistic studio shot, no watermarks`;
    setPrompt(enhanced);
  };

  // Validate form fields
  const validateFields = (): boolean => {
    if (!prompt.trim()) {
      setValidationError('Thumbnail title or prompt description is required.');
      return false;
    }
    if (prompt.trim().length < 3) {
      setValidationError('Prompt is too short. Please write at least 3 characters.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Handle Thumbnail Generation
  const handleGenerate = async () => {
    setApiError(null);
    if (!validateFields()) return;

    // Check user plan limit on frontend
    if (user && user.usage && user.usage.aiRequestsToday >= user.usage.aiRequestsLimitDaily) {
      if (onTriggerUsageLimit) onTriggerUsageLimit('ai_daily');
      setApiError(`Daily AI limit reached (${user.usage.aiRequestsToday}/${user.usage.aiRequestsLimitDaily}) for your ${user.plan} plan. Please upgrade to Pro for higher limits!`);
      return;
    }

    setGenerating(true);
    setLoadingStep(1);
    setLoadingText('Analyzing title & high-CTR prompt composition...');

    // Progress interval animation
    const progressInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev === 1) {
          setLoadingText(`Configuring ${style} lighting & subject focal depth...`);
          return 2;
        } else if (prev === 2) {
          setLoadingText(`Rendering high-resolution ${quality} canvas (${aspectRatio})...`);
          return 3;
        } else if (prev === 3) {
          setLoadingText('Finalizing micro-textures, color contrast & polish...');
          return 4;
        }
        return prev;
      });
    }, 1800);

    try {
      const response = await aiService.generateImage({
        user,
        prompt: prompt.trim(),
        aspectRatio,
        style,
        quality,
      });

      clearInterval(progressInterval);

      if (!response.success) {
        if (response.reason === 'ai_daily' || response.reason === 'ai_monthly') {
          if (onTriggerUsageLimit) onTriggerUsageLimit(response.reason);
        }
        setApiError(response.error || 'Failed to generate thumbnail image.');
        return;
      }

      if (response.data?.imageUrl) {
        const imageUrl = response.data.imageUrl;
        setGeneratedImageUrl(imageUrl);
        setGeneratedPrompt(prompt.trim());

        // Create new history entry
        const newHistoryItem: HistoryItem = {
          id: `thumb_${Date.now()}`,
          prompt: prompt.trim(),
          style,
          aspectRatio,
          quality,
          imageUrl,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]); // Keep last 20
        onLogFileProcess(`thumbnail_${aspectRatio.replace(':', 'x')}_${Date.now()}.png`, prompt.length, 1024 * 750, 'AI Thumbnail Generator');
        if (onIncrementAiUsage) onIncrementAiUsage();
      } else {
        setApiError('Image generation completed but returned no image data.');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Thumbnail Gen Error:', err);
      setApiError(`Server communication error: ${err.message || 'Failed to reach AI generator'}`);
    } finally {
      setGenerating(false);
    }
  };

  // Download Image Helper
  const handleDownload = (imgUrl: string = generatedImageUrl || '', fileName: string = 'youtube_thumbnail.png') => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy Prompt Helper
  const handleCopyPrompt = (pText: string) => {
    navigator.clipboard.writeText(pText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Load item from history
  const handleLoadHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setStyle(item.style);
    setAspectRatio(item.aspectRatio as any);
    setQuality(item.quality as any);
    setGeneratedImageUrl(item.imageUrl);
    setGeneratedPrompt(item.prompt);
    setActiveTab('generator');
  };

  // Delete item from history
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your generation history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Tools Dashboard</span>
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Thumbnail Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Title */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-pink-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Powered by Gemini 3.1 Flash Image AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              AI YouTube Thumbnail Generator
            </h1>
            <p className="text-xs sm:text-sm text-pink-100/90 leading-relaxed">
              Create ultra-high quality, click-worthy YouTube thumbnails, Shorts covers, and social graphics optimized for high CTR in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-300">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">CTR Optimization</div>
              <div className="text-[11px] text-pink-200">High contrast & vibrant colors</div>
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
              
              {/* Title / Prompt Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Thumbnail Title or Visual Prompt <span className="text-pink-500">*</span>
                  </label>
                  <button
                    onClick={handleEnhancePrompt}
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Magic Enhance CTR</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Describe your video thumbnail idea (e.g. Shocked gamer holding glowing neon controller with 100 DAYS text banner, highly detailed photorealistic render)"
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className={`w-full p-4 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
                      validationError
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-700/80'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 text-[11px] font-medium text-slate-400">
                    {prompt.length} chars
                  </div>
                </div>

                {validationError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Quick Inspiration Presets */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
                    Popular CTR Ideas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetPrompts.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(preset);
                          if (validationError) setValidationError(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600 dark:hover:text-pink-400 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all truncate max-w-[280px]"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aspect Ratio Selector (16:9, 9:16, 1:1) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2.5">
                  Select Aspect Ratio <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aspectRatiosList.map((ar) => {
                    const Icon = ar.icon;
                    const isSelected = aspectRatio === ar.value;
                    return (
                      <button
                        key={ar.value}
                        type="button"
                        onClick={() => setAspectRatio(ar.value as any)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-pink-50 dark:bg-pink-950/30 border-pink-500 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-pink-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{ar.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ar.tag}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Artistic Style Selector (8 styles) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2.5">
                  Visual Style <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stylesList.map((s) => {
                    const isSelected = style === s.name;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setStyle(s.name)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                          <span>{s.icon}</span>
                          <span className="truncate">{s.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Quality Selector (HD, 2K, 4K, 8K) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2.5">
                  Resolution & Output Quality <span className="text-pink-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {qualitiesList.map((q) => {
                    const isSelected = quality === q.value;
                    return (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => setQuality(q.value as any)}
                        className={`py-2 px-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white border-transparent font-bold shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{q.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{q.badge}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Error Notification Banner */}
              {apiError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-bold">Generation Error</div>
                    <p className="text-[11px] text-red-600 dark:text-red-400">{apiError}</p>
                  </div>
                  <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-4 px-6 font-bold text-sm text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 rounded-2xl shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Thumbnail...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-yellow-300" />
                    <span>Generate AI Thumbnail ({quality})</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Right Column: Preview & Results Display (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-slate-800 shadow-2xl space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-400/20 text-purple-600 dark:text-purple-400 backdrop-blur-md">
                    <Tv className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Thumbnail Preview Canvas
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CTR Boosted</span>
                </div>
              </div>

              {/* Loading State Animation with Glassmorphism */}
              {generating ? (
                <div className="relative overflow-hidden py-12 px-4 flex flex-col items-center justify-center text-center space-y-6 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-2xl rounded-2xl border border-white/10 dark:border-slate-800 shadow-inner">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-spin blur-sm opacity-90 p-1">
                      <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-pink-400 animate-bounce" />
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 space-y-2 max-w-xs">
                    <div className="text-sm font-bold text-white tracking-wide">
                      Generating {aspectRatio} Thumbnail
                    </div>
                    <p className="text-xs text-pink-300 font-medium animate-pulse">
                      {loadingText}
                    </p>
                  </div>

                  {/* Glassmorphic progress step indicator */}
                  <div className="relative z-10 flex items-center gap-1.5 w-full max-w-xs p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                          loadingStep >= step
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-sm shadow-pink-500/50'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : generatedImageUrl ? (
                /* Generated Preview Display Card with Glassmorphic Overlays */
                <div className="relative z-10 space-y-4 animate-in fade-in duration-300">
                  
                  {/* Thumbnail Frame */}
                  <div className="relative group rounded-2xl overflow-hidden border border-white/20 dark:border-slate-800 bg-slate-950 shadow-2xl flex items-center justify-center">
                    
                    {/* Aspect ratio frame preview */}
                    <div
                      className={`w-full relative flex items-center justify-center overflow-hidden ${
                        aspectRatio === '16:9'
                          ? 'aspect-video'
                          : aspectRatio === '9:16'
                          ? 'aspect-[9/16] max-h-[480px]'
                          : 'aspect-square'
                      }`}
                    >
                      <img
                        src={generatedImageUrl}
                        alt={generatedPrompt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Glassmorphic Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white border border-white/20 shadow-lg">
                        <Flame className="w-3 h-3 text-yellow-400" />
                        <span>CTR Score 98.4%</span>
                      </div>

                      <div className="absolute top-3 right-3 bg-pink-600/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white border border-pink-400/30 shadow-lg">
                        {quality} ULTRA
                      </div>

                      {/* Hover Fullscreen Overlay */}
                      <button
                        onClick={() => setFullscreenModal(true)}
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs"
                      >
                        <Maximize2 className="w-5 h-5" />
                        <span>Click to Expand</span>
                      </button>
                    </div>
                  </div>

                  {/* Prompt Text Info */}
                  <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Generated Prompt:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                      "{generatedPrompt}"
                    </p>
                  </div>

                  {/* Action Buttons (Download, Copy Prompt, Generate Again) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleDownload(generatedImageUrl, `thumbnail_${aspectRatio.replace(':', 'x')}_${Date.now()}.png`)}
                      className="py-2.5 px-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      onClick={() => handleCopyPrompt(generatedPrompt)}
                      className="py-2.5 px-3 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedPrompt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                    </button>

                    <button
                      onClick={handleGenerate}
                      className="py-2.5 px-3 bg-purple-500/10 dark:bg-purple-950/60 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate Again</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* Empty Placeholder Card */
                <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <Wand2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Ready to Render
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter a title or prompt on the left and click "Generate AI Thumbnail" to preview your artwork here.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* Generation History Tab View */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Saved Generation History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thumbnails generated on this device saved locally in your browser.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 inline-block">
                <History className="w-8 h-8" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No saved thumbnails found in history yet. Generate your first thumbnail!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group bg-slate-50 dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      {item.aspectRatio}
                    </div>
                    <div className="absolute top-2 right-2 bg-pink-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      {item.quality}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                        "{item.prompt}"
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-bold text-purple-600 dark:text-purple-400">{item.style}</span>
                        <span>•</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <button
                        onClick={() => handleLoadHistory(item)}
                        className="px-2.5 py-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        Reuse Prompt
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(item.imageUrl, `thumbnail_${item.id}.png`)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-pink-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Download PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {fullscreenModal && generatedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in">
          <button
            onClick={() => setFullscreenModal(false)}
            className="absolute top-6 right-6 p-3 text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <img
              src={generatedImageUrl}
              alt={generatedPrompt}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(generatedImageUrl)}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Resolution PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
