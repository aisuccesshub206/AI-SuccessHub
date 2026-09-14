import React, { useState, useEffect, useRef } from 'react';
import {
  Feather,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Upload,
  Send,
  Loader2,
  FileText,
  Wand2,
  Globe,
  Languages,
  RotateCcw,
  Sliders,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  Copy as CopyIcon,
  Search,
  Eye,
  FileDown,
  X,
  ChevronRight,
  MessageSquare,
  Zap,
  Info,
  Layers,
  BookOpen,
  Layout,
  Bookmark,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface AiWritingAssistantStudioProps {
  user?: UserProfile;
  initialText?: string;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export interface WritingDraft {
  id: string;
  title: string;
  writingType: string;
  content: string;
  updatedAt: string;
  wordCount: number;
}

const WRITING_TYPES = [
  'General Writing',
  'Email',
  'Business Proposal',
  'Report',
  'Essay',
  'Article',
  'Blog',
  'Social Media Post',
  'Caption',
  'Advertisement',
  'Product Description',
  'Marketing Copy',
  'YouTube Script',
  'Speech',
  'Story',
  'Letter',
  'Resume / CV',
  'Cover Letter',
  'LinkedIn Post',
  'School Assignment',
  'Research Notes',
  'Presentation',
  'Other',
];

const TEMPLATES = [
  {
    title: 'Business Email',
    type: 'Email',
    tone: 'Professional',
    description: 'Polished client outreach or executive follow-up email.',
    starter: `Subject: Strategic Proposal & Project Next Steps\n\nDear [Name],\n\nI hope this email finds you well. I am writing to share our updated proposal for [Project Name]. Our team has carefully reviewed your requirements and prepared a comprehensive execution plan.\n\nKey Highlights:\n- Expedited delivery timeline\n- Dedicated technical support\n- Optimized budget allocation\n\nPlease let me know if you are available for a 15-minute call this week to review.\n\nBest regards,\n[Your Name]`,
  },
  {
    title: 'LinkedIn Post',
    type: 'LinkedIn Post',
    tone: 'Confident',
    description: 'Engaging, professional post for personal brand & industry leadership.',
    starter: `🚀 3 Essential Lessons I Learned Scaling AI Solutions in 2026\n\nBuilding impactful technology isn't just about code—it's about solving real human problems.\n\nHere are 3 core takeaways from our latest project launch:\n\n1️⃣ Clarity trumps feature complexity.\n2️⃣ Customer feedback loop is your best compass.\n3️⃣ Execution consistency creates long-term value.\n\nWhat is your biggest focus this quarter? Let's discuss in the comments below! 👇\n\n#AI #Innovation #Leadership #TechTrends`,
  },
  {
    title: 'Product Description',
    type: 'Product Description',
    tone: 'Persuasive',
    description: 'High-converting copy detailing benefits and features.',
    starter: `Introducing [Product Name]: The Ultimate Productivity Companion.\n\nDesigned for modern creators and professionals, [Product Name] combines sleek craftsmanship with high-performance functionality. Experience seamless efficiency without compromising on aesthetic precision.\n\nKey Benefits:\n• Premium ergonomic design\n• Ultra-fast processing & multi-device sync\n• Eco-friendly, sustainable materials\n\nElevate your daily workflow today.`,
  },
  {
    title: 'Business Proposal',
    type: 'Business Proposal',
    tone: 'Formal',
    description: 'Structured proposal covering scope, timeline, and investment.',
    starter: `EXECUTIVE PROJECT PROPOSAL\nPrepared for: [Client Organization]\nPrepared by: [Your Company]\nDate: [Current Date]\n\n1. EXECUTIVE SUMMARY\nThis proposal outlines our proposed strategy to modernize [Client Goal/Process]. Our primary objective is to drive operational efficiency by 35% within 90 days.\n\n2. SCOPE OF WORK\n- Phase 1: Needs Assessment & Architectural Audit\n- Phase 2: Implementation & Integration\n- Phase 3: Testing, Training & Handover\n\n3. EXPECTED OUTCOMES & RETURN ON INVESTMENT\nBy streamlining core operations, your organization will reduce friction and accelerate overall output.`,
  },
  {
    title: 'Social Media Post',
    type: 'Social Media Post',
    tone: 'Casual',
    description: 'Catchy, bite-sized update with hashtags for maximum reach.',
    starter: `Big news coming soon! 🎉 We've been working behind the scenes on something very special. Stay tuned for tomorrow's reveal! 🔥✨ #NewLaunch #ComingSoon #TechNews`,
  },
  {
    title: 'Somali Professional Letter',
    type: 'Letter',
    tone: 'Professional',
    description: 'Qoraal rasmi ah oo ku qoran Af-Soomaali gosho ah.',
    starter: `KU: [Mudanaha/Marwo]\nIJAABO: [Mawduuca Qoraalka]\nTAARIIKH: [Taariikhda Maanta]\n\nQaddarin iyo tixgelin ka dib,\n\nWaxaan qoraalkan idiinkugu soo gudbinayaa [Ujeeddada guud ee qoraalka]. Hawshani waxay ahmiyad gaar ah u leedahay [Sharaxaad gaaban oo ku saabsan faa'iidada ama sababta].\n\nWaddada guusha waxay ku dhisantahay iskaashi iyo hawl-karnimo. Waxaan rejaynaynaa in wadahadalkani uu noqdo mid miro dhal ah.\n\nMahadsanidiin,\n[Magacaaga & Xilkaaga]`,
  },
];

const AI_ACTION_CATEGORIES = [
  {
    category: 'WRITE',
    color: 'from-blue-500 to-cyan-500',
    actions: [
      { name: 'Write from Idea', desc: 'Generate complete draft from topic' },
      { name: 'Continue Writing', desc: 'Seamlessly add next paragraphs' },
      { name: 'Create Draft', desc: 'Build structured initial outline' },
      { name: 'Brainstorm Ideas', desc: 'Provide 5 creative concepts' },
    ],
  },
  {
    category: 'IMPROVE',
    color: 'from-emerald-500 to-teal-500',
    actions: [
      { name: 'Improve Writing', desc: 'General flow & polish' },
      { name: 'Make More Professional', desc: 'Elevate business tone' },
      { name: 'Make More Natural', desc: 'Smooth out robotic phrasing' },
      { name: 'Make More Engaging', desc: 'Add hook & vivid wording' },
      { name: 'Improve Clarity', desc: 'Eliminate confusion' },
      { name: 'Improve Vocabulary', desc: 'Use stronger word choices' },
    ],
  },
  {
    category: 'REWRITE',
    color: 'from-indigo-500 to-purple-500',
    actions: [
      { name: 'Rewrite', desc: 'Fresh restatement of text' },
      { name: 'Simplify', desc: 'Make clear & easy to read' },
      { name: 'Shorten', desc: 'Trim fluff while keeping core' },
      { name: 'Expand', desc: 'Elaborate with details & context' },
      { name: 'Change Tone', desc: 'Shift style dynamically' },
      { name: 'Paraphrase', desc: 'Restructure sentences' },
    ],
  },
  {
    category: 'CORRECT',
    color: 'from-amber-500 to-orange-500',
    actions: [
      { name: 'Fix Grammar', desc: 'Correct syntax errors' },
      { name: 'Fix Spelling', desc: 'Fix typos & spelling' },
      { name: 'Fix Punctuation', desc: 'Refine commas & periods' },
      { name: 'Improve Sentence Structure', desc: 'Fix run-ons & awkward phrasing' },
    ],
  },
  {
    category: 'TRANSFORM',
    color: 'from-pink-500 to-rose-500',
    actions: [
      { name: 'Make Professional', desc: 'Formal executive style' },
      { name: 'Make Friendly', desc: 'Warm & welcoming tone' },
      { name: 'Make Persuasive', desc: 'High conversion sales style' },
      { name: 'Make Academic', desc: 'Scholarly & research style' },
      { name: 'Make Conversational', desc: 'Relaxed dialogue style' },
      { name: 'Make Concise', desc: 'Punchy & direct bullet points' },
    ],
  },
];

export const AiWritingAssistantStudio: React.FC<AiWritingAssistantStudioProps> = ({
  user,
  initialText = '',
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Document State
  const [documentTitle, setDocumentTitle] = useState<string>('Untitled Document');
  const [editorContent, setEditorContent] = useState<string>(
    initialText ||
      `Start writing or paste your text here...\n\nYou can ask AI to write from scratch, polish existing drafts, rephrase sentences, fix grammar, or translate naturally into Somali or other languages.`
  );
  const [writingType, setWritingType] = useState<string>('General Writing');

  // History Undo/Redo stack
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Selection & Inline AI State
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  // Style Settings
  const [tone, setTone] = useState<string>('Professional');
  const [creativity, setCreativity] = useState<string>('Balanced');
  const [lengthSetting, setLengthSetting] = useState<string>('Standard');
  const [outputLanguage, setOutputLanguage] = useState<string>('Auto Detect');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Natural Command & Write From Idea Modals/State
  const [commandText, setCommandText] = useState<string>('');
  const [showIdeaModal, setShowIdeaModal] = useState<boolean>(false);
  const [ideaInput, setIdeaInput] = useState<string>('');

  // Execution & Processing States
  const [processing, setProcessing] = useState<boolean>(false);
  const [activeActionLabel, setActiveActionLabel] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Side-by-Side Comparison State
  const [comparisonResult, setComparisonResult] = useState<{
    original: string;
    improved: string;
    explanation?: string;
    actionPerformed?: string;
    suggestions?: string[];
  } | null>(null);

  // Saved Drafts State ("My Writing")
  const [savedDrafts, setSavedDrafts] = useState<WritingDraft[]>(() => {
    try {
      const saved = localStorage.getItem('ais_saved_writing_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showDraftsModal, setShowDraftsModal] = useState<boolean>(false);
  const [searchDraftQuery, setSearchDraftQuery] = useState<string>('');

  // UI Tabs (Mobile & Desktop Panels)
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'actions' | 'style' | 'drafts'>('editor');
  const [copied, setCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save drafts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ais_saved_writing_drafts', JSON.stringify(savedDrafts));
    } catch (e) {
      console.warn('Failed to save writing drafts', e);
    }
  }, [savedDrafts]);

  // Push state to undo stack when editorContent changes significantly
  const updateContentWithHistory = (newContent: string) => {
    setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), newContent]);
    setHistoryIndex((prev) => prev + 1);
    setEditorContent(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditorContent(historyStack[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditorContent(historyStack[historyIndex + 1]);
    }
  };

  // Document Text Selection Listener
  const handleTextSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        const selected = editorContent.substring(start, end);
        if (selected.trim().length > 0) {
          setSelectedText(selected);
          setSelectionRange({ start, end });
          return;
        }
      }
    }
    setSelectedText('');
    setSelectionRange(null);
  };

  // Upload Document File (PDF, DOCX, TXT)
  const handleFileUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        updateContentWithHistory(text);
      } else {
        updateContentWithHistory(
          `Document Loaded (${file.name}):\n\nContent extracted from ${file.name}. You can now improve, rewrite, format, or analyze this text.`
        );
      }
    };
    reader.readAsText(file);
  };

  // Core AI Action Dispatcher
  const handleRunAiAction = async (
    actionType: string,
    actionName?: string,
    customCommand?: string,
    customIdea?: string
  ) => {
    const currentTextToProcess = selectedText || editorContent;

    if (actionType === 'write-from-idea' && !customIdea && !ideaInput) {
      setErrorMsg('Please enter an idea or topic first.');
      return;
    }

    if (actionType !== 'write-from-idea' && !currentTextToProcess.trim()) {
      setErrorMsg('Please enter or select text in the editor before applying AI actions.');
      return;
    }

    setProcessing(true);
    setActiveActionLabel(actionName || actionType || 'AI Action');
    setErrorMsg(null);

    try {
      const res = await aiService.executeWritingAction({
        user,
        actionType,
        actionName,
        writingType,
        editorContent,
        selectedText: selectedText || undefined,
        ideaInput: customIdea || ideaInput,
        commandText: customCommand || commandText,
        tone,
        length: lengthSetting,
        creativity,
        language: outputLanguage,
      });

      if (!res.success) {
        if (res.reason === 'ai_daily' || res.reason === 'ai_monthly') {
          onTriggerUsageLimit?.(res.reason);
        }
        setErrorMsg(res.error || 'Failed to process AI writing request.');
        setProcessing(false);
        return;
      }

      const output = res.data?.resultText || '';
      const explanation = res.data?.explanation;
      const suggestions = res.data?.suggestions;

      // Show Side-by-Side comparison if modifying existing text or selected snippet
      if (actionType !== 'write-from-idea' && currentTextToProcess.trim()) {
        setComparisonResult({
          original: currentTextToProcess,
          improved: output,
          explanation: explanation || `Applied action: ${actionName || actionType}`,
          actionPerformed: actionName || actionType,
          suggestions,
        });
      } else {
        // Direct replacement or new draft generation
        updateContentWithHistory(output);
      }

      onIncrementAiUsage?.();
      onLogFileProcess(documentTitle, currentTextToProcess.length, output.length, 'ai-writing-assistant');

      // Clear idea modal/command text if used
      if (showIdeaModal) setShowIdeaModal(false);
      setCommandText('');
    } catch (err: any) {
      console.error('Error running AI writing action:', err);
      setErrorMsg('An error occurred while processing the writing request.');
    } finally {
      setProcessing(false);
    }
  };

  // Accept Comparison Change
  const handleAcceptComparison = () => {
    if (!comparisonResult) return;

    if (selectionRange && selectedText) {
      // Replace only selected range
      const before = editorContent.substring(0, selectionRange.start);
      const after = editorContent.substring(selectionRange.end);
      const newText = before + comparisonResult.improved + after;
      updateContentWithHistory(newText);
    } else {
      // Replace entire editor
      updateContentWithHistory(comparisonResult.improved);
    }

    setComparisonResult(null);
    setSelectedText('');
    setSelectionRange(null);
  };

  // Reject Comparison Change
  const handleRejectComparison = () => {
    setComparisonResult(null);
  };

  // Save Draft to "My Writing"
  const handleSaveDraft = () => {
    const wordCount = editorContent.trim().split(/\s+/).filter(Boolean).length;
    const newDraft: WritingDraft = {
      id: `draft-${Date.now()}`,
      title: documentTitle || 'Untitled Writing',
      writingType,
      content: editorContent,
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      wordCount,
    };

    setSavedDrafts((prev) => [newDraft, ...prev.filter((d) => d.title !== documentTitle)]);
    setShowDraftsModal(true);
  };

  // Load Template
  const handleSelectTemplate = (template: (typeof TEMPLATES)[0]) => {
    setDocumentTitle(template.title);
    setWritingType(template.type);
    setTone(template.tone);
    updateContentWithHistory(template.starter);
  };

  // Format Helper Buttons (Markdown/Text wrappers)
  const handleApplyFormat = (syntax: 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'bullet' | 'number') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = editorContent.substring(start, end) || 'text';

    let formatted = selected;
    if (syntax === 'bold') formatted = `**${selected}**`;
    if (syntax === 'italic') formatted = `*${selected}*`;
    if (syntax === 'underline') formatted = `<u>${selected}</u>`;
    if (syntax === 'h1') formatted = `\n# ${selected}\n`;
    if (syntax === 'h2') formatted = `\n## ${selected}\n`;
    if (syntax === 'bullet') formatted = `\n- ${selected}`;
    if (syntax === 'number') formatted = `\n1. ${selected}`;

    const before = editorContent.substring(0, start);
    const after = editorContent.substring(end);
    updateContentWithHistory(before + formatted + after);
  };

  // Export handlers
  const handleCopyText = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md' | 'doc') => {
    const filename = `${documentTitle.replace(/\s+/g, '_')}.${format === 'doc' ? 'doc' : format}`;
    const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Word & Readability Statistics
  const words = editorContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = editorContent.length;
  const sentenceCount = editorContent.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Simple Readability Heuristic
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  let readabilityGrade = 'Easy to Read';
  if (avgWordsPerSentence > 22) readabilityGrade = 'Complex / Advanced';
  else if (avgWordsPerSentence > 15) readabilityGrade = 'Professional / Standard';

  // Warnings / Long Sentences
  const longSentencesCount = editorContent
    .split(/[.!?]+/)
    .filter((s) => s.trim().split(/\s+/).length > 25).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center justify-between">
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
                <Feather className="w-5 h-5 text-cyan-400" /> AI Writing Workspace
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                Pro Editor
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Write, edit, polish, rewrite & transform text with intelligent inline AI controls.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Write from idea shortcut */}
          <button
            onClick={() => setShowIdeaModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span className="hidden sm:inline">Write from Idea</span>
          </button>

          {/* Drafts Drawer Toggle */}
          <button
            onClick={() => setShowDraftsModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">My Writing</span>
            {savedDrafts.length > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-black text-[10px] rounded-full">
                {savedDrafts.length}
              </span>
            )}
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-all flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (3-Column Desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* Error Banner */}
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

        {/* Mobile View Tab Selector */}
        <div className="flex lg:hidden bg-slate-900 p-1.5 rounded-2xl border border-slate-800 justify-around text-xs font-bold">
          <button
            onClick={() => setActiveMobileTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeMobileTab === 'editor' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <Edit3 className="w-4 h-4" /> Editor
          </button>
          <button
            onClick={() => setActiveMobileTab('actions')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeMobileTab === 'actions' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <Wand2 className="w-4 h-4" /> AI Actions
          </button>
          <button
            onClick={() => setActiveMobileTab('style')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeMobileTab === 'style' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-4 h-4" /> Style & Analysis
          </button>
        </div>

        {/* Desktop 3-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT SIDEBAR: AI ACTIONS LIBRARY & TEMPLATES (3 Cols) ================= */}
          <div
            className={`lg:col-span-3 space-y-4 ${
              activeMobileTab === 'actions' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Quick Somali Preset */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-emerald-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Af-Soomaali Direct
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Somali Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Soomaalida waa loo habeeyay. Waxaad ku qori kartaa ama ku amri kartaa Af-Soomaali.
              </p>
              <button
                onClick={() => {
                  setOutputLanguage('Somali');
                  handleRunAiAction('natural-command', 'Af-Soomaali Ku Qor', 'Qoraalkan iga dhig mid professional ah oo Af-Soomaali ku qoran.');
                }}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>🇸🇴 Sii Horumari / Six Af-Soomaaliga</span>
              </button>
            </div>

            {/* Categorized AI Action Chips */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cyan-400" /> What Do You Want To Do?
              </h3>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {AI_ACTION_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`} />
                      <span className="text-xs font-bold text-slate-300 tracking-wide">{cat.category}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {cat.actions.map((act) => (
                        <button
                          key={act.name}
                          onClick={() => {
                            if (act.name === 'Write from Idea') {
                              setShowIdeaModal(true);
                            } else {
                              handleRunAiAction(cat.category.toLowerCase(), act.name);
                            }
                          }}
                          disabled={processing}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all group flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                              {act.name}
                            </p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{act.desc}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Templates Library */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-cyan-400" /> Starter Templates
              </h3>
              <div className="space-y-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white">
                        {tmpl.title}
                      </p>
                      <p className="text-[10px] text-slate-500">{tmpl.type}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-cyan-400 group-hover:underline">
                      Load
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= CENTER COLUMN: MAIN DOCUMENT EDITOR (6 Cols) ================= */}
          <div
            className={`lg:col-span-6 space-y-4 ${
              activeMobileTab === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Document Header & Type Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Title Input */}
                <div className="flex items-center gap-2 flex-1">
                  <Edit3 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Document Title..."
                    className="bg-transparent text-base font-bold text-white focus:outline-none w-full border-b border-transparent focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Writing Type Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-semibold shrink-0">Type:</label>
                  <select
                    value={writingType}
                    onChange={(e) => setWritingType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                  >
                    {WRITING_TYPES.map((wt) => (
                      <option key={wt} value={wt}>
                        {wt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Natural AI Command Input Box */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-1.5 pl-3 focus-within:border-cyan-500 transition-all">
                  <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    value={commandText}
                    onChange={(e) => setCommandText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && commandText.trim()) {
                        handleRunAiAction('natural-command', 'Custom Command', commandText);
                      }
                    }}
                    placeholder='Tell AI what you want to change (e.g., "Make this more professional", "Qoraalkan iga dhig mid professional ah")...'
                    className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRunAiAction('natural-command', 'Custom Command', commandText)}
                    disabled={processing || !commandText.trim()}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1 transition-all disabled:opacity-40"
                  >
                    {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Apply</span>
                  </button>
                </div>

                {/* Natural Command Examples */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Quick Commands:</span>
                  {[
                    'Make more professional',
                    'Simplify for beginners',
                    'Translate to natural Somali',
                    'Rewrite as a LinkedIn post',
                    'Make shorter & punchy',
                  ].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => {
                        setCommandText(cmd);
                        handleRunAiAction('natural-command', 'Custom Command', cmd);
                      }}
                      className="px-2 py-0.5 bg-slate-950 text-slate-400 hover:text-cyan-300 text-[11px] rounded-lg border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FORMATTING TOOLBAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleApplyFormat('bold')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Bold (**text**)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApplyFormat('italic')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Italic (*text*)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApplyFormat('underline')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <span className="h-4 w-px bg-slate-800 mx-1" />
                <button
                  onClick={() => handleApplyFormat('h1')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApplyFormat('h2')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApplyFormat('bullet')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApplyFormat('number')}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= historyStack.length - 1}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-30"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <span className="h-4 w-px bg-slate-800 mx-1" />
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.doc,.docx,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg flex items-center gap-1 text-xs"
                  title="Upload Document"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Upload</span>
                </button>
              </div>
            </div>

            {/* INLINE AI FLOATING TOOLBAR (WHEN TEXT IS SELECTED) */}
            {selectedText && (
              <div className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border border-cyan-500/40 rounded-2xl p-2.5 shadow-xl flex flex-wrap items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Selection AI Actions:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {['Improve', 'Rewrite', 'Shorten', 'Expand', 'Fix Grammar', 'Change Tone'].map((act) => (
                    <button
                      key={act}
                      onClick={() => handleRunAiAction('inline-edit', act)}
                      disabled={processing}
                      className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-200 hover:text-slate-950 text-xs font-bold rounded-lg border border-cyan-500/30 transition-all disabled:opacity-50"
                    >
                      {act}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setSelectedText('');
                      setSelectionRange(null);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SIDE-BY-SIDE COMPARISON CARD (WHEN ACTIVE) */}
            {comparisonResult && (
              <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 space-y-4 shadow-2xl animate-fade-in relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">
                      AI Edit Preview ({comparisonResult.actionPerformed})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAcceptComparison}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Check className="w-4 h-4" /> Accept Changes
                    </button>
                    <button
                      onClick={handleRejectComparison}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ORIGINAL */}
                  <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Original
                    </span>
                    <p className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {comparisonResult.original}
                    </p>
                  </div>

                  {/* IMPROVED */}
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Improved AI Result
                    </span>
                    <p className="text-xs text-slate-100 font-sans leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {comparisonResult.improved}
                    </p>
                  </div>
                </div>

                {comparisonResult.explanation && (
                  <p className="text-xs text-cyan-300/90 bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                    💡 <strong>Summary of Improvements:</strong> {comparisonResult.explanation}
                  </p>
                )}
              </div>
            )}

            {/* MAIN TEXTAREA DOCUMENT EDITOR */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
              {processing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-3xl z-20 flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="text-sm font-bold text-white">
                      Processing AI Action: {activeActionLabel}...
                    </span>
                  </div>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={(e) => updateContentWithHistory(e.target.value)}
                onSelect={handleTextSelect}
                onKeyUp={handleTextSelect}
                onMouseUp={handleTextSelect}
                rows={16}
                placeholder="Start writing or paste your text here..."
                className="w-full bg-transparent text-slate-100 text-sm leading-relaxed placeholder-slate-600 focus:outline-none resize-y font-sans font-normal"
              />

              {/* EDITOR BOTTOM STATS BAR */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <div className="flex items-center gap-3 font-mono">
                  <span>
                    <strong>{wordCount}</strong> Words
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{charCount}</strong> Chars
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{sentenceCount}</strong> Sentences
                  </span>
                  <span>•</span>
                  <span>~{readingTimeMin} min read</span>
                </div>

                {/* Readability Grade Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-800 text-cyan-300 font-semibold rounded-lg border border-slate-700 text-[11px]">
                    📖 {readabilityGrade}
                  </span>
                  {longSentencesCount > 0 && (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-lg border border-amber-500/30">
                      ⚠️ {longSentencesCount} Long Sentence(s)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* EXPORT / ACTION BAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Content'}</span>
                </button>

                <button
                  onClick={() => updateContentWithHistory('')}
                  className="px-3 py-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 text-xs font-semibold rounded-xl transition-all"
                >
                  Clear Editor
                </button>
              </div>

              {/* Download Formats */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Export:</span>
                <button
                  onClick={() => handleDownload('txt')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
                >
                  TXT
                </button>
                <button
                  onClick={() => handleDownload('md')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
                >
                  MD
                </button>
                <button
                  onClick={() => handleDownload('doc')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
                >
                  DOCX
                </button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR: WRITING STYLE & ANALYSIS (3 Cols) ================= */}
          <div
            className={`lg:col-span-3 space-y-4 ${
              activeMobileTab === 'style' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* WRITING STYLE CONTROLS PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Writing Style Controls
                </h3>
                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  {showAdvancedSettings ? 'Hide Advanced' : 'Advanced'}
                </button>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  {[
                    'Professional',
                    'Friendly',
                    'Confident',
                    'Persuasive',
                    'Casual',
                    'Academic',
                    'Creative',
                    'Empathetic',
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Output Language Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Output Language</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Somali Supported</span>
                </label>
                <select
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="Auto Detect">Auto Detect (Same as Input)</option>
                  <option value="Somali">🇸🇴 Somali (Af-Soomaali)</option>
                  <option value="English">🇺🇸 English</option>
                  <option value="Arabic">🇸🇦 Arabic (العربية)</option>
                  <option value="French">🇫🇷 French (Français)</option>
                  <option value="Spanish">🇪🇸 Spanish (Español)</option>
                  <option value="German">🇩🇪 German (Deutsch)</option>
                </select>
              </div>

              {/* Length & Creativity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Length</label>
                  <select
                    value={lengthSetting}
                    onChange={(e) => setLengthSetting(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Short">Short</option>
                    <option value="Standard">Standard</option>
                    <option value="Detailed">Detailed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Creativity</label>
                  <select
                    value={creativity}
                    onChange={(e) => setCreativity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Low">Low (Factual)</option>
                    <option value="Balanced">Balanced</option>
                    <option value="High">High (Creative)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Settings Drawer */}
              {showAdvancedSettings && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400 animate-fade-in">
                  <p className="font-semibold text-slate-300">Advanced Parameters:</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800" />
                    <span>Auto-harmonize headings and list formats</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800" />
                    <span>Preserve technical terminology & jargon</span>
                  </label>
                </div>
              )}
            </div>

            {/* READABILITY & WRITING ANALYSIS CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Readability & Analysis
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Reading Level</span>
                  <span className="font-bold text-cyan-300">{readabilityGrade}</span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Avg Words / Sentence</span>
                  <span className="font-mono font-bold text-slate-200">
                    {avgWordsPerSentence.toFixed(1)}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Long Sentences (&gt;25 words)</span>
                  <span className={`font-mono font-bold ${longSentencesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {longSentencesCount}
                  </span>
                </div>
              </div>
            </div>

            {/* AI SUGGESTIONS & SMART IMPROVEMENTS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> AI Writing Suggestions
              </h3>

              {longSentencesCount > 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-2">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Simplify long sentences
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    You have {longSentencesCount} long sentence(s). Consider splitting them for smoother readability.
                  </p>
                  <button
                    onClick={() => handleRunAiAction('rewrite', 'Simplify')}
                    className="w-full py-1.5 bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg transition-all"
                  >
                    Auto-Simplify Sentences
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Text is clear and easy to follow.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= WRITE FROM IDEA MODAL ================= */}
      {showIdeaModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" /> Write From Idea
              </h2>
              <button
                onClick={() => setShowIdeaModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  What do you want to write?
                </label>
                <textarea
                  rows={4}
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  placeholder='e.g., "I want to write a professional announcement for my new AI website."'
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Writing Type</label>
                  <select
                    value={writingType}
                    onChange={(e) => setWritingType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {WRITING_TYPES.map((wt) => (
                      <option key={wt} value={wt}>
                        {wt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {['Professional', 'Friendly', 'Casual', 'Formal', 'Persuasive', 'Creative'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowIdeaModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRunAiAction('write-from-idea', 'Write from Idea')}
                disabled={processing || !ideaInput.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Write for Me</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MY WRITING / DRAFTS MODAL ================= */}
      {showDraftsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative animate-fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">My Writing Drafts</h2>
              </div>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Drafts */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchDraftQuery}
                onChange={(e) => setSearchDraftQuery(e.target.value)}
                placeholder="Search saved documents..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Drafts List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {savedDrafts.filter(
                (d) =>
                  d.title.toLowerCase().includes(searchDraftQuery.toLowerCase()) ||
                  d.writingType.toLowerCase().includes(searchDraftQuery.toLowerCase())
              ).length > 0 ? (
                savedDrafts
                  .filter(
                    (d) =>
                      d.title.toLowerCase().includes(searchDraftQuery.toLowerCase()) ||
                      d.writingType.toLowerCase().includes(searchDraftQuery.toLowerCase())
                  )
                  .map((draft) => (
                    <div
                      key={draft.id}
                      className="p-3.5 bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 group transition-all"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{draft.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {draft.writingType} • {draft.wordCount} words • {draft.updatedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setDocumentTitle(draft.title);
                            setWritingType(draft.writingType);
                            updateContentWithHistory(draft.content);
                            setShowDraftsModal(false);
                          }}
                          className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-xl border border-cyan-500/30 transition-all"
                        >
                          Open
                        </button>
                        <button
                          onClick={() =>
                            setSavedDrafts((prev) => prev.filter((d) => d.id !== draft.id))
                          }
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                          title="Delete draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No saved writing drafts found. Click "Save" in the editor header to store drafts!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
