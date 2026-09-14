import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  RefreshCw,
  Save,
  Edit3,
  Trash2,
  History,
  Globe,
  Sliders,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Cpu,
  Briefcase,
  TrendingUp,
  Coins,
  DollarSign,
  Link as LinkIcon,
  Megaphone,
  ShoppingBag,
  Store,
  Package,
  PlaySquare,
  GraduationCap,
  Flame,
  Smile,
  CheckCircle2,
  Gamepad2,
  Trophy,
  Utensils,
  Compass,
  Crown,
  Car,
  Hourglass,
  Atom,
  Film,
  ShieldAlert,
  Search,
  Ghost,
  BookOpen,
  Dog,
  Users,
  Tv,
  Brain,
  Home,
  Target,
  StarHalf,
  HelpCircle,
  Zap,
  Newspaper,
  PlusCircle,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { UserProfile } from '../../types';
import {
  YOUTUBE_NICHES,
  VIDEO_TYPES,
  DURATION_OPTIONS,
  SCRIPT_TONES,
  SCRIPT_SPEAKERS,
  SAMPLE_TOPICS,
} from '../../data/youtubeStudioData';
import { ScriptOnlyInput, ScriptOnlyProject } from '../../types/youtubeStudio';
import {
  generateYouTubeScriptOnly,
  getScriptOnlyHistory,
  saveScriptOnlyProjectHistory,
  deleteScriptOnlyHistory,
} from '../../services/youtubeStudioService';
import {
  downloadScriptTxt,
  downloadScriptDocx,
  printScriptPdf,
} from '../../utils/youtubeStudioExporter';

interface AiYouTubeStudioProps {
  user?: UserProfile | null;
  onBack: () => void;
  onLogFileProcess?: (toolName: string, actionName: string, details?: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'English', name: 'English' },
  { code: 'Somali', name: 'Somali (Soomaali)' },
  { code: 'Arabic', name: 'Arabic (العربية)' },
  { code: 'French', name: 'French (Français)' },
  { code: 'Spanish', name: 'Spanish (Español)' },
  { code: 'Turkish', name: 'Turkish (Türkçe)' },
  { code: 'German', name: 'German (Deutsch)' },
];

export const AiYouTubeStudio: React.FC<AiYouTubeStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Input Form State
  const [topic, setTopic] = useState<string>('');
  const [selectedNiche, setSelectedNiche] = useState<string>('AI & Technology');
  const [customNiche, setCustomNiche] = useState<string>('');
  const [selectedVideoType, setSelectedVideoType] = useState<string>('Long Form');
  const [selectedDuration, setSelectedDuration] = useState<string>('5 min');
  const [customDuration, setCustomDuration] = useState<string>('7 minutes');
  const [selectedTone, setSelectedTone] = useState<string>('Conversational');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('Single Presenter');
  const [inputLanguage, setInputLanguage] = useState<string>('English');
  const [outputLanguage, setOutputLanguage] = useState<string>('English');

  // UI States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [scriptProject, setScriptProject] = useState<ScriptOnlyProject | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedFullText, setEditedFullText] = useState<string>('');
  const [showSeo, setShowSeo] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<ScriptOnlyProject[]>([]);
  const [searchNicheTerm, setSearchNicheTerm] = useState<string>('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = getScriptOnlyHistory();
    setHistoryList(list);
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      setStatusMessage('Please enter a topic or video idea first.');
      return;
    }

    setStatusMessage(null);
    setIsGenerating(true);

    const inputData: ScriptOnlyInput = {
      topic: topic.trim(),
      niche: selectedNiche,
      customNiche: selectedNiche === 'Custom Niche' ? customNiche : undefined,
      videoType: selectedVideoType,
      duration: selectedDuration,
      customDuration: selectedDuration === 'Custom' ? customDuration : undefined,
      tone: selectedTone,
      speaker: selectedSpeaker,
      inputLanguage,
      outputLanguage,
    };

    try {
      const result = await generateYouTubeScriptOnly(inputData, user);
      setScriptProject(result);
      setEditedFullText(result.fullScriptText);
      setIsEditing(false);

      if (onIncrementAiUsage) onIncrementAiUsage();
      if (onLogFileProcess) {
        onLogFileProcess('AI YouTube Script Generator', 'Generate Script', `Topic: ${topic.slice(0, 30)}`);
      }
      loadHistory();
    } catch (err: any) {
      console.error('Error generating script:', err);
      setStatusMessage('Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = () => {
    if (!scriptProject) return;
    const updated: ScriptOnlyProject = {
      ...scriptProject,
      fullScriptText: editedFullText,
      updatedAt: new Date().toISOString(),
    };
    setScriptProject(updated);
    saveScriptOnlyProjectHistory(updated);
    setIsEditing(false);
    setStatusMessage('Script edits saved successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const filteredNiches = YOUTUBE_NICHES.filter((n) =>
    n.name.toLowerCase().includes(searchNicheTerm.toLowerCase()) ||
    n.category.toLowerCase().includes(searchNicheTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-1"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-red-600 to-rose-500 text-white rounded-xl shadow-lg shadow-red-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                AI YouTube Script Generator
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  Script Only
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Generate complete ready-to-record viral YouTube scripts adapted to any niche.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadHistory();
              setHistoryDrawerOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <History className="w-4 h-4 text-rose-400" />
            <span>Saved Scripts ({historyList.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Status Notification */}
        {statusMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between animate-fadeIn">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Configuration Panel */}
        <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-400" />
                Script Setup & Parameters
              </h2>
              <p className="text-xs text-slate-400">
                Define your video topic, niche, tone, speaker setup, and language to generate a ready-to-record script.
              </p>
            </div>
          </div>

          {/* 1. Topic / Video Idea */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Topic / Video Idea <span className="text-red-400">*</span></span>
              <span className="text-slate-500 text-[11px] font-normal">What do you want your YouTube video to be about?</span>
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How AI will change programming in the next 5 years, or Sida ugu samayn karto lacag intarneedka..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />

            {/* Quick Inspiration Topics */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 mr-2 font-medium">Quick Topic Inspiration:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {SAMPLE_TOPICS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(sample)}
                    className="text-xs px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition-all text-left truncate max-w-xs"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Niche Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Niche ({YOUTUBE_NICHES.length} Options)
              </label>
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search niches..."
                  value={searchNicheTerm}
                  onChange={(e) => setSearchNicheTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {filteredNiches.map((niche) => {
                const isSelected = selectedNiche === niche.name;
                return (
                  <button
                    key={niche.id}
                    type="button"
                    onClick={() => setSelectedNiche(niche.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-red-600/30 to-rose-600/20 border-red-500 text-white shadow-md shadow-red-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-semibold truncate block">{niche.name}</span>
                    <span className="text-[10px] text-slate-500 opacity-80 truncate block">{niche.category}</span>
                  </button>
                );
              })}
            </div>

            {selectedNiche === 'Custom Niche' && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Enter your custom niche..."
                  value={customNiche}
                  onChange={(e) => setCustomNiche(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            )}
          </div>

          {/* 3. Video Type, Duration, Tone, Speaker */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Video Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Video Type
              </label>
              <select
                value={selectedVideoType}
                onChange={(e) => setSelectedVideoType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
              >
                {VIDEO_TYPES.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name} - {type.description.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.label}>
                    {opt.label} {opt.wordCountEst > 0 ? `(~${opt.wordCountEst} words)` : ''}
                  </option>
                ))}
              </select>

              {selectedDuration === 'Custom' && (
                <input
                  type="text"
                  placeholder="e.g. 12 minutes"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              )}
            </div>

            {/* Tone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Tone / Style
              </label>
              <select
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
              >
                {SCRIPT_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            {/* Speaker Setup */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Speaker Structure
              </label>
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
              >
                {SCRIPT_SPEAKERS.map((spk) => (
                  <option key={spk} value={spk}>
                    {spk}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Language Selection */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Input Language
              </label>
              <select
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                Output Script Language
              </label>
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerateScript}
              disabled={isGenerating || !topic.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white transition-all shadow-lg flex items-center justify-center space-x-2 ${
                isGenerating || !topic.trim()
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 shadow-red-500/25 hover:shadow-red-500/40 cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>Generating Complete Script...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Complete Script</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Output Section */}
        {scriptProject && (
          <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-6">
            {/* Header & Meta Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                  Ready-to-Record Script
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                  {scriptProject.videoTitle}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-400">
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                    Niche: {scriptProject.niche}
                  </span>
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                    Type: {scriptProject.videoType}
                  </span>
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                    Duration: {scriptProject.duration}
                  </span>
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                    Tone: {scriptProject.tone}
                  </span>
                  <span className="bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                    Speaker: {scriptProject.speaker}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCopy(scriptProject.fullScriptText, 'fullScript')}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
                  title="Copy full script"
                >
                  {copiedKey === 'fullScript' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center space-x-1.5 ${
                    isEditing
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Script'}</span>
                </button>

                <button
                  onClick={handleGenerateScript}
                  disabled={isGenerating}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
                  title="Regenerate Script"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                {/* Export Dropdown Group */}
                <button
                  onClick={() => downloadScriptTxt(scriptProject)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
                  title="Download TXT"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>TXT</span>
                </button>

                <button
                  onClick={() => downloadScriptDocx(scriptProject)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
                  title="Download DOCX"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>DOCX</span>
                </button>

                <button
                  onClick={() => printScriptPdf(scriptProject)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
                  title="Download PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Script Display / Edit Mode */}
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Inline Script Editor
                  </label>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
                <textarea
                  value={editedFullText}
                  onChange={(e) => setEditedFullText(e.target.value)}
                  rows={20}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Structured Sections Render */}
                <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-6">
                  {/* Hook */}
                  {scriptProject.hook && (
                    <div className="border-l-4 border-red-500 pl-4 py-1 bg-red-500/5 rounded-r-xl space-y-1">
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                        Hook (First 5-15 Seconds)
                      </span>
                      <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                        {scriptProject.hook}
                      </p>
                    </div>
                  )}

                  {/* Intro */}
                  {scriptProject.intro && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Introduction
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {scriptProject.intro}
                      </p>
                    </div>
                  )}

                  {/* Main Sections */}
                  {scriptProject.mainSections && scriptProject.mainSections.length > 0 && (
                    <div className="space-y-5 pt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800/80 pb-1">
                        Main Content & Spoken Dialogue
                      </span>
                      {scriptProject.mainSections.map((sec, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                          <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                            <span>{sec.heading}</span>
                          </h4>
                          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                            {sec.spokenText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Call to Action & Ending */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                    {scriptProject.callToAction && (
                      <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          Call to Action
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {scriptProject.callToAction}
                        </p>
                      </div>
                    )}

                    {scriptProject.ending && (
                      <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                          Ending Sign-off
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {scriptProject.ending}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional SEO Section Collapsible */}
                <div className="border border-slate-800 rounded-2xl bg-slate-950/60 overflow-hidden">
                  <button
                    onClick={() => setShowSeo(!showSeo)}
                    className="w-full px-5 py-3.5 bg-slate-900/80 hover:bg-slate-900 text-left font-semibold text-sm text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-rose-400" />
                      <span>Optional YouTube SEO & Video Metadata</span>
                    </span>
                    {showSeo ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {showSeo && (
                    <div className="p-5 space-y-5 border-t border-slate-800 text-xs text-slate-300">
                      {/* Main Title & Alt Titles */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">YouTube Title & 5 Alternative Titles:</span>
                          <button
                            onClick={() => handleCopy(scriptProject.seo.youtubeTitle, 'seoTitle')}
                            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Title</span>
                          </button>
                        </div>
                        <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-100 font-medium text-xs">
                          {scriptProject.seo.youtubeTitle}
                        </p>
                        {scriptProject.seo.alternativeTitles && scriptProject.seo.alternativeTitles.length > 0 && (
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {scriptProject.seo.alternativeTitles.map((alt, i) => (
                              <li key={i} className="bg-slate-900/60 p-2 rounded border border-slate-800/80 text-slate-400 flex justify-between items-center">
                                <span>{i + 1}. {alt}</span>
                                <button
                                  onClick={() => handleCopy(alt, `altTitle-${i}`)}
                                  className="text-slate-500 hover:text-slate-300 p-1"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Video Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">Video Description:</span>
                          <button
                            onClick={() => handleCopy(scriptProject.seo.description, 'seoDesc')}
                            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Description</span>
                          </button>
                        </div>
                        <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-sans text-xs whitespace-pre-wrap leading-relaxed text-slate-300">
                          {scriptProject.seo.description}
                        </pre>
                      </div>

                      {/* Keywords & Tags */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="font-bold text-slate-200 block mb-1">Target Keywords:</span>
                          <div className="flex flex-wrap gap-1">
                            {scriptProject.seo.keywords.map((kw, i) => (
                              <span key={i} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-200 block mb-1">Hashtags:</span>
                          <div className="flex flex-wrap gap-1">
                            {scriptProject.seo.hashtags.map((ht, i) => (
                              <span key={i} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-rose-400 font-medium">
                                {ht}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pinned Comment */}
                      {scriptProject.seo.pinnedComment && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-200 block">Pinned Comment Draft:</span>
                          <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 italic">
                            "{scriptProject.seo.pinnedComment}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* History Modal / Drawer */}
      {historyDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-6 border-l border-slate-800 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-rose-400" />
                  Saved Script History
                </h3>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {historyList.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  No saved scripts found yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                          {item.videoTitle}
                        </h4>
                        <button
                          onClick={() => {
                            deleteScriptOnlyHistory(item.id);
                            loadHistory();
                          }}
                          className="text-slate-500 hover:text-red-400 p-1"
                          title="Delete script"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {item.topic}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{item.niche} • {item.duration}</span>
                        <button
                          onClick={() => {
                            setScriptProject(item);
                            setEditedFullText(item.fullScriptText);
                            setHistoryDrawerOpen(false);
                          }}
                          className="text-red-400 hover:text-red-300 font-semibold"
                        >
                          Open Script
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setHistoryDrawerOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AiYouTubeStudio;
