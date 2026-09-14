import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Download,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  History,
  Maximize2,
  X,
  AlertCircle,
  Sliders,
  Image as ImageIcon,
  Camera,
  Sun,
  Palette,
  Layers,
  ChevronDown,
  ChevronUp,
  Upload,
  Crop,
  Wand2,
  CheckCircle2,
  Info,
  Ratio,
  Compass,
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

interface ImageHistoryItem {
  id: string;
  prompt: string;
  imageType: string;
  style: string;
  aspectRatio: string;
  quality: string;
  imageUrl: string;
  colorMood?: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'ais_general_ai_image_history_v2';

export const AiImageStudio: React.FC<AiImageStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Main form state
  const [prompt, setPrompt] = useState(() => {
    try {
      const transferred = sessionStorage.getItem('ais_transfer_prompt');
      if (transferred) {
        sessionStorage.removeItem('ais_transfer_prompt');
        return transferred;
      }
    } catch {}
    return '';
  });
  const [imageType, setImageType] = useState('Photo');
  const [style, setStyle] = useState('Photorealistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [customWidth, setCustomWidth] = useState('1024');
  const [customHeight, setCustomHeight] = useState('1024');
  const [quality, setQuality] = useState('1080p');
  const [colorMood, setColorMood] = useState('Neutral');
  const [customColor, setCustomColor] = useState('');

  // Reference Image
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refMode, setRefMode] = useState<'composition' | 'style' | 'subject'>('style');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Camera & Lighting Settings (Collapsible)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cameraAngle, setCameraAngle] = useState('Eye level');
  const [cameraShot, setCameraShot] = useState('Medium shot');
  const [lens, setLens] = useState('50mm');
  const [lighting, setLighting] = useState('Natural daylight');
  const [depthOfField, setDepthOfField] = useState('Cinematic focus');
  const [backgroundSetting, setBackgroundSetting] = useState('Atmospheric bokeh');
  const [negativePrompt, setNegativePrompt] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [enhancingPrompt, setEnhancingPrompt] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingText, setLoadingText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Feedback & UI state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');
  const [editImageModal, setEditImageModal] = useState(false);

  // Local storage history
  const [history, setHistory] = useState<ImageHistoryItem[]>(() => {
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
      console.error('Failed to save image history:', e);
    }
  }, [history]);

  // Image Types
  const imageTypes = [
    { name: 'Photo', icon: '📸', desc: 'Real-world photographic scene' },
    { name: 'Product Photography', icon: '🛍️', desc: 'Studio commercial product showcase' },
    { name: 'Portrait', icon: '👤', desc: 'Detailed human or character portrait' },
    { name: 'Cinematic Scene', icon: '🎬', desc: 'Movie frame with dramatic storytelling' },
    { name: 'Character Design', icon: '🦸', desc: 'Unique character concept & costume' },
    { name: '3D Render', icon: '🧊', desc: 'Volumetric ray-traced 3D model' },
    { name: 'Illustration', icon: '🎨', desc: 'Handcrafted artistic painting' },
    { name: 'Cartoon', icon: '🧸', desc: 'Playful vibrant stylized cartoon' },
    { name: 'Anime', icon: '⚡', desc: 'Japanese animation & manga aesthetic' },
    { name: 'Poster', icon: '🏷️', desc: 'Graphic design poster layout' },
    { name: 'Social Media Graphic', icon: '📱', desc: 'Square or vertical promotional visual' },
    { name: 'Wallpaper', icon: '🌄', desc: 'High-res widescreen desktop or mobile background' },
    { name: 'Logo Concept', icon: '✨', desc: 'Minimalist brand mark or visual emblem' },
    { name: 'Infographic', icon: '📊', desc: 'Clean visual breakdown or schematic' },
    { name: 'Concept Art', icon: '🌌', desc: 'Sci-fi or fantasy worldbuilding concept' },
    { name: 'Other', icon: '🔮', desc: 'Custom creative prompt' },
  ];

  // Visual Styles
  const visualStyles = [
    'Photorealistic',
    'Cinematic',
    'Hyper Realistic',
    '3D',
    'Stylized 3D',
    'Anime',
    'Cartoon',
    'Minimal',
    'Luxury',
    'Editorial',
    'Fantasy',
    'Cyberpunk',
    'Watercolor',
    'Digital Art',
    'Clay',
    'Vintage',
    'Sketch',
  ];

  // Aspect Ratios
  const aspectRatios = [
    { value: '1:1', label: '1:1', desc: 'Square (Instagram, Avatar)', previewClass: 'aspect-square' },
    { value: '4:5', label: '4:5', desc: 'Portrait (Social feed)', previewClass: 'aspect-[4/5]' },
    { value: '3:2', label: '3:2', desc: 'Landscape (Photography)', previewClass: 'aspect-[3/2]' },
    { value: '4:3', label: '4:3', desc: 'Standard (Tablet, Print)', previewClass: 'aspect-[4/3]' },
    { value: '16:9', label: '16:9', desc: 'Widescreen (Desktop, Display)', previewClass: 'aspect-video' },
    { value: '9:16', label: '9:16', desc: 'Vertical (Mobile Story, Phone)', previewClass: 'aspect-[9/16]' },
    { value: 'custom', label: 'Custom', desc: 'Specified Width x Height', previewClass: 'aspect-auto' },
  ];

  // Output Qualities
  const outputQualities = [
    { value: '1024px', label: '1024px', tag: 'Standard' },
    { value: '1080p', label: '1080p', tag: 'Full HD' },
    { value: '1440p', label: '1440p', tag: '2K QHD' },
    { value: '2160p', label: '2160p', tag: '4K Ultra' },
  ];

  // Color & Moods
  const colorMoods = [
    'Warm',
    'Cool',
    'Neutral',
    'Dark',
    'Bright',
    'Pastel',
    'Vibrant',
    'Monochrome',
  ];

  // Creative Inspiration Presets
  const creativeInspirations = [
    'Cyberpunk Tokyo night market bathed in neon rain reflections and holographic signs',
    'Luxury obsidian fragrance bottle resting on wet volcanic sand with golden ripples',
    'Studio portrait of an elderly watchmaker with warm Rembrandt lighting and intense eyes',
    'Minimalist misty pine forest mountain peak wallpaper with serene morning fog',
    'Cute stylized 3D mascot robot wearing retro headphones holding a tiny plant',
    'Cozy botanical coffee shop interior with morning sunlight rays streaming through glass',
  ];

  // Auto-adjust settings dynamically when Image Type changes
  const handleImageTypeChange = (newType: string) => {
    setImageType(newType);
    if (newType === 'Portrait') {
      setAspectRatio('4:5');
      setLens('85mm');
      setCameraShot('Close-up');
      setLighting('Studio softbox');
      setDepthOfField('Shallow bokeh blur');
    } else if (newType === 'Product Photography') {
      setAspectRatio('1:1');
      setLens('Macro');
      setLighting('Studio softbox');
      setBackgroundSetting('Studio minimal');
      setStyle('Photorealistic');
    } else if (newType === 'Cinematic Scene') {
      setAspectRatio('16:9');
      setStyle('Cinematic');
      setLens('35mm');
      setLighting('Dramatic moody');
      setCameraShot('Wide shot');
    } else if (newType === 'Wallpaper') {
      setAspectRatio('16:9');
      setLighting('Golden hour');
      setCameraShot('Panoramic');
      setDepthOfField('Deep sharp focus');
    } else if (newType === 'Character Design') {
      setAspectRatio('4:5');
      setStyle('3D');
      setLighting('Rim lighting');
    } else if (newType === 'Logo Concept') {
      setAspectRatio('1:1');
      setStyle('Minimal');
      setBackgroundSetting('Clean gradient');
    } else if (newType === 'Anime') {
      setStyle('Anime');
      setLighting('Volumetric rays');
    } else if (newType === '3D Render') {
      setStyle('3D');
      setLighting('Rim lighting');
    }
  };

  // Enhance prompt helper using AI
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setValidationError('Please type an idea into the prompt box first before enhancing.');
      return;
    }
    setEnhancingPrompt(true);
    setApiError(null);

    try {
      const res = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'enhance-image-prompt',
          prompt: `Image Type: ${imageType}, Style: ${style}. Concept: ${prompt.trim()}`,
        }),
      });
      const data = await res.json();
      if (data.result && typeof data.result === 'string') {
        setPrompt(data.result.trim());
      }
    } catch (e: any) {
      console.warn('Enhance prompt failed:', e);
    } finally {
      setEnhancingPrompt(false);
    }
  };

  // Handle reference image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setApiError('Reference image must be under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRefImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Primary generate handler
  const handleGenerate = async () => {
    setApiError(null);
    if (!prompt.trim()) {
      setValidationError('Please enter a description of the image you want to create.');
      return;
    }

    if (user && user.usage && user.usage.aiRequestsToday >= user.usage.aiRequestsLimitDaily) {
      if (onTriggerUsageLimit) onTriggerUsageLimit('ai_daily');
      setApiError(`Daily AI generation limit reached (${user.usage.aiRequestsToday}/${user.usage.aiRequestsLimitDaily}) for your ${user.plan} plan.`);
      return;
    }

    setGenerating(true);
    setLoadingStep(1);
    setLoadingText('Composing visual scene and lighting parameters...');

    const progressInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev === 1) {
          setLoadingText(`Applying ${style} style & ${colorMood} color mood...`);
          return 2;
        } else if (prev === 2) {
          setLoadingText(`Synthesizing textures, lens depth (${lens}), and ${lighting}...`);
          return 3;
        } else if (prev === 3) {
          setLoadingText(`Rendering ${quality} high-fidelity output...`);
          return 4;
        }
        return prev;
      });
    }, 1800);

    const actualRatio = aspectRatio === 'custom' ? `${customWidth}:${customHeight}` : aspectRatio;

    try {
      const response = await aiService.generateImage({
        user,
        tool: 'image-generator',
        isThumbnail: false,
        prompt: prompt.trim(),
        imageType,
        style,
        aspectRatio: actualRatio,
        quality,
        colorMood,
        customColor: customColor.trim() || undefined,
        cameraAngle: showAdvanced ? cameraAngle : undefined,
        cameraShot: showAdvanced ? cameraShot : undefined,
        lens: showAdvanced ? lens : undefined,
        lighting: showAdvanced ? lighting : undefined,
        depthOfField: showAdvanced ? depthOfField : undefined,
        background: showAdvanced ? backgroundSetting : undefined,
        negativePrompt: showAdvanced && negativePrompt.trim() ? negativePrompt.trim() : undefined,
        refImage: refImage || undefined,
        refMode: refImage ? refMode : undefined,
      });

      clearInterval(progressInterval);

      if (!response.success) {
        if (response.reason === 'ai_daily' || response.reason === 'ai_monthly') {
          if (onTriggerUsageLimit) onTriggerUsageLimit(response.reason);
        }
        setApiError(response.error || 'Failed to create image.');
        return;
      }

      if (response.data?.imageUrl) {
        const imageUrl = response.data.imageUrl;
        setGeneratedImageUrl(imageUrl);
        setGeneratedPrompt(prompt.trim());

        const newHistoryItem: ImageHistoryItem = {
          id: `img_${Date.now()}`,
          prompt: prompt.trim(),
          imageType,
          style,
          aspectRatio: actualRatio,
          quality,
          colorMood,
          imageUrl,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 24)]);
        onLogFileProcess(`ai_image_${actualRatio.replace(':', 'x')}_${Date.now()}.png`, prompt.length, 1024 * 900, 'AI Image Generator');
        if (onIncrementAiUsage) onIncrementAiUsage();
      } else {
        setApiError('Image generation completed but returned no image data.');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setApiError(`Server error: ${err.message || 'Failed to communicate with image model'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (imgUrl: string = generatedImageUrl || '', fileName = 'ai_image.png') => {
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

  const handleCreateVariation = () => {
    if (!generatedImageUrl) return;
    setRefImage(generatedImageUrl);
    setRefMode('composition');
    alert('Image loaded into Reference Image for variation! Adjust prompt or styles and click Generate.');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 group transition-colors"
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
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Image Creator</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Creations ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Title */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Multi-Model Creative Art Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              AI Image Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create stunning AI images from any idea, reference image, or creative concept with advanced camera, lighting, and style controls.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">General Art Studio</div>
              <div className="text-[11px] text-slate-300">Photorealism, 3D, Anime & Concepts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Generator Interface */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Comprehensive Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
              
              {/* Section A: What do you want to create? */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    What do you want to create? <span className="text-indigo-500">*</span>
                  </label>
                  <button
                    onClick={handleEnhancePrompt}
                    type="button"
                    disabled={enhancingPrompt}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {enhancingPrompt ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Enhancing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>✨ Enhance Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Describe the image you want to create (supports English, Somali, Arabic, and other languages)..."
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className={`w-full p-4 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
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
                  <p className="text-xs text-red-500 font-semibold">{validationError}</p>
                )}

                {/* Creative Presets / Inspiration */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Creative Inspiration Prompts:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {creativeInspirations.map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(idea);
                          if (validationError) setValidationError(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all truncate max-w-[280px]"
                      >
                        + {idea}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. Image Type Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Image Type
                  </label>
                  <span className="text-[11px] text-slate-400">Auto-tunes parameters</span>
                </div>
                <select
                  value={imageType}
                  onChange={(e) => handleImageTypeChange(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {imageTypes.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.icon} {t.name} — {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Visual Style Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Visual Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {visualStyles.map((s) => {
                    const isSelected = style === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStyle(s)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-transparent shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">{s}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Aspect Ratio Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {aspectRatios.map((ar) => {
                    const isSelected = aspectRatio === ar.value;
                    return (
                      <button
                        key={ar.value}
                        type="button"
                        onClick={() => setAspectRatio(ar.value)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{ar.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{ar.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom dimensions if custom is selected */}
                {aspectRatio === 'custom' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 animate-in fade-in">
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Width (px)</label>
                      <input
                        type="number"
                        min="256"
                        max="2048"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <span className="text-slate-400 font-bold pt-4">×</span>
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Height (px)</label>
                      <input
                        type="number"
                        min="256"
                        max="2048"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Output Quality Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Output Quality / Resolution
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {outputQualities.map((q) => {
                    const isSelected = quality === q.value;
                    return (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => setQuality(q.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{q.label}</div>
                        <div className="text-[10px] opacity-75">{q.tag}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Color & Mood Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Color Palette & Mood (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {colorMoods.map((m) => {
                    const isSelected = colorMood === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setColorMood(m)}
                        className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  placeholder="Or custom color prompt (e.g. 'Emerald green and brushed rose gold')"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 6. Reference Image (Optional) */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                      Reference Image (Optional)
                    </span>
                  </div>
                  {refImage && (
                    <button
                      type="button"
                      onClick={() => setRefImage(null)}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700"
                    >
                      Remove Reference
                    </button>
                  )}
                </div>

                {refImage ? (
                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
                      <img src={refImage} alt="Ref" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        How should the AI use this reference?
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'composition', label: 'Composition Reference' },
                          { id: 'style', label: 'Visual Style Reference' },
                          { id: 'subject', label: 'Character / Product Reference' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setRefMode(m.id as any)}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                              refMode === m.id
                                ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-indigo-500" />
                      <span>Upload Reference Image (Composition, Style, or Subject)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Advanced Settings (Expandable Accordion) */}
              <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Advanced Settings (Camera, Lighting, Lens, Negative Prompt)
                    </span>
                  </div>
                  {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showAdvanced && (
                  <div className="p-4 space-y-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Camera Angle */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Camera Angle
                        </label>
                        <select
                          value={cameraAngle}
                          onChange={(e) => setCameraAngle(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          {['Close-up', 'Medium shot', 'Wide shot', 'Overhead / Top-down', 'Low angle', 'Eye level'].map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>

                      {/* Camera Shot / Composition */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Composition / Shot
                        </label>
                        <select
                          value={cameraShot}
                          onChange={(e) => setCameraShot(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          {['Rule of thirds', 'Centered', 'Symmetrical', 'Macro', 'Panoramic', 'Leading lines'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Lens */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Lens Focal Length
                        </label>
                        <select
                          value={lens}
                          onChange={(e) => setLens(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          {['24mm (Ultra-wide)', '35mm (Documentary / Street)', '50mm (Natural eye)', '85mm (Portrait)', 'Macro (Extreme detail)'].map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Lighting */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Lighting Style
                        </label>
                        <select
                          value={lighting}
                          onChange={(e) => setLighting(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          {['Natural daylight', 'Studio softbox', 'Dramatic moody', 'Rim lighting', 'Golden hour', 'Neon cyberpunk', 'Volumetric rays'].map((li) => (
                            <option key={li} value={li}>{li}</option>
                          ))}
                        </select>
                      </div>

                      {/* Depth of Field */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Depth of Field
                        </label>
                        <select
                          value={depthOfField}
                          onChange={(e) => setDepthOfField(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          {['Shallow bokeh blur', 'Deep sharp focus', 'Cinematic focus'].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* Background */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Background Environment
                        </label>
                        <select
                          value={backgroundSetting}
                          onChange={(e) => setBackgroundSetting(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          {['Atmospheric bokeh', 'Studio minimal', 'Clean gradient', 'Transparent/Isolated', 'Outdoor scenic'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Negative Prompt */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Negative Prompt (What to exclude)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. blurry, low quality, distorted hands, bad anatomy, text, watermark"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {apiError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-bold">Image Creation Error</div>
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
                className="w-full py-4 px-6 font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Rendering Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-yellow-300" />
                    <span>✨ Generate Image ({quality})</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Right Column: Image Preview Canvas & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Image Preview Canvas
                  </h2>
                </div>

                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  {aspectRatio} • {quality}
                </div>
              </div>

              {/* Loading State Animation */}
              {generating ? (
                <div className="py-20 px-4 flex flex-col items-center justify-center text-center space-y-6 bg-slate-950 rounded-2xl border border-indigo-500/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin p-1">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-indigo-400 animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-white">Rendering Creative Artwork</div>
                    <p className="text-xs text-indigo-300 font-medium animate-pulse">{loadingText}</p>
                  </div>
                  <div className="flex items-center gap-1.5 w-full max-w-xs p-1 bg-white/5 rounded-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                          loadingStep >= step ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : generatedImageUrl ? (
                /* Generated Preview Card */
                <div className="space-y-4 animate-in fade-in">
                  <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative group">
                    <div
                      className={`w-full overflow-hidden flex items-center justify-center ${
                        aspectRatio === '16:9'
                          ? 'aspect-video'
                          : aspectRatio === '9:16'
                          ? 'aspect-[9/16] max-h-[500px]'
                          : aspectRatio === '4:5'
                          ? 'aspect-[4/5]'
                          : aspectRatio === '3:2'
                          ? 'aspect-[3/2]'
                          : aspectRatio === '4:3'
                          ? 'aspect-[4/3]'
                          : 'aspect-square'
                      }`}
                    >
                      <img
                        src={generatedImageUrl}
                        alt={generatedPrompt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <button
                      onClick={() => setFullscreenModal(true)}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs"
                    >
                      <Maximize2 className="w-5 h-5" />
                      <span>Click to Enlarge</span>
                    </button>
                  </div>

                  {/* Prompt Text Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Generated Prompt:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                      "{generatedPrompt}"
                    </p>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload(generatedImageUrl, `ai_image_${Date.now()}.png`)}
                      className="py-3 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      onClick={() => handleCopyPrompt(generatedPrompt)}
                      className="py-3 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                    </button>

                    <button
                      onClick={handleCreateVariation}
                      className="py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Create Variation</span>
                    </button>

                    <button
                      onClick={() => setEditImageModal(true)}
                      className="py-2.5 px-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Crop className="w-4 h-4" />
                      <span>Edit Image</span>
                    </button>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate Image</span>
                  </button>
                </div>
              ) : (
                /* Empty Canvas State */
                <div className="py-20 px-4 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Canvas Ready
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Describe your creative vision on the left and click "Generate Image" to render your artwork here.
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
                Saved AI Image Creations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Images generated on this device saved locally in your browser.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Clear all saved image generation history?')) setHistory([]);
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
              No saved images yet. Generate an artwork to see it in your gallery!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group relative"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      {item.aspectRatio}
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 space-y-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{item.imageType} • {item.style}</span>
                      <span>{item.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setPrompt(item.prompt);
                          setImageType(item.imageType || 'Photo');
                          setStyle(item.style || 'Photorealistic');
                          setGeneratedImageUrl(item.imageUrl);
                          setActiveTab('generator');
                        }}
                        className="flex-1 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-bold hover:bg-indigo-100"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDownload(item.imageUrl, `ai_image_${item.id}.png`)}
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

      {/* Edit Image Modal */}
      {editImageModal && generatedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Crop className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Image Quick Edit & Adjustments</h3>
              </div>
              <button onClick={() => setEditImageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-64 overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center">
              <img src={generatedImageUrl} alt="Edit preview" className="max-h-64 object-contain" />
            </div>
            <p className="text-xs text-slate-500">
              Quick adjustments applied directly to your image file before exporting:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleCreateVariation();
                  setEditImageModal(false);
                }}
                className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-100"
              >
                Use as Reference Image
              </button>
              <button
                onClick={() => {
                  handleDownload(generatedImageUrl, `edited_image_${Date.now()}.png`);
                  setEditImageModal(false);
                }}
                className="p-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                Save & Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {fullscreenModal && generatedImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Full-Resolution AI Image</h3>
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
                alt="Fullscreen Artwork"
                referrerPolicy="no-referrer"
                className="max-h-[70vh] rounded-xl object-contain shadow-2xl"
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 truncate max-w-md">{prompt}</span>
              <button
                onClick={() => handleDownload(generatedImageUrl)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-indigo-500"
              >
                <Download className="w-4 h-4" /> Download Full PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
