import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Minimize2,
  Maximize2,
  Globe,
  Wand2,
  Terminal,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  AlertCircle,
  X,
  Sliders,
  CheckCircle2,
  Compass,
  ArrowRight,
  Video,
  Image as ImageIcon,
  Tv,
  Code,
  FileText,
  Send,
  HelpCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import {
  engineerUserPrompt,
  improvePromptAction,
  shortenPromptAction,
  translatePromptAction,
  getSavedEngineeredPrompts,
  saveEngineeredPrompt,
  deleteSavedEngineeredPrompt,
  EngineeredPromptResult,
  SavedPromptItem,
} from '../../services/promptStudioService';

interface AiPromptStudioProps {
  user?: UserProfile;
  onBack?: () => void;
  onLogFileProcess?: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onNavigateToTool?: (toolId: string, promptText?: string) => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export const AiPromptStudio: React.FC<AiPromptStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onNavigateToTool,
  onTriggerUsageLimit,
}) => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<'engineer' | 'history'>('engineer');

  // 1. Main Input
  const [userInput, setUserInput] = useState('');

  // 2. Prompt Type
  const promptTypes = [
    { name: 'Image Prompt', icon: '🎨', defaultAi: 'Midjourney', category: 'image' },
    { name: 'Video Prompt', icon: '🎬', defaultAi: 'Google Veo', category: 'video' },
    { name: 'YouTube Thumbnail Prompt', icon: '📺', defaultAi: 'Google Imagen', category: 'thumbnail' },
    { name: 'Marketing / Ad Prompt', icon: '📢', defaultAi: 'ChatGPT', category: 'text' },
    { name: 'Product Photography Prompt', icon: '🛍️', defaultAi: 'Google Imagen', category: 'image' },
    { name: 'Character Prompt', icon: '🦸', defaultAi: 'Midjourney', category: 'image' },
    { name: 'Logo / Brand Prompt', icon: '✨', defaultAi: 'Flux', category: 'image' },
    { name: 'Social Media Prompt', icon: '📱', defaultAi: 'ChatGPT', category: 'text' },
    { name: 'Writing Prompt', icon: '✍️', defaultAi: 'Claude', category: 'text' },
    { name: 'Coding Prompt', icon: '💻', defaultAi: 'Claude', category: 'code' },
    { name: 'General AI Prompt', icon: '🔮', defaultAi: 'Google Gemini', category: 'general' },
  ];
  const [promptType, setPromptType] = useState('Image Prompt');

  // 3. Target AI
  const targetAIs = [
    { name: 'Google Gemini', tag: 'Multimodal' },
    { name: 'Google Veo', tag: 'Video AI' },
    { name: 'Google Imagen', tag: 'Image AI' },
    { name: 'ChatGPT', tag: 'General LLM' },
    { name: 'Claude', tag: 'Reasoning / Code' },
    { name: 'Midjourney', tag: 'Photorealism' },
    { name: 'Flux', tag: 'Detailed Textures' },
    { name: 'Leonardo AI', tag: 'Creative Suite' },
    { name: 'Kling AI', tag: 'Dynamic Video' },
    { name: 'Runway', tag: 'Gen-3 Motion' },
    { name: 'Sora', tag: 'Hyper-Realistic Video' },
    { name: 'Generic / Any AI', tag: 'Universal' },
  ];
  const [targetAi, setTargetAi] = useState('Midjourney');

  // 4. Output Language
  const outputLanguages = ['English', 'Somali', 'Arabic', 'French', 'Spanish', 'Other'];
  const [outputLanguage, setOutputLanguage] = useState('English');

  // 5. Prompt Level
  const promptLevels = [
    { id: 'Simple', label: 'Simple', desc: 'Clean and direct prompt' },
    { id: 'Professional', label: 'Professional', desc: 'Detailed context & strategic instructions' },
    { id: 'Advanced', label: 'Advanced', desc: 'Deep camera, lighting, motion & constraint rules' },
  ];
  const [promptLevel, setPromptLevel] = useState<'Simple' | 'Professional' | 'Advanced'>('Professional');

  // 6. Optional Details (Accordion)
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('');
  const [environment, setEnvironment] = useState('');
  const [mood, setMood] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Generation state
  const [isEngineering, setIsEngineering] = useState(false);
  const [engineeringStep, setEngineeringStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Result state
  const [result, setResult] = useState<EngineeredPromptResult | null>(null);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPromptText, setEditedPromptText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showStructure, setShowStructure] = useState(true);
  const [showBeforeAfter, setShowBeforeAfter] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Translation modal inside result
  const [showTranslateModal, setShowTranslateModal] = useState(false);

  // History state
  const [history, setHistory] = useState<SavedPromptItem[]>([]);

  useEffect(() => {
    setHistory(getSavedEngineeredPrompts());
  }, []);

  // Quick Inspiration Presets
  const inspirationExamples = [
    'Make a cinematic video of a lion walking through a Somali village.',
    'Create a professional product advertisement for wireless headphones.',
    'Create a YouTube thumbnail about 5 AI tools.',
    'Create a realistic portrait of a Somali businessman.',
    'Write a prompt for an AI video showing a futuristic city.',
    'samee libaax dhex socda jungle habeenkii',
  ];

  // Auto-tune Target AI when Prompt Type changes if user hasn't explicitly customized
  const handlePromptTypeChange = (newType: string) => {
    setPromptType(newType);
    const matched = promptTypes.find((p) => p.name === newType);
    if (matched) {
      setTargetAi(matched.defaultAi);
      if (matched.category === 'video') {
        setAspectRatio('16:9');
      } else if (matched.category === 'thumbnail') {
        setAspectRatio('16:9');
      } else if (newType === 'Character Prompt' || newType === 'Product Photography Prompt') {
        setAspectRatio('1:1');
      }
    }
  };

  // Main Engineer Handler
  const handleEngineerPrompt = async () => {
    setErrorMsg(null);
    if (!userInput.trim()) {
      setValidationError('Please describe what you want to create in simple words.');
      return;
    }

    if (user && user.usage && user.usage.aiRequestsToday >= user.usage.aiRequestsLimitDaily) {
      if (onTriggerUsageLimit) onTriggerUsageLimit('ai_daily');
      setErrorMsg(`Daily AI generation limit reached (${user.usage.aiRequestsToday}/${user.usage.aiRequestsLimitDaily}) for your ${user.plan} plan.`);
      return;
    }

    setIsEngineering(true);
    setEngineeringStep('Analyzing core idea & linguistic intent...');

    const stepTimer = setTimeout(() => {
      setEngineeringStep(`Structuring for ${targetAi} (${promptType})...`);
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setEngineeringStep('Applying lighting, visual framing & technical constraints...');
    }, 1800);

    try {
      const res = await engineerUserPrompt({
        userInput: userInput.trim(),
        promptType,
        targetAi,
        promptLevel,
        outputLanguage,
        subject: subject.trim() || undefined,
        style: style.trim() || undefined,
        environment: environment.trim() || undefined,
        mood: mood.trim() || undefined,
        aspectRatio: aspectRatio || undefined,
        additionalInstructions: additionalInstructions.trim() || undefined,
        user,
      });

      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);

      setResult(res);
      setEditedPromptText(res.optimizedPrompt);
      setIsEditingPrompt(false);

      // Save to history
      const historyItem: SavedPromptItem = {
        id: res.id,
        title: userInput.trim().slice(0, 45) + (userInput.length > 45 ? '...' : ''),
        originalInput: userInput.trim(),
        promptText: res.optimizedPrompt,
        promptType,
        targetAi,
        promptLevel,
        isFavorite: false,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveEngineeredPrompt(historyItem);
      setHistory((prev) => [historyItem, ...prev.filter((x) => x.id !== historyItem.id)]);

      if (onLogFileProcess) {
        onLogFileProcess(`engineered_prompt_${Date.now()}.txt`, userInput.length, res.optimizedPrompt.length, 'AI Prompt Engineer');
      }
      if (onIncrementAiUsage) onIncrementAiUsage();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to engineer prompt. Please try again.');
    } finally {
      setIsEngineering(false);
      setEngineeringStep('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Actions on Output
  const handleImprove = async () => {
    if (!result) return;
    setActionLoading('improving');
    try {
      const current = isEditingPrompt ? editedPromptText : result.optimizedPrompt;
      const improved = await improvePromptAction(current, targetAi, user);
      setResult({ ...result, optimizedPrompt: improved });
      setEditedPromptText(improved);
      if (onIncrementAiUsage) onIncrementAiUsage();
    } finally {
      setActionLoading(null);
    }
  };

  const handleShorten = async () => {
    if (!result) return;
    setActionLoading('shortening');
    try {
      const current = isEditingPrompt ? editedPromptText : result.optimizedPrompt;
      const shortened = await shortenPromptAction(current, user);
      setResult({ ...result, optimizedPrompt: shortened });
      setEditedPromptText(shortened);
      if (onIncrementAiUsage) onIncrementAiUsage();
    } finally {
      setActionLoading(null);
    }
  };

  const handleTranslatePrompt = async (targetLang: string) => {
    if (!result) return;
    setActionLoading('translating');
    setShowTranslateModal(false);
    try {
      const current = isEditingPrompt ? editedPromptText : result.optimizedPrompt;
      const translated = await translatePromptAction(current, targetLang, user);
      setResult({ ...result, optimizedPrompt: translated, outputLanguage: targetLang });
      setEditedPromptText(translated);
      if (onIncrementAiUsage) onIncrementAiUsage();
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransferToTool = (toolId: string) => {
    const textToSend = isEditingPrompt ? editedPromptText : result?.optimizedPrompt || '';
    if (onNavigateToTool) {
      onNavigateToTool(toolId, textToSend);
    } else {
      sessionStorage.setItem('ais_transfer_prompt', textToSend);
      alert(`Prompt copied and ready! Open the ${toolId} tool.`);
    }
  };

  // Check which action buttons to show based on prompt type
  const isImageCompatible =
    promptType === 'Image Prompt' ||
    promptType === 'Product Photography Prompt' ||
    promptType === 'Character Prompt' ||
    promptType === 'Logo / Brand Prompt' ||
    promptType === 'General AI Prompt';

  const isVideoCompatible =
    promptType === 'Video Prompt' || targetAi.includes('Veo') || targetAi.includes('Sora') || targetAi.includes('Runway') || targetAi.includes('Kling');

  const isThumbnailCompatible =
    promptType === 'YouTube Thumbnail Prompt';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Tools Dashboard</span>
          </button>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('engineer')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'engineer'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Prompt Engineer</span>
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
            <span>Engineered History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Title (Per Requirement 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Universal Multi-Platform Prompt Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              AI Prompt Engineer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Turn simple ideas into powerful, professional AI prompts.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 self-start md:self-auto">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Target-Adaptive Engine</div>
              <div className="text-[11px] text-slate-300">Midjourney, Veo, ChatGPT, Imagen & Claude</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Experience: Idea -> Engineer -> Copy/Use Prompt */}
      {activeTab === 'engineer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Prompt Engineering Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
              
              {/* Requirement 2: MAIN INPUT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    What do you want to create? <span className="text-indigo-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Supports Somali, Arabic & English ideas</span>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    placeholder="Describe your idea in simple words…"
                    value={userInput}
                    onChange={(e) => {
                      setUserInput(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className={`w-full p-4 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      validationError
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-700/80'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 text-[11px] font-medium text-slate-400">
                    {userInput.length} chars
                  </div>
                </div>
                {validationError && (
                  <p className="text-xs text-red-500 font-semibold">{validationError}</p>
                )}

                {/* Example Inspiration Chips */}
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Quick Inspiration Ideas (Click to load):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspirationExamples.map((ex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setUserInput(ex);
                          if (validationError) setValidationError(null);
                          if (ex.includes('video')) {
                            setPromptType('Video Prompt');
                            setTargetAi('Google Veo');
                          } else if (ex.includes('thumbnail')) {
                            setPromptType('YouTube Thumbnail Prompt');
                            setTargetAi('Google Imagen');
                          } else if (ex.includes('headphones')) {
                            setPromptType('Product Photography Prompt');
                            setTargetAi('Google Imagen');
                          } else if (ex.includes('libaax')) {
                            setPromptType('Image Prompt');
                            setTargetAi('Google Imagen');
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all truncate max-w-[280px]"
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirement 3: PROMPT TYPE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Prompt Type
                  </label>
                  <span className="text-[11px] text-slate-400">Structures prompt output</span>
                </div>
                <select
                  value={promptType}
                  onChange={(e) => handlePromptTypeChange(e.target.value)}
                  className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {promptTypes.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Requirement 4: TARGET AI & Requirement 5: OUTPUT LANGUAGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target AI */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Target AI Platform
                  </label>
                  <select
                    value={targetAi}
                    onChange={(e) => setTargetAi(e.target.value)}
                    className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {targetAIs.map((ai) => (
                      <option key={ai.name} value={ai.name}>
                        {ai.name} ({ai.tag})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prompt Language */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                    Prompt Language
                  </label>
                  <select
                    value={outputLanguage}
                    onChange={(e) => setOutputLanguage(e.target.value)}
                    className="w-full p-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {outputLanguages.map((l) => (
                      <option key={l} value={l}>
                        {l} {l === 'English' ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirement 6: PROMPT QUALITY / PROMPT LEVEL */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Prompt Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {promptLevels.map((lvl) => {
                    const isSelected = promptLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setPromptLevel(lvl.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-transparent shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{lvl.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {lvl.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Requirement 7: OPTIONAL DETAILS (Expandable Section) */}
              <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOptionalDetails(!showOptionalDetails)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Optional Details (Subject, Style, Environment, Mood, Aspect Ratio)
                    </span>
                  </div>
                  {showOptionalDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showOptionalDetails && (
                  <div className="p-4 space-y-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/80 animate-in fade-in">
                    <p className="text-[11px] text-slate-400">
                      All fields below are completely optional. The engineer works great even with only your main idea!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Subject */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Subject (What is the main subject?)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Somali businessman in traditional macawiis, wireless headset"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Style */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Style
                        </label>
                        <select
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          <option value="">Select style (Optional)</option>
                          {['Photorealistic', 'Cinematic', '3D', 'Anime', 'Cartoon', 'Luxury', 'Minimal', 'Documentary', 'Editorial'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Environment */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Environment
                        </label>
                        <select
                          value={environment}
                          onChange={(e) => setEnvironment(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          <option value="">Select environment (Optional)</option>
                          {['Studio', 'City', 'Beach', 'Jungle', 'Office', 'Desert', 'Home', 'Futuristic city'].map((env) => (
                            <option key={env} value={env}>{env}</option>
                          ))}
                        </select>
                      </div>

                      {/* Mood */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Mood
                        </label>
                        <select
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                        >
                          <option value="">Select mood (Optional)</option>
                          {['Dramatic', 'Happy', 'Emotional', 'Mysterious', 'Energetic', 'Calm', 'Luxury'].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Aspect Ratio
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['1:1', '4:5', '16:9', '9:16', '3:2', '4:3'].map((ar) => (
                          <button
                            key={ar}
                            type="button"
                            onClick={() => setAspectRatio(ar)}
                            className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                              aspectRatio === ar
                                ? 'bg-indigo-600 text-white font-bold border-indigo-600'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {ar}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Instructions */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Additional Instructions (Free text)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. No text overlay, golden hour lighting, 85mm portrait lens"
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-bold">Engineering Error</div>
                    <p className="text-[11px] text-red-600 dark:text-red-400">{errorMsg}</p>
                  </div>
                  <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Requirement 8: GENERATE BUTTON (✨ Engineer Prompt) */}
              <button
                onClick={handleEngineerPrompt}
                disabled={isEngineering}
                className="w-full py-4 px-6 font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-50 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isEngineering ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Engineering Master Prompt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-yellow-300" />
                    <span>✨ Engineer Prompt</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Right Column: Output Screen, Breakdown & Before/After (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              
              {/* Output Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Your Engineered Prompt
                  </h2>
                </div>

                {result && (
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                    {result.targetAi} • {result.promptLevel}
                  </div>
                )}
              </div>

              {/* Engineering Loading Animation */}
              {isEngineering ? (
                <div className="py-20 px-4 flex flex-col items-center justify-center text-center space-y-6 bg-slate-950 rounded-2xl border border-indigo-500/20">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin p-1">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-indigo-400 animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-bold text-white">Engineering Master Prompt</div>
                    <p className="text-xs text-indigo-300 font-medium animate-pulse">{engineeringStep}</p>
                  </div>
                </div>
              ) : result ? (
                /* Requirement 10: OUTPUT SCREEN */
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* Generated Prompt Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Master Prompt ({result.outputLanguage})
                      </span>
                      <button
                        onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingPrompt ? 'View Formatted' : 'Edit Prompt'}</span>
                      </button>
                    </div>

                    {isEditingPrompt ? (
                      <textarea
                        rows={6}
                        value={editedPromptText}
                        onChange={(e) => setEditedPromptText(e.target.value)}
                        className="w-full p-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-indigo-500 rounded-2xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-mono leading-relaxed select-all whitespace-pre-wrap">
                        {result.optimizedPrompt}
                      </div>
                    )}
                  </div>

                  {/* Primary Action Row: Copy & Edit */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopy(isEditingPrompt ? editedPromptText : result.optimizedPrompt)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        copiedPrompt
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                      }`}
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleEngineerPrompt}
                      disabled={isEngineering}
                      className="py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                  </div>

                  {/* Secondary Refinement Row */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleImprove}
                      disabled={actionLoading !== null}
                      className="p-2.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === 'improving' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                      )}
                      <span>Improve</span>
                    </button>

                    <button
                      onClick={handleShorten}
                      disabled={actionLoading !== null}
                      className="p-2.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === 'shortening' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Minimize2 className="w-3 h-3 text-purple-500" />
                      )}
                      <span>Shorten</span>
                    </button>

                    <button
                      onClick={() => setShowTranslateModal(!showTranslateModal)}
                      disabled={actionLoading !== null}
                      className="p-2.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === 'translating' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Globe className="w-3 h-3 text-emerald-500" />
                      )}
                      <span>Translate</span>
                    </button>
                  </div>

                  {/* Translate Popup Selector */}
                  {showTranslateModal && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Translate prompt to:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['English', 'Somali', 'Arabic', 'French', 'Spanish'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => handleTranslatePrompt(lang)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-medium text-slate-800 dark:text-slate-200"
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Hand-off to Other Built-In Tools (Per Requirement 10 & 15) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Transfer Directly to Tool:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {isImageCompatible && (
                        <button
                          type="button"
                          onClick={() => handleTransferToTool('ai-image-generator')}
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Use in Image Generator</span>
                        </button>
                      )}

                      {isVideoCompatible && (
                        <button
                          type="button"
                          onClick={() => handleTransferToTool('ai-video-generator')}
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Use in Video Generator</span>
                        </button>
                      )}

                      {isThumbnailCompatible && (
                        <button
                          type="button"
                          onClick={() => handleTransferToTool('ai-thumbnail-generator')}
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Tv className="w-3.5 h-3.5" />
                          <span>Use in YouTube Thumbnail</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Requirement 11: SHOW THE STRUCTURE (Expandable Breakdown) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowStructure(!showStructure)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors py-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Prompt Structure Breakdown</span>
                      </div>
                      {showStructure ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {showStructure && result.structure && (
                      <div className="mt-3 grid grid-cols-1 gap-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] animate-in fade-in">
                        {result.structure.subject && (
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-indigo-500 w-24 shrink-0">Subject:</span>
                            <span className="text-slate-700 dark:text-slate-300">{result.structure.subject}</span>
                          </div>
                        )}
                        {result.structure.environment && (
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-indigo-500 w-24 shrink-0">Environment:</span>
                            <span className="text-slate-700 dark:text-slate-300">{result.structure.environment}</span>
                          </div>
                        )}
                        {result.structure.composition && (
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-indigo-500 w-24 shrink-0">Composition:</span>
                            <span className="text-slate-700 dark:text-slate-300">{result.structure.composition}</span>
                          </div>
                        )}
                        {result.structure.lightingCamera && (
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-indigo-500 w-24 shrink-0">Lighting/Camera:</span>
                            <span className="text-slate-700 dark:text-slate-300">{result.structure.lightingCamera}</span>
                          </div>
                        )}
                        {result.structure.styleMood && (
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-indigo-500 w-24 shrink-0">Style & Mood:</span>
                            <span className="text-slate-700 dark:text-slate-300">{result.structure.styleMood}</span>
                          </div>
                        )}
                        {result.structure.constraintsQuality && (
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-indigo-500 w-24 shrink-0">Constraints:</span>
                            <span className="text-slate-700 dark:text-slate-300">{result.structure.constraintsQuality}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Requirement 12: BEFORE / AFTER COMPARISON */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors py-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-purple-500" />
                        <span>Before & After Transformation</span>
                      </div>
                      {showBeforeAfter ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>

                    {showBeforeAfter && (
                      <div className="mt-3 space-y-2 animate-in fade-in">
                        <div className="p-3 bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
                            Your Original Idea
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                            "{result.originalInput}"
                          </p>
                        </div>

                        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                            Engineered Master Prompt
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {result.optimizedPrompt.slice(0, 160)}...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Empty Prompt State */
                <div className="py-16 px-4 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ready to Engineer Your Idea
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter your raw concept or request on the left and click "✨ Engineer Prompt" to see a battle-tested master prompt.
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Engineered Prompts Archive ({history.length})
            </h2>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all engineered prompts history?')) {
                    localStorage.removeItem('ais_engineered_prompts_v2');
                    setHistory([]);
                  }
                }}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Archive</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <History className="w-10 h-10 mx-auto text-slate-400" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No engineered prompts saved yet
              </div>
              <p className="text-xs text-slate-400">
                Generate prompts in the Prompt Engineer to see them archived here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                        {item.promptType} • {item.targetAi}
                      </span>
                      <span className="text-slate-400 text-[11px]">{item.createdAt}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Original: "{item.originalInput}"
                    </div>
                    <p className="text-xs font-mono text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl">
                      {item.promptText}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleCopy(item.promptText)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserInput(item.originalInput);
                        setPromptType(item.promptType);
                        setTargetAi(item.targetAi);
                        setActiveTab('engineer');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <span>Reload in Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        deleteSavedEngineeredPrompt(item.id);
                        setHistory((prev) => prev.filter((x) => x.id !== item.id));
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
