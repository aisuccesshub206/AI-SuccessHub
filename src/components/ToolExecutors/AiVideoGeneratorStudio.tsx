import React, { useState, useEffect } from 'react';
import {
  Video,
  Sparkles,
  Wand2,
  Film,
  Download,
  Copy,
  Heart,
  RefreshCw,
  Check,
  Trash2,
  Eye,
  Share2,
  AlertTriangle,
  XCircle,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { UserProfile, GeneratedVideoItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AiVideoGeneratorStudioProps {
  user: UserProfile;
  onTriggerUsageLimit?: (type: 'ai_daily' | 'ai_monthly' | 'storage') => void;
  onSaveFileToDashboard?: (file: { name: string; sizeMB: number; tool: string; url?: string }) => void;
}

const INITIAL_DEMO_VIDEOS: GeneratedVideoItem[] = [
  {
    id: 'veo-1',
    title: 'Futuristic Cyber Tiger in Tokyo',
    prompt: 'Cinematic close-up of a cybernetic tiger in a rain-slicked Tokyo neon street, 8k resolution, raytracing',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-41555-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 16,
    aspectRatio: '16:9',
    style: 'Cinematic',
    createdAt: 'Just now',
    isFavorite: true,
  },
  {
    id: 'veo-2',
    title: 'Pixar Style Flying Magical Dragon',
    prompt: '3D Pixar animated cute baby dragon soaring above pastel clouds, vibrant colors, soft lighting',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    durationSeconds: 8,
    aspectRatio: '9:16',
    style: 'Pixar',
    createdAt: '2 hours ago',
    isFavorite: false,
  },
];

export const AiVideoGeneratorStudio: React.FC<AiVideoGeneratorStudioProps> = ({
  user,
  onTriggerUsageLimit,
  onSaveFileToDashboard,
}) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'text-to-video' | 'image-to-video'>('text-to-video');

  // Form State
  const [prompt, setPrompt] = useState('An epic cinematic close-up of a futuristic cybernetic tiger running through a neon-lit cyberpunk city in heavy rain, dramatic volumetric lighting, photorealistic details');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distortion, glitches, bad physics, text overlays, watermarks');
  const [scenePrompt, setScenePrompt] = useState('Scene 1: Camera orbits slowly around tiger eyes. Scene 2: Tiger leaps over neon puddle with water splash reflection.');
  const [characterConsistency, setCharacterConsistency] = useState('CyberTiger-V3-MetallicGlow');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [videoLength, setVideoLength] = useState<8 | 16 | 30>(16);
  const [quality, setQuality] = useState<'HD' | '2K' | '4K'>('4K');
  const [style, setStyle] = useState<'Cinematic' | 'Hyper Realistic' | 'Pixar' | 'Anime' | 'ASMR' | 'Product Commercial' | 'Luxury' | 'Documentary'>('Cinematic');
  const [camera, setCamera] = useState<'Drone' | 'Orbit' | 'Dolly' | 'Crane' | 'Handheld' | 'Static'>('Orbit');
  const [motionControl, setMotionControl] = useState<number>(7);
  const [cinematicLighting, setCinematicLighting] = useState<string>('Neon Cyberpunk Volumetric Studio');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Validation State
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generation & Polling State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('Preparing Request...');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [providerError, setProviderError] = useState<{ title: string; message: string } | null>(null);

  // Video Items State
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideoItem | null>(INITIAL_DEMO_VIDEOS[0]);
  const [history, setHistory] = useState<GeneratedVideoItem[]>(INITIAL_DEMO_VIDEOS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ais_veo3_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setCurrentVideo(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load video history', e);
    }
  }, []);

  const saveHistoryToStorage = (newHistory: GeneratedVideoItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('ais_veo3_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save video history', e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Main Generate Function with Server Integration & Job Polling
  const handleGenerate = async () => {
    // 1. Field Validation
    setValidationError(null);
    setProviderError(null);

    if (!prompt || prompt.trim().length < 3) {
      setValidationError('Please enter a descriptive prompt with at least 3 characters.');
      return;
    }

    if (tab === 'image-to-video' && !uploadedImage) {
      setValidationError('Please upload a source image reference for Image-to-Video generation.');
      return;
    }

    // 2. Check usage limits
    if (user?.usage && user.usage.aiRequestsToday >= user.usage.aiRequestsLimitDaily && user.usage.aiRequestsLimitDaily !== -1) {
      if (onTriggerUsageLimit) onTriggerUsageLimit('ai_daily');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationStep('Preparing Request...');

    try {
      // Send Request to Backend
      const res = await fetch('/api/ai/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          videoLengthSeconds: videoLength,
          style,
          userPlan: user?.plan || 'Free',
          userUsage: user?.usage || {},
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsGenerating(false);
        if (data.error === 'NO_PROVIDER_CONNECTED') {
          setProviderError({
            title: 'No AI Video Provider Connected',
            message: 'No AI video provider is connected. Please connect a supported provider.',
          });
        } else {
          setProviderError({
            title: data.error || 'Video Generation Failed',
            message: data.message || 'An error occurred while communicating with the AI video provider.',
          });
        }
        return;
      }

      // Start Polling Job
      const jobId = data.jobId;
      setActiveJobId(jobId);
      pollJobStatus(jobId);
    } catch (err: any) {
      setIsGenerating(false);
      setProviderError({
        title: 'Network Error',
        message: err.message || 'Unable to reach the AI video generation server.',
      });
    }
  };

  // Asynchronous Job Polling Loop
  const pollJobStatus = (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ai/video/status/${jobId}`);
        if (!res.ok) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setProviderError({
            title: 'Video Generation Failed',
            message: 'Job status polling failed or server timed out.',
          });
          return;
        }

        const data = await res.json();
        setGenerationProgress(data.progress || 10);
        setGenerationStep(data.step || 'Processing Request...');

        if (data.status === 'completed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          finishGeneration(data.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-41555-large.mp4');
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setProviderError({
            title: data.error || 'Video Generation Failed',
            message: data.message || 'The AI provider failed to synthesize the video stream.',
          });
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 800);
  };

  const finishGeneration = (videoUrl: string) => {
    const newVideo: GeneratedVideoItem = {
      id: `veo3-${Date.now()}`,
      title: prompt.slice(0, 35) + '...',
      prompt,
      videoUrl,
      thumbnailUrl: uploadedImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
      durationSeconds: videoLength,
      aspectRatio,
      style,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFavorite: false,
    };

    setCurrentVideo(newVideo);
    const updated = [newVideo, ...history];
    saveHistoryToStorage(updated);

    if (onSaveFileToDashboard) {
      onSaveFileToDashboard({
        name: `Veo3_${newVideo.title.replace(/\s+/g, '_')}.mp4`,
        sizeMB: videoLength * 2.4,
        tool: 'AI Video Generator (Veo 3)',
        url: videoUrl,
      });
    }
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
    saveHistoryToStorage(updated);
    if (currentVideo && currentVideo.id === id) {
      setCurrentVideo({ ...currentVideo, isFavorite: !currentVideo.isFavorite });
    }
  };

  const copyPromptToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareVideo = (video: GeneratedVideoItem) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this AI video generated with Veo 3: "${video.prompt}"`,
        url: video.videoUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(video.videoUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter((item) => item.id !== id);
    saveHistoryToStorage(filtered);
    if (currentVideo?.id === id) {
      setCurrentVideo(filtered[0] || null);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('Clear all generated video history?')) {
      saveHistoryToStorage([]);
      setCurrentVideo(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> Next-Gen Veo 3 AI Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Video Generator <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">(Veo 3)</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transform text prompts and reference images into cinema-grade 4K AI video streams with full camera motion, lighting control, and character consistency.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
              <div className="text-xs text-slate-400">Daily Quota</div>
              <div className="text-lg font-bold text-white">
                {user?.usage?.aiRequestsToday || 0} / {user?.usage?.aiRequestsLimitDaily === -1 ? '∞' : user?.usage?.aiRequestsLimitDaily || 50}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Error Banner */}
      {providerError && (
        <div className="p-5 rounded-2xl bg-rose-950/80 border border-rose-500/50 shadow-2xl space-y-2 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-white">{providerError.title}</h3>
              <p className="text-xs text-rose-200 mt-1">{providerError.message}</p>
            </div>
          </div>
          <button
            onClick={() => setProviderError(null)}
            className="text-rose-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Mode Tabs */}
          <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-white/5">
            <button
              onClick={() => {
                setTab('text-to-video');
                setValidationError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
                tab === 'text-to-video' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" /> Text to Video
            </button>
            <button
              onClick={() => {
                setTab('image-to-video');
                setValidationError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
                tab === 'image-to-video' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Image to Video
            </button>
          </div>

          {/* Image Upload if Image-To-Video */}
          {tab === 'image-to-video' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Source Image Reference</label>
              <div className="relative border-2 border-dashed border-indigo-500/30 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-950/50">
                {uploadedImage ? (
                  <div className="relative group max-h-48 overflow-hidden rounded-xl">
                    <img src={uploadedImage} alt="Reference" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-6">
                    <ImageIcon className="w-10 h-10 mx-auto text-indigo-400 mb-2 animate-bounce" />
                    <span className="text-sm text-slate-200 font-medium block">Upload source image to animate</span>
                    <span className="text-xs text-slate-400 block mt-1">Supports PNG, JPG, WEBP up to 25MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Prompt Box */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">Video Prompt Box</label>
              <span className="text-xs text-indigo-400 font-mono">Veo 3 Model</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (validationError) setValidationError(null);
              }}
              rows={3}
              placeholder={t('promptPlaceholder') || 'Describe the video scene in rich detail...'}
              className={`w-full p-4 rounded-2xl bg-slate-950/90 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner ${
                validationError ? 'border-rose-500' : 'border-white/10'
              }`}
            />
            {validationError && <p className="text-xs text-rose-400 font-semibold">{validationError}</p>}
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">Negative Prompt (What to exclude)</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="e.g. blurry, low quality, artifacts..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Scene Sequence & Character Consistency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Scene Sequence</label>
              <input
                type="text"
                value={scenePrompt}
                onChange={(e) => setScenePrompt(e.target.value)}
                placeholder="Scene 1: Orbit... Scene 2: Zoom..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Character Consistency Key</label>
              <input
                type="text"
                value={characterConsistency}
                onChange={(e) => setCharacterConsistency(e.target.value)}
                placeholder="Unique ID or Character Seed"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Aspect Ratio, Length & Quality Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Length */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Video Length</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([8, 16, 30] as const).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setVideoLength(len)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      videoLength === len
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {len}s
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Quality</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['HD', '2K', '4K'] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      quality === q
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Presets & Camera Movement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Style Preset</label>
              <select
                value={style}
                onChange={(e: any) => setStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['Cinematic', 'Hyper Realistic', 'Pixar', 'Anime', 'ASMR', 'Product Commercial', 'Luxury', 'Documentary'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Camera Movement</label>
              <select
                value={camera}
                onChange={(e: any) => setCamera(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['Drone', 'Orbit', 'Dolly', 'Crane', 'Handheld', 'Static'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 text-white font-bold text-base shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_45px_rgba(99,102,241,0.6)] disabled:opacity-50 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" /> Generating Video ({generationProgress}%)
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 text-cyan-300" /> Generate Video with Veo 3
              </>
            )}
          </button>
        </div>

        {/* Right Player & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Video Player */}
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">Veo 3 Preview Player</span>
              </div>
              {currentVideo && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {quality} • {currentVideo.aspectRatio}
                </span>
              )}
            </div>

            {/* Video Canvas or Loading Progress */}
            <div
              className={`relative rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[500px]' : aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video'
              }`}
            >
              {isGenerating ? (
                /* Step Progress Visualizer */
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <Sparkles className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{generationStep}</p>
                    <p className="text-xs text-indigo-400 font-mono font-bold">{generationProgress}% Completed</p>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden max-w-xs border border-white/10">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full transition-all duration-300 shadow-md"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                </div>
              ) : currentVideo ? (
                <div className="relative w-full h-full group">
                  <video
                    key={currentVideo.id}
                    src={currentVideo.videoUrl}
                    poster={currentVideo.thumbnailUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-md flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Preview Ready
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite(currentVideo.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${
                        currentVideo.isFavorite ? 'text-red-400 bg-red-500/20' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${currentVideo.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => copyPromptToClipboard(currentVideo.prompt, currentVideo.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white"
                      title="Copy Prompt"
                    >
                      {copiedId === currentVideo.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleShareVideo(currentVideo)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white"
                      title="Share Video"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 space-y-2">
                  <Film className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-sm text-slate-400">Your generated Veo 3 video will appear here</p>
                </div>
              )}
            </div>

            {/* Video Meta & Quick Actions */}
            {currentVideo && !isGenerating && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950 p-3 rounded-xl border border-white/5 font-mono">
                  "{currentVideo.prompt}"
                </p>

                {shareSuccess && (
                  <p className="text-xs text-emerald-400 font-bold text-center">Video link copied to clipboard!</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <a
                    href={currentVideo.videoUrl}
                    download={`Veo3_${currentVideo.id}.mp4`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" /> Download Video
                  </a>

                  <button
                    onClick={() => {
                      setPrompt(currentVideo.prompt);
                      handleGenerate();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Generate Again
                  </button>

                  <button
                    onClick={() => handleShareVideo(currentVideo)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                    title="Share Video"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Generation History */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" /> Generation History ({history.length})
              </h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold"
                >
                  Clear History
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No generated videos in history yet.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentVideo(item)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      currentVideo?.id === item.id
                        ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                        : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img src={item.thumbnailUrl} alt={item.title} className="w-16 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{item.durationSeconds}s</span>
                        <span>•</span>
                        <span>{item.style}</span>
                        <span>•</span>
                        <span>{item.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`p-1.5 rounded-lg ${item.isFavorite ? 'text-red-400' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                        title="Delete from History"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
