import React, { useState, useEffect, useRef } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Copy,
  Check,
  Download,
  Upload,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Sliders,
  X,
  Search,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Trash2,
  Eye,
  FileDown,
  ChevronRight,
  Plus,
  HelpCircle,
  MessageSquare,
  Wand2,
  RefreshCw,
  Globe,
  Settings,
  Layers,
  FileCode,
  Zap,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface AiTranslationStudioProps {
  user?: UserProfile;
  initialText?: string;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export interface GlossaryItem {
  id: string;
  term: string;
  translation: string;
}

export interface TranslationHistoryItem {
  id: string;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  style: string;
  date: string;
  documentName?: string;
}

const SUPPORTED_LANGUAGES = [
  'Auto Detect',
  'English',
  'Somali',
  'Arabic',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Portuguese',
  'Turkish',
  'Chinese',
  'Japanese',
  'Korean',
  'Hindi',
  'Russian',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Polish',
  'Indonesian',
  'Urdu',
  'Swahili',
  'Amharic',
  'Oromo',
  'Vietnamese',
  'Thai',
  'Greek',
  'Hebrew',
];

const TRANSLATION_STYLES = [
  'Natural',
  'Literal',
  'Professional',
  'Formal',
  'Casual',
  'Academic',
  'Business',
  'Marketing',
  'Technical',
  'Legal',
  'Simple',
];

const QUICK_PHRASES = [
  { label: 'Greeting', text: 'Hello, I hope you are having a wonderful day!' },
  { label: 'Business Inquiry', text: 'Dear Team, I am reaching out regarding our upcoming project proposal.' },
  { label: 'Somali Welcome', text: 'Soo dhawaaw, waxaan idiin rejaynaynaa guul iyo horumar.' },
  { label: 'Customer Support', text: 'Thank you for contacting our support team. We will resolve your issue shortly.' },
];

export const AiTranslationStudio: React.FC<AiTranslationStudioProps> = ({
  user,
  initialText = '',
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Main Translation State
  const [sourceLang, setSourceLang] = useState<string>('Auto Detect');
  const [targetLang, setTargetLang] = useState<string>('Somali');
  const [sourceText, setSourceText] = useState<string>(initialText || '');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [translationStyle, setTranslationStyle] = useState<string>('Natural');
  const [contextInstructions, setContextInstructions] = useState<string>('');

  // Processing & Errors
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [translationNotes, setTranslationNotes] = useState<string | null>(null);

  // Audio / Speech Synthesis State
  const [isSpeakingSource, setIsSpeakingSource] = useState<boolean>(false);
  const [isSpeakingTarget, setIsSpeakingTarget] = useState<boolean>(false);

  // Compare & Actions Mode
  const [showCompareMode, setShowCompareMode] = useState<boolean>(false);
  const [copiedSource, setCopiedSource] = useState<boolean>(false);
  const [copiedTarget, setCopiedTarget] = useState<boolean>(false);

  // Document & Image Mode
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);

  // Glossary State
  const [glossary, setGlossary] = useState<GlossaryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ais_translation_glossary');
      return saved
        ? JSON.parse(saved)
        : [
            { id: '1', term: 'AI Success Hub', translation: 'AI Success Hub' },
            { id: '2', term: 'Money Secrets', translation: 'Money Secrets' },
          ];
    } catch {
      return [];
    }
  });
  const [showGlossaryModal, setShowGlossaryModal] = useState<boolean>(false);
  const [newGlossaryTerm, setNewGlossaryTerm] = useState<string>('');
  const [newGlossaryTranslation, setNewGlossaryTranslation] = useState<string>('');

  // Translation History State
  const [history, setHistory] = useState<TranslationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ais_translation_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string>('');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync Glossary to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ais_translation_glossary', JSON.stringify(glossary));
    } catch (e) {
      console.warn('Failed to save glossary', e);
    }
  }, [glossary]);

  // Sync History to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ais_translation_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  }, [history]);

  // Primary Translation Dispatcher
  const handleTranslate = async (overrideAction?: string) => {
    if (!sourceText.trim() && !uploadedImageBase64) {
      setErrorMsg('Please enter text or upload an image/document to translate.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Somali Conversational Command Detection
    // e.g. "Waxaan rabaa qoraalkan inaan English ugu beddelo si professional ah"
    let effectiveTargetLang = targetLang;
    let effectiveStyle = translationStyle;

    const lowerInput = sourceText.toLowerCase();
    if (lowerInput.includes('english ugu beddel') || lowerInput.includes('translate to english')) {
      effectiveTargetLang = 'English';
    } else if (lowerInput.includes('soomaali ugu beddel') || lowerInput.includes('translate to somali')) {
      effectiveTargetLang = 'Somali';
    } else if (lowerInput.includes('arabic ugu beddel') || lowerInput.includes('translate to arabic')) {
      effectiveTargetLang = 'Arabic';
    }

    if (lowerInput.includes('professional') || lowerInput.includes('rasmi ah')) {
      effectiveStyle = 'Professional';
    }

    try {
      const res = await aiService.translateText({
        user,
        sourceLang,
        targetLang: effectiveTargetLang,
        text: sourceText,
        style: effectiveStyle,
        context: contextInstructions,
        glossary,
        action: overrideAction,
        imageBase64: uploadedImageBase64 || undefined,
      });

      if (!res.success) {
        if (res.reason === 'ai_daily' || res.reason === 'ai_monthly') {
          onTriggerUsageLimit?.(res.reason);
        }
        setErrorMsg(res.error || 'Failed to complete translation.');
        setLoading(false);
        return;
      }

      const outputText = res.data?.translatedText || '';
      const detected = res.data?.detectedSourceLanguage;
      const notes = res.data?.notes;

      setTranslatedText(outputText);
      if (detected && sourceLang === 'Auto Detect') {
        setDetectedLanguage(detected);
      }
      if (notes) {
        setTranslationNotes(notes);
      }

      // Add to history
      const historyItem: TranslationHistoryItem = {
        id: `trans-${Date.now()}`,
        sourceLang: detected || sourceLang,
        targetLang: effectiveTargetLang,
        sourceText: sourceText.slice(0, 300),
        translatedText: outputText.slice(0, 300),
        style: effectiveStyle,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        documentName: uploadedFileName || undefined,
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, 29)]);

      onIncrementAiUsage?.();
      onLogFileProcess(
        uploadedFileName || 'text_translation',
        sourceText.length,
        outputText.length,
        'ai-translator'
      );
    } catch (err: any) {
      console.error('Error translating text:', err);
      setErrorMsg('An error occurred while connecting to the AI Translation Workspace.');
    } finally {
      setLoading(false);
    }
  };

  // Swap Languages & Text
  const handleSwap = () => {
    let newSource = targetLang;
    let newTarget = sourceLang === 'Auto Detect' ? (detectedLanguage || 'English') : sourceLang;

    setSourceLang(newSource);
    setTargetLang(newTarget);

    if (translatedText.trim()) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  // Text-To-Speech Pronunciation
  const handleSpeak = (text: string, langName: string, type: 'source' | 'target') => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // stop existing speech

    if (type === 'source' && isSpeakingSource) {
      setIsSpeakingSource(false);
      return;
    }
    if (type === 'target' && isSpeakingTarget) {
      setIsSpeakingTarget(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Match BCP-47 language codes roughly
    const langMap: Record<string, string> = {
      English: 'en-US',
      Somali: 'so-SO',
      Arabic: 'ar-SA',
      French: 'fr-FR',
      Spanish: 'es-ES',
      German: 'de-DE',
      Italian: 'it-IT',
      Portuguese: 'pt-PT',
      Turkish: 'tr-TR',
      Chinese: 'zh-CN',
      Japanese: 'ja-JP',
      Korean: 'ko-KR',
      Hindi: 'hi-IN',
      Russian: 'ru-RU',
      Dutch: 'nl-NL',
      Swedish: 'sv-SE',
    };

    utterance.lang = langMap[langName] || 'en-US';

    utterance.onstart = () => {
      if (type === 'source') setIsSpeakingSource(true);
      else setIsSpeakingTarget(true);
    };

    utterance.onend = () => {
      if (type === 'source') setIsSpeakingSource(false);
      else setIsSpeakingTarget(false);
    };

    utterance.onerror = () => {
      if (type === 'source') setIsSpeakingSource(false);
      else setIsSpeakingTarget(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle File Upload (Documents: PDF, DOCX, TXT)
  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    setUploadedImagePreview(null);
    setUploadedImageBase64(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setSourceText(text);
      } else {
        setSourceText(
          `DOCUMENT LOADED: ${file.name}\n\nDocument structure and text loaded. Click 'Translate' to process.`
        );
      }
    };
    reader.readAsText(file);
  };

  // Handle Image OCR Upload
  const handleImageUpload = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImagePreview(result);
      setUploadedImageBase64(result);
      setSourceText(`[Image Loaded: ${file.name}] - Click 'Translate' to perform OCR & Translation.`);
    };
    reader.readAsDataURL(file);
  };

  // Download Output File
  const handleDownloadTranslation = (format: 'txt' | 'md' | 'doc') => {
    const filename = `Translated_${targetLang}_${Date.now()}.${format === 'doc' ? 'doc' : format}`;
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add Glossary Entry
  const handleAddGlossaryTerm = () => {
    if (!newGlossaryTerm.trim() || !newGlossaryTranslation.trim()) return;
    const item: GlossaryItem = {
      id: `glos-${Date.now()}`,
      term: newGlossaryTerm.trim(),
      translation: newGlossaryTranslation.trim(),
    };
    setGlossary((prev) => [...prev, item]);
    setNewGlossaryTerm('');
    setNewGlossaryTranslation('');
  };

  const handleRemoveGlossaryTerm = (id: string) => {
    setGlossary((prev) => prev.filter((g) => g.id !== id));
  };

  // Copy helper
  const handleCopy = (text: string, isSource: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSource) {
      setCopiedSource(true);
      setTimeout(() => setCopiedSource(false), 2000);
    } else {
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2000);
    }
  };

  const sourceWordCount = sourceText.trim().split(/\s+/).filter(Boolean).length;
  const sourceCharCount = sourceText.length;
  const targetWordCount = translatedText.trim().split(/\s+/).filter(Boolean).length;
  const targetCharCount = translatedText.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Bar Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Languages className="w-5 h-5 text-cyan-400" /> AI Translation Workspace
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                Multilingual AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Context-aware neural translation for text, documents & images with natural Somali & 50+ languages.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Glossary Button */}
          <button
            onClick={() => setShowGlossaryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Glossary</span>
            {glossary.length > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                {glossary.length}
              </span>
            )}
          </button>

          {/* Translation History Button */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">My Translations</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-700 text-slate-200 text-[10px] font-bold rounded-full">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Translation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-5">
        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. TOP CONTROL RIBBON: LANGUAGE SELECTORS & TRANSLATE OPTIONS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* SOURCE LANGUAGE */}
            <div className="md:col-span-5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Translate From
                </label>
                {detectedLanguage && sourceLang === 'Auto Detect' && (
                  <span className="text-[11px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                    Detected: {detectedLanguage}
                  </span>
                )}
              </div>
              <select
                value={sourceLang}
                onChange={(e) => {
                  setSourceLang(e.target.value);
                  setDetectedLanguage(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm font-bold text-white rounded-2xl p-3 focus:outline-none transition-all cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={`src-${lang}`} value={lang}>
                    {lang === 'Auto Detect' ? '🌐 Auto Detect Language' : lang}
                  </option>
                ))}
              </select>
            </div>

            {/* SWAP BUTTON */}
            <div className="md:col-span-2 flex justify-center py-1">
              <button
                onClick={handleSwap}
                className="p-3 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 rounded-2xl border border-slate-700 hover:border-cyan-400 transition-all shadow-lg hover:rotate-180 duration-300 flex items-center gap-1 font-bold text-xs"
                title="Swap Languages (⇄)"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="md:hidden">Swap</span>
              </button>
            </div>

            {/* TARGET LANGUAGE */}
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Translate To
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-sm font-bold text-white rounded-2xl p-3 focus:outline-none transition-all cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.filter((l) => l !== 'Auto Detect').map((lang) => (
                  <option key={`tgt-${lang}`} value={lang}>
                    {lang === 'Somali' ? '🇸🇴 Somali (Af-Soomaali)' : lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STYLE & CONTEXT INSTRUCTION ROW */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Style Selector */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 shrink-0">Style:</span>
              <select
                value={translationStyle}
                onChange={(e) => setTranslationStyle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                {TRANSLATION_STYLES.map((st) => (
                  <option key={st} value={st}>
                    {st} Mode
                  </option>
                ))}
              </select>
            </div>

            {/* Context Input */}
            <div className="md:col-span-8 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 shrink-0">Context:</span>
              <input
                type="text"
                value={contextInstructions}
                onChange={(e) => setContextInstructions(e.target.value)}
                placeholder='Optional context (e.g. "Product description", "Business email", "Legal agreement")'
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 2. TWO-PANEL WORKSPACE (SOURCE TEXT LEFT, TRANSLATED TEXT RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================= LEFT PANEL: SOURCE TEXT INPUT ================= */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header & Upload buttons */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" /> Source Content
                </span>

                <div className="flex items-center gap-2">
                  {/* File Upload Hidden Inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.doc,.docx,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
                    }}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0]);
                    }}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" /> Doc
                  </button>

                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> OCR Image
                  </button>
                </div>
              </div>

              {/* Uploaded Image Preview */}
              {uploadedImagePreview && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded preview"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">{uploadedFileName}</p>
                      <p className="text-[10px] text-emerald-400">Ready for OCR & Translation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedImagePreview(null);
                      setUploadedImageBase64(null);
                      setUploadedFileName(null);
                      setSourceText('');
                    }}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Source Textarea */}
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={12}
                placeholder="Type or paste text to translate... (e.g., 'Waxaan rabaa qoraalkan inaan English ugu beddelo si professional ah')"
                className="w-full bg-transparent text-slate-100 text-sm leading-relaxed placeholder-slate-600 focus:outline-none resize-y font-sans"
              />

              {/* Quick Starter Preset Phrases */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Quick Starters:</span>
                {QUICK_PHRASES.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => setSourceText(qp.text)}
                    className="px-2 py-0.5 bg-slate-950 text-slate-400 hover:text-cyan-300 text-[11px] rounded-lg border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Footer Stats & Action Buttons */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>
                  <strong>{sourceWordCount}</strong> Words
                </span>
                <span>•</span>
                <span>
                  <strong>{sourceCharCount}</strong> Chars
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(sourceText, sourceLang, 'source')}
                  disabled={!sourceText.trim()}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isSpeakingSource
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Listen Source Text (TTS)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopy(sourceText, true)}
                  disabled={!sourceText.trim()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all flex items-center gap-1"
                >
                  {copiedSource ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSource ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => {
                    setSourceText('');
                    setTranslatedText('');
                    setUploadedFileName(null);
                    setUploadedImagePreview(null);
                    setUploadedImageBase64(null);
                  }}
                  className="px-2.5 py-1 text-slate-500 hover:text-red-400 text-xs transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT PANEL: TRANSLATED RESULT ================= */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Translated Output ({targetLang})
                  </span>
                  {translationStyle !== 'Natural' && (
                    <span className="text-[10px] bg-slate-800 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                      {translationStyle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCompareMode(!showCompareMode)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      showCompareMode
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Compare Mode
                  </button>
                </div>
              </div>

              {/* Loader overlay */}
              {loading && (
                <div className="p-8 bg-slate-950/80 rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-center gap-3 animate-fade-in">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-xs font-bold text-white">Translating into {targetLang}...</p>
                  <p className="text-[11px] text-slate-400">Preserving terminology & native phrasing</p>
                </div>
              )}

              {/* Compare Mode View */}
              {showCompareMode && translatedText ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400">Original Text:</span>
                    <p className="text-xs text-slate-400 leading-relaxed max-h-28 overflow-y-auto">{sourceText}</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-400">Translation:</span>
                    <p className="text-xs text-slate-100 font-semibold leading-relaxed max-h-36 overflow-y-auto">
                      {translatedText}
                    </p>
                  </div>
                </div>
              ) : (
                /* Editable Result Textarea */
                <textarea
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  rows={12}
                  placeholder="Translation will appear here instantly..."
                  className="w-full bg-transparent text-slate-100 text-sm leading-relaxed placeholder-slate-600 focus:outline-none resize-y font-sans font-medium"
                />
              )}

              {/* Translation Notes / Nuances */}
              {translationNotes && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-xs text-cyan-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    💡 <span>Linguistic Nuances & Terminology Notes:</span>
                  </p>
                  <p className="text-[11px] text-cyan-200/90 leading-relaxed">{translationNotes}</p>
                </div>
              )}
            </div>

            {/* Target Footer Stats & Action Buttons */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between text-xs text-slate-400 gap-3">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>
                  <strong>{targetWordCount}</strong> Words
                </span>
                <span>•</span>
                <span>
                  <strong>{targetCharCount}</strong> Chars
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleSpeak(translatedText, targetLang, 'target')}
                  disabled={!translatedText.trim()}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isSpeakingTarget
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Listen Translation (TTS)"
                >
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => handleCopy(translatedText, false)}
                  disabled={!translatedText.trim()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all flex items-center gap-1 font-semibold"
                >
                  {copiedTarget ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTarget ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Download Formats */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownloadTranslation('txt')}
                    disabled={!translatedText.trim()}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700"
                  >
                    TXT
                  </button>
                  <button
                    onClick={() => handleDownloadTranslation('doc')}
                    disabled={!translatedText.trim()}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700"
                  >
                    DOCX
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRIMARY TRANSLATE BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4">
          <div className="text-xs text-slate-400">
            <span>Glossary Rules Active: </span>
            <strong className="text-cyan-400">{glossary.length} Term(s)</strong>
          </div>

          <button
            onClick={() => handleTranslate()}
            disabled={loading || (!sourceText.trim() && !uploadedImageBase64)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
            <span>{loading ? 'Translating Content...' : 'Translate Now'}</span>
          </button>
        </div>

        {/* 4. AI TRANSLATION ACTIONS CHIPS (REFINEMENTS) */}
        {translatedText.trim() && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 animate-fade-in">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-cyan-400" /> Refine Translation
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Improve Translation', action: 'Improve Translation' },
                { label: 'Make More Natural', action: 'Make More Natural' },
                { label: 'Make More Formal', action: 'Make More Formal' },
                { label: 'Make More Casual', action: 'Make More Casual' },
                { label: 'Simplify', action: 'Simplify' },
                { label: 'Keep Literal Meaning', action: 'Keep Literal Meaning' },
                { label: 'Fix Grammar', action: 'Fix Grammar' },
                { label: 'Re-translate', action: 'Re-translate' },
              ].map((act) => (
                <button
                  key={act.label}
                  onClick={() => handleTranslate(act.action)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all disabled:opacity-50"
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================= GLOSSARY MODAL ================= */}
      {showGlossaryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Translation Glossary</h3>
              </div>
              <button onClick={() => setShowGlossaryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Define custom terms, brand names, or technical acronyms that must remain exact and consistent across translations.
            </p>

            {/* Add New Term */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Source Term (e.g. AI Success Hub)"
                value={newGlossaryTerm}
                onChange={(e) => setNewGlossaryTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Required Translation"
                value={newGlossaryTranslation}
                onChange={(e) => setNewGlossaryTranslation(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={handleAddGlossaryTerm}
              disabled={!newGlossaryTerm.trim() || !newGlossaryTranslation.trim()}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all disabled:opacity-40"
            >
              + Add Glossary Entry
            </button>

            {/* Glossary Term List */}
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pt-2">
              {glossary.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No glossary terms added yet.</p>
              ) : (
                glossary.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-slate-200">{item.term}</strong>
                      <span className="mx-2 text-slate-600">➔</span>
                      <span className="text-cyan-300 font-semibold">{item.translation}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveGlossaryTerm(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TRANSLATION HISTORY MODAL ================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">My Translations History</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* History List */}
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No translation history saved yet.</p>
              ) : (
                history
                  .filter(
                    (h) =>
                      h.sourceText.toLowerCase().includes(searchHistory.toLowerCase()) ||
                      h.translatedText.toLowerCase().includes(searchHistory.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-cyan-400">
                          {item.sourceLang} ➔ {item.targetLang} ({item.style})
                        </span>
                        <span>{item.date}</span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 italic font-mono">{item.sourceText}</p>
                      <p className="text-xs text-slate-100 font-semibold line-clamp-2">{item.translatedText}</p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSourceLang(item.sourceLang);
                            setTargetLang(item.targetLang);
                            setSourceText(item.sourceText);
                            setTranslatedText(item.translatedText);
                            setShowHistoryModal(false);
                          }}
                          className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg"
                        >
                          Open & Edit
                        </button>
                        <button
                          onClick={() => handleCopy(item.translatedText, false)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => setHistory((prev) => prev.filter((h) => h.id !== item.id))}
                          className="text-slate-500 hover:text-red-400 p-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
