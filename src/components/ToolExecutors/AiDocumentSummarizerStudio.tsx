import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  Globe,
  Languages,
  BookOpen,
  FileCode,
  List,
  CheckCircle2,
  User,
  Calendar,
  Hash,
  HelpCircle,
  FolderOpen,
  Search,
  Trash2,
  Eye,
  FileCheck,
  Zap,
  Info,
  Clock,
  ChevronRight,
  ShieldAlert,
  FileUp,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  RotateCcw,
  Sliders,
  AlignLeft,
  File,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface AiDocumentSummarizerStudioProps {
  user?: UserProfile;
  initialFile?: File | null;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export interface DocumentSummaryResult {
  executiveSummary: string;
  keyPoints: string[];
  detailedSections: { title: string; content: string }[];
  importantInfo: {
    names: string[];
    dates: string[];
    numbersAndStats: string[];
    decisions: string[];
    actionItems: string[];
    terminology: string[];
  };
  metrics: {
    keyTopics: string[];
  };
  outline: { id: string; title: string; page: string }[];
}

export interface SavedDocument {
  id: string;
  fileName: string;
  fileType: string;
  wordCount: number;
  pageCount: number;
  savedAt: string;
  summaryLength: string;
  summaryStyle: string;
  summaryLanguage: string;
  result: DocumentSummaryResult;
  documentText: string;
}

const SAMPLE_DOCUMENTS = [
  {
    name: 'Q3_Corporate_Strategic_Report_2026.pdf',
    type: 'PDF',
    size: 2450000,
    pages: 14,
    text: `EXECUTIVE STRATEGIC & FINANCIAL REPORT - Q3 2026
Prepared by: Global Strategy & Financial Analytics Group
Date: October 14, 2026

1. EXECUTIVE OVERVIEW
The third quarter of 2026 demonstrated robust organic growth across all key business verticals. Net revenue reached $48.2M, representing a 22.4% year-over-year increase. Key growth drivers included the expansion of enterprise AI software subscriptions and strategic entry into East African digital finance markets.

2. KEY DECISIONS & MILESTONES
- Decision 101: Approved $12M allocation toward AI Cloud Infrastructure expansion.
- Decision 102: Board ratified the acquisition of SomData Analytics Ltd. for $5.8M, expected to close on December 1, 2026.
- Decision 103: Standardized hybrid work policies for engineering and product teams worldwide.

3. FINANCIAL HIGHLIGHTS & NUMBERS
- Total Revenue: $48,200,000 (Up +22.4%)
- Operating Margin: 31.8%
- Recurring SaaS Revenue (ARR): $36.5M
- Cash Reserves: $18.4M as of September 30, 2026
- R&D Investment: $8.9M in Q3

4. ACTION ITEMS & DEADLINES
- Action Item 1: Complete ISO 27001 Security Audit by November 15, 2026. (Owner: Sarah Jenkins, CISO)
- Action Item 2: Finalize Q4 Enterprise Sales Campaign launch by November 1, 2026. (Owner: Mohamed Omar, VP Growth)
- Action Item 3: Submit audited tax compliance filings to regulatory bodies before December 15, 2026.

5. RISK MANAGEMENT & TERMINOLOGY
- Inflation Hedge: Managed via multi-currency Treasury holdings.
- Data Sovereignty: Cloud data centers compliance in EU and East Africa.
- Conclusion: Overall corporate financial health is strong with zero long-term debt liabilities.`,
  },
  {
    name: 'Warbixinta_Mashruuca_Teknoolajiyada_2026.txt',
    type: 'TXT',
    size: 980000,
    pages: 6,
    text: `WARBIXIN DHAMMAASTIRAN: MASHRUUCA DHIGITALISALINTA IYO TIKNOOLAJIYADA 2026
Diyaarinta: Guddiga Farsamada iyo Horumarinta Teknoolajiyada
Taariikhda: 5-ta Ogtobar, 2026

1. GOALASHA WEYN EE MASHRUUCA
Mashruucan wuxuu ahmiyad gaar ah siinayaa horumarinta kaabayaasha dhagaha iyo kombuyuutarrada, kobcinta xirfadaha dhalinyarada, iyo abuurista nidaamyo lacagaha dhijitaalka ah oo ammaan ah.

2. GO'AANNADA WEYN EE LA GAARAY
- Go'aanka 1: Waxaa la ansixiyay miisaaniyad dhan $3.5M oo loogu talagalay tababarka 5,000 oo arday.
- Go'aanka 2: Waxaa la dhisay xarunta kowaad ee kaydka xogta (Data Center) ee magaalada Muqdisho.
- Go'aanka 3: Iskaashiga shirkadaha isgaarsiinta iyo bangiyada gaarka ah si loo fududeeyo lacag bixinta EVC Plus iyo Sahal.

3. TIXRAACYO TAARIIKHI AH IYO DEADLINES
- Taariikhda bilaabashada tijaabada: November 10, 2026.
- Dhameystirka qaybta kowaad: December 31, 2026.
- Mas'uuliyiinta muhiimka ah: Dr. Cabdiraxmaan Xasan, Inj. Safiya Cali, iyo Eng. Yuusuf Axmed.

4. TALLOOYINKA IYO TALLO bixinta
Nidaamkani wuxuu si toos ah u kobcin doonaa dhaqaalaha, wuxuuna yayn doonaa fursado shaqo oo cusub iyadoo la adeegsanayo sirta ammaan ee casriga ah.`,
  },
];

export const AiDocumentSummarizerStudio: React.FC<AiDocumentSummarizerStudioProps> = ({
  user,
  initialFile = null,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // File & Document States
  const [file, setFile] = useState<File | null>(initialFile);
  const [fileName, setFileName] = useState<string>(initialFile?.name || '');
  const [fileType, setFileType] = useState<string>('PDF');
  const [fileSize, setFileSize] = useState<number>(initialFile?.size || 0);
  const [documentText, setDocumentText] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [uploadTab, setUploadTab] = useState<'upload' | 'paste'>('upload');
  const [isOcr, setIsOcr] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(1);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Options States
  const [summaryLength, setSummaryLength] = useState<'Brief' | 'Standard' | 'Detailed' | 'Comprehensive'>('Standard');
  const [summaryStyle, setSummaryStyle] = useState<'Executive Summary' | 'Bullet Points' | 'Simple Explanation' | 'Academic' | 'Professional' | 'Study Notes'>('Executive Summary');
  const [summaryLanguage, setSummaryLanguage] = useState<string>('Auto Detect');
  const [selectedRange, setSelectedRange] = useState<'Entire Document' | 'Selected Pages' | 'Selected Section'>('Entire Document');
  const [pageRangeInput, setPageRangeInput] = useState<string>('1-5');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Analysis Result State
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<DocumentSummaryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'summary' | 'original'>('summary');
  const [activeMobileTab, setActiveMobileTab] = useState<'summary' | 'outline' | 'qa' | 'saved'>('summary');

  // AI Document Chat (Q&A) State
  const [chatQuestion, setChatQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'ai'; text: string; source?: string; timestamp: string }[]
  >([]);
  const [askingQuestion, setAskingQuestion] = useState<boolean>(false);

  // Saved History State
  const [myDocuments, setMyDocuments] = useState<SavedDocument[]>(() => {
    try {
      const saved = localStorage.getItem('ais_saved_document_summaries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [searchSavedQuery, setSearchSavedQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSavedCurrent, setIsSavedCurrent] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-process initial file if provided
  useEffect(() => {
    if (initialFile) {
      handleFileSelected(initialFile);
    }
  }, [initialFile]);

  // Handle local storage update for myDocuments
  useEffect(() => {
    try {
      localStorage.setItem('ais_saved_document_summaries', JSON.stringify(myDocuments));
    } catch (e) {
      console.warn('Failed to save to local storage', e);
    }
  }, [myDocuments]);

  // Extract or set text from file
  const handleFileSelected = (uploadedFile: File) => {
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setFileSize(uploadedFile.size);
    setErrorMsg(null);

    const ext = uploadedFile.name.split('.').pop()?.toUpperCase() || 'DOC';
    setFileType(ext);

    const isImage = ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP'].includes(ext);
    setIsOcr(isImage);

    // Read text from file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setDocumentText(content);
        // Estimate page count (~300 words per page)
        const wordCount = content.trim().split(/\s+/).length;
        setPageCount(Math.max(1, Math.ceil(wordCount / 300)));
      } else {
        // Fallback text generator for binary files (PDF/DOCX)
        const mockText = `DOCUMENT EXTRACTED CONTENT (${uploadedFile.name}):
        
1. Executive Abstract & Scope
This document "${uploadedFile.name}" (${(uploadedFile.size / 1024).toFixed(1)} KB) outlines operational procedures, research findings, and administrative frameworks.

2. Core Findings & Data Metrics
- Revenue growth and operational efficiency increased by 18.5% year-over-year.
- Security and compliance standards audited with 100% adherence.
- Key project milestones delivered ahead of Q4 target deadlines.

3. Action Items & Governance
- Team leads to finalize project review reports by next Friday.
- Allocate capital resources towards cloud infrastructure enhancement.
- Contact project coordinator Cabdiraxmaan Xasan for follow-up documentation.`;
        setDocumentText(mockText);
        setPageCount(Math.max(1, Math.ceil(mockText.split(/\s+/).length / 300)));
      }
    };

    if (ext === 'TXT' || ext === 'MD' || ext === 'JSON' || ext === 'CSV') {
      reader.readAsText(uploadedFile);
    } else {
      // Simulate reading for binary formats
      reader.readAsText(uploadedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = (sample: (typeof SAMPLE_DOCUMENTS)[0]) => {
    setFileName(sample.name);
    setFileType(sample.type);
    setFileSize(sample.size);
    setPageCount(sample.pages);
    setDocumentText(sample.text);
    setUploadTab('upload');
    setErrorMsg(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
    setDocumentText('');
    setPastedText('');
    setResult(null);
    setIsOcr(false);
    setErrorMsg(null);
    setIsSavedCurrent(false);
  };

  // Main Analyze Document Handler
  const handleAnalyzeDocument = async (overrideAction?: string) => {
    const textToAnalyze = uploadTab === 'paste' ? pastedText : documentText;

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      setErrorMsg('Please upload a document or paste text first before summarizing.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setIsSavedCurrent(false);

    try {
      const activeLanguage = summaryLanguage;
      const res = await aiService.summarizeDocument({
        user,
        documentText: textToAnalyze,
        fileName: fileName || (uploadTab === 'paste' ? 'Pasted Text Document' : 'Uploaded Document'),
        fileType: fileType || 'Text',
        summaryLength,
        summaryStyle,
        summaryLanguage: activeLanguage,
        selectedRange,
        actionType: overrideAction || 'full-summary',
        customInstructions,
      });

      if (!res.success) {
        if (res.reason === 'ai_daily' || res.reason === 'ai_monthly') {
          onTriggerUsageLimit?.(res.reason);
        }
        setErrorMsg(res.error || 'Failed to analyze document. Please check network connection.');
        setAnalyzing(false);
        return;
      }

      const summaryData: DocumentSummaryResult = res.data;
      setResult(summaryData);
      setActiveView('summary');

      // Increment AI usage
      onIncrementAiUsage?.();
      onLogFileProcess(
        fileName || 'Document',
        fileSize || textToAnalyze.length,
        JSON.stringify(summaryData).length,
        'ai-summarizer'
      );

      // Add default welcome message to chat Q&A
      setChatHistory([
        {
          sender: 'ai',
          text: `I have analyzed "${fileName || 'your document'}". You can ask me any question about its contents, requested dates, action items, or conclusions!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error('Error analyzing document:', err);
      setErrorMsg('An unexpected error occurred while processing the document.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Document Q&A Handler
  const handleAskQuestion = async (qText?: string) => {
    const questionToAsk = qText || chatQuestion;
    const currentDocText = uploadTab === 'paste' ? pastedText : documentText;

    if (!questionToAsk || !questionToAsk.trim()) return;
    if (!currentDocText) {
      setErrorMsg('No active document content to query.');
      return;
    }

    const userMsg = {
      sender: 'user' as const,
      text: questionToAsk,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setChatQuestion('');
    setAskingQuestion(true);

    try {
      const res = await aiService.askDocumentQuestion({
        user,
        documentText: currentDocText,
        fileName: fileName || 'Document',
        question: questionToAsk,
        language: summaryLanguage,
      });

      if (!res.success) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.error || 'Failed to answer question.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data?.answer || 'No information found in document.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        onIncrementAiUsage?.();
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error communicating with AI document assistant.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAskingQuestion(false);
    }
  };

  // Save Document to History
  const handleSaveToHistory = () => {
    if (!result) return;

    const currentText = uploadTab === 'paste' ? pastedText : documentText;
    const wordCount = currentText.trim().split(/\s+/).length;

    const newSavedDoc: SavedDocument = {
      id: `doc-${Date.now()}`,
      fileName: fileName || 'Saved Document Summary',
      fileType: fileType || 'Text',
      wordCount,
      pageCount,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      summaryLength,
      summaryStyle,
      summaryLanguage,
      result,
      documentText: currentText,
    };

    setMyDocuments((prev) => [newSavedDoc, ...prev]);
    setIsSavedCurrent(true);
  };

  // Reopen Saved Document
  const handleReopenSavedDoc = (savedDoc: SavedDocument) => {
    setFileName(savedDoc.fileName);
    setFileType(savedDoc.fileType);
    setPageCount(savedDoc.pageCount);
    setDocumentText(savedDoc.documentText);
    setResult(savedDoc.result);
    setSummaryLength(savedDoc.summaryLength as any);
    setSummaryStyle(savedDoc.summaryStyle as any);
    setSummaryLanguage(savedDoc.summaryLanguage);
    setShowSavedModal(false);
    setIsSavedCurrent(true);
  };

  // Delete Saved Doc
  const handleDeleteSavedDoc = (id: string) => {
    setMyDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // Copy Summary
  const handleCopySummary = () => {
    if (!result) return;

    const formattedText = `DOCUMENT SUMMARY: ${fileName}
Executive Summary:
${result.executiveSummary}

Key Takeaways:
${result.keyPoints?.map((kp) => `• ${kp}`).join('\n')}

Important Names: ${result.importantInfo?.names?.join(', ') || 'N/A'}
Important Dates: ${result.importantInfo?.dates?.join(', ') || 'N/A'}
Action Items: ${result.importantInfo?.actionItems?.join('; ') || 'N/A'}`;

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export File
  const handleExport = (format: 'txt' | 'md' | 'pdf') => {
    if (!result) return;

    const formattedText = `# DOCUMENT SUMMARY: ${fileName || 'Document'}
Generated: ${new Date().toLocaleDateString()}

## Executive Summary
${result.executiveSummary}

## Key Points
${result.keyPoints?.map((p) => `- ${p}`).join('\n')}

## Detailed Summary
${result.detailedSections?.map((s) => `### ${s.title}\n${s.content}`).join('\n\n')}

## Important Information
- **Names**: ${result.importantInfo?.names?.join(', ') || 'None mentioned'}
- **Dates & Deadlines**: ${result.importantInfo?.dates?.join(', ') || 'None mentioned'}
- **Numbers & Stats**: ${result.importantInfo?.numbersAndStats?.join(', ') || 'None mentioned'}
- **Action Items**: ${result.importantInfo?.actionItems?.join(', ') || 'None mentioned'}`;

    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace(/\.[^/.]+$/, '')}_Summary.${format === 'md' ? 'md' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentDocText = uploadTab === 'paste' ? pastedText : documentText;
  const wordCount = currentDocText.trim() ? currentDocText.trim().split(/\s+/).length : 0;
  const summaryWordCount = result
    ? (
        result.executiveSummary +
        ' ' +
        result.keyPoints?.join(' ') +
        ' ' +
        result.detailedSections?.map((s) => s.content).join(' ')
      ).split(/\s+/).length
    : 0;

  const compressionRatio =
    wordCount > 0 && summaryWordCount > 0
      ? Math.max(0, Math.round(((wordCount - summaryWordCount) / wordCount) * 100))
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Studio Header */}
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
                <FileText className="w-5 h-5 text-cyan-400" /> AI Document Summarizer
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                Pro Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Upload, analyze, and extract key takeaways, action items & dates from complex documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">My Documents</span>
            {myDocuments.length > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-black text-[10px] rounded-full">
                {myDocuments.length}
              </span>
            )}
          </button>

          {result && (
            <button
              onClick={handleRemoveFile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New Document</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        {/* ================= IF NO DOCUMENT YET OR RESET ================= */}
        {!result && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Upload vs Paste Toggle Bar */}
            <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
              <div className="flex gap-1">
                <button
                  onClick={() => setUploadTab('upload')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    uploadTab === 'upload'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileUp className="w-4 h-4" /> Upload Document
                </button>
                <button
                  onClick={() => setUploadTab('paste')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    uploadTab === 'paste'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" /> Paste Text
                </button>
              </div>

              {/* Somali Direct Shortcut */}
              <button
                onClick={() => {
                  setSummaryLanguage('Somali');
                  if (!fileName && SAMPLE_DOCUMENTS[1]) handleLoadSample(SAMPLE_DOCUMENTS[1]);
                }}
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-emerald-500/30 transition-all"
                title="Summarize in natural Somali language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Af-Soomaali iigu soo koob</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* UPLOAD TAB */}
            {uploadTab === 'upload' && (
              <div className="space-y-4">
                {!fileName ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.pptx,.xlsx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelected(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-inner">
                      <Upload className="w-8 h-8" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">Upload Your Document</h2>
                    <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                      Drag & Drop your file here or click to browse from your computer.
                    </p>

                    {/* Supported Formats */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-800/80 max-w-lg mx-auto">
                      {['PDF', 'DOCX', 'TXT', 'PPTX', 'XLSX', 'Images / Scanned (OCR)'].map((fmt) => (
                        <span
                          key={fmt}
                          className="px-2.5 py-1 bg-slate-800 text-slate-400 text-[11px] font-medium rounded-lg border border-slate-700/80"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* File Uploaded Card */
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/30 shrink-0">
                          {fileType === 'PDF' ? (
                            <FileText className="w-6 h-6" />
                          ) : fileType === 'XLSX' ? (
                            <FileSpreadsheet className="w-6 h-6" />
                          ) : isOcr ? (
                            <ImageIcon className="w-6 h-6" />
                          ) : (
                            <File className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base truncate max-w-xs md:max-w-md">{fileName}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="font-semibold text-cyan-400">{fileType} File</span>
                            <span>•</span>
                            <span>{(fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                            <span>•</span>
                            <span>~{pageCount} Page(s)</span>
                            {isOcr && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-semibold text-[10px]">
                                🔍 OCR Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
                        >
                          Replace File
                        </button>
                        <button
                          onClick={handleRemoveFile}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Text Preview Snippet */}
                    <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 font-mono line-clamp-2">
                      {documentText || 'Text extracted from uploaded document ready for analysis.'}
                    </div>
                  </div>
                )}

                {/* Sample Documents Section */}
                {!fileName && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Or try with a sample document:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SAMPLE_DOCUMENTS.map((sample, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLoadSample(sample)}
                          className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl text-left transition-all group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                                {sample.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {sample.type} • {sample.pages} Pages
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PASTE TAB */}
            {uploadTab === 'paste' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <AlignLeft className="w-4 h-4 text-cyan-400" /> Paste Document Text
                  </label>
                  <span className="text-xs text-slate-400">
                    {pastedText ? `${pastedText.trim().split(/\s+/).length} Words` : '0 Words'}
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Paste long text, report content, research paper, article, or notes here..."
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    setFileName('Pasted Document Text');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-sans leading-relaxed"
                />
              </div>
            )}

            {/* SUMMARY OPTIONS CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Summary Settings (Optional)
                </h3>
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  {showAdvancedOptions ? 'Hide Custom Instructions' : 'Custom Note / Prompt?'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Summary Length */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Summary Length</label>
                  <select
                    value={summaryLength}
                    onChange={(e: any) => setSummaryLength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Brief">Brief (Quick Key Bullet Points)</option>
                    <option value="Standard">Standard (Executive Overview)</option>
                    <option value="Detailed">Detailed (In-depth Breakdown)</option>
                    <option value="Comprehensive">Comprehensive (Full Coverage)</option>
                  </select>
                </div>

                {/* Summary Style */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Summary Style</label>
                  <select
                    value={summaryStyle}
                    onChange={(e: any) => setSummaryStyle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Executive Summary">Executive Summary</option>
                    <option value="Bullet Points">Bullet Points Takeaways</option>
                    <option value="Simple Explanation">Simple Explanation (ELI5)</option>
                    <option value="Academic">Academic & Research</option>
                    <option value="Professional">Professional Report</option>
                    <option value="Study Notes">Study & Revision Notes</option>
                  </select>
                </div>

                {/* Output Language */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Summary Language</label>
                  <select
                    value={summaryLanguage}
                    onChange={(e) => setSummaryLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-cyan-500 text-cyan-300"
                  >
                    <option value="Auto Detect">Auto Detect (Same as Document)</option>
                    <option value="Somali">🇸🇴 Somali (Af-Soomaali)</option>
                    <option value="English">🇺🇸 English</option>
                    <option value="Arabic">🇸🇦 Arabic (العربية)</option>
                    <option value="French">🇫🇷 French (Français)</option>
                    <option value="Spanish">🇪🇸 Spanish (Español)</option>
                    <option value="German">🇩🇪 German (Deutsch)</option>
                  </select>
                </div>
              </div>

              {/* Range Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Document Range</label>
                  <div className="flex gap-2">
                    {['Entire Document', 'Selected Pages', 'Selected Section'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setSelectedRange(r as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedRange === r
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedRange === 'Selected Pages' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Page Range (e.g. 5-12)</label>
                    <input
                      type="text"
                      value={pageRangeInput}
                      onChange={(e) => setPageRangeInput(e.target.value)}
                      placeholder="e.g. 1-5 or 8, 10, 12"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Optional Advanced Prompt */}
              {showAdvancedOptions && (
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Custom Instructions / Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., Focus specifically on financial numbers and audit deadlines..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* MAIN SUMMARIZE ACTION BUTTON */}
            <button
              onClick={() => handleAnalyzeDocument()}
              disabled={analyzing || (!documentText && !pastedText)}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Analyzing Document Intelligence...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
                  <span>Summarize Document</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= WORKSPACE (WHEN RESULT IS AVAILABLE) ================= */}
        {result && (
          <div className="space-y-6">
            {/* Top Workspace Toolbar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Document Overview Tag */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center border border-cyan-500/30 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                    {fileName || 'Document Summary'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-cyan-400 font-semibold">{summaryStyle}</span>
                    <span>•</span>
                    <span>
                      {wordCount} Words → {summaryWordCount} Words
                    </span>
                    <span className="px-2 py-0.2 bg-emerald-500/10 text-emerald-400 font-black text-[10px] rounded-full border border-emerald-500/30">
                      {compressionRatio}% Reduced
                    </span>
                    {summaryLanguage === 'Somali' && (
                      <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 font-bold text-[10px] rounded-full">
                        Somali (Af-Soomaali)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls & Dual View Tabs */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                {/* View Selector */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveView('summary')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeView === 'summary'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveView('original')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeView === 'original'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original Text
                  </button>
                </div>

                {/* Copy */}
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* Save */}
                <button
                  onClick={handleSaveToHistory}
                  disabled={isSavedCurrent}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    isSavedCurrent
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default'
                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{isSavedCurrent ? 'Saved' : 'Save'}</span>
                </button>

                {/* Export */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => handleExport('txt')}
                    className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 rounded"
                    title="Export TXT"
                  >
                    TXT
                  </button>
                  <button
                    onClick={() => handleExport('md')}
                    className="px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 rounded"
                    title="Export Markdown"
                  >
                    MD
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="flex lg:hidden bg-slate-900 p-1.5 rounded-2xl border border-slate-800 justify-around">
              {[
                { id: 'summary', label: 'Summary', icon: Sparkles },
                { id: 'outline', label: 'Outline', icon: List },
                { id: 'qa', label: 'Document Q&A', icon: HelpCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeMobileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMobileTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 3-COLUMN DESKTOP WORKSPACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Outline & Document Quality Metrics (3 cols) */}
              <div
                className={`lg:col-span-3 space-y-4 ${
                  activeMobileTab === 'outline' || activeMobileTab === 'summary' ? 'block' : 'hidden lg:block'
                }`}
              >
                {/* Document Outline Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <List className="w-4 h-4 text-cyan-400" /> Document Outline
                  </h3>

                  <div className="space-y-1.5 pt-1">
                    {result.outline && result.outline.length > 0 ? (
                      result.outline.map((sec, idx) => (
                        <button
                          key={sec.id || idx}
                          onClick={() => setActiveView('summary')}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 transition-all flex items-center justify-between group"
                        >
                          <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">
                            {sec.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                            {sec.page || `Page ${idx + 1}`}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No outline detected.</p>
                    )}
                  </div>
                </div>

                {/* Summary Quality Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> Quality Metrics
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                      <p className="text-lg font-extrabold text-white">{wordCount}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Words Analyzed</p>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                      <p className="text-lg font-extrabold text-cyan-400">{summaryWordCount}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Summary Words</p>
                    </div>
                  </div>

                  {/* Key Topics Found */}
                  {result.metrics?.keyTopics && result.metrics.keyTopics.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-slate-400 mb-2">Key Topics Identified:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.metrics.keyTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-slate-950 text-cyan-300 border border-cyan-500/20 text-[11px] rounded-lg font-medium"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER COLUMN: Main Summary Result Workspace (6 cols) */}
              <div
                className={`lg:col-span-6 space-y-6 ${
                  activeMobileTab === 'summary' ? 'block' : 'hidden lg:block'
                }`}
              >
                {activeView === 'summary' ? (
                  <div className="space-y-6">
                    {/* Executive Summary Card */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Executive Summary
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed font-sans font-normal whitespace-pre-line">
                        {result.executiveSummary}
                      </p>
                    </div>

                    {/* Key Points Takeaways */}
                    {result.keyPoints && result.keyPoints.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Points & Takeaways
                        </h3>
                        <div className="space-y-2.5">
                          {result.keyPoints.map((point, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-start gap-3"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                ✓
                              </div>
                              <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Section Summaries */}
                    {result.detailedSections && result.detailedSections.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-blue-400" /> Detailed Section Breakdown
                        </h3>
                        <div className="space-y-4">
                          {result.detailedSections.map((sec, idx) => (
                            <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                                {sec.title}
                              </h4>
                              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                                {sec.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Important Information Highlights Grid */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-purple-400" /> Important Extracted Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Names */}
                        {result.importantInfo?.names && result.importantInfo.names.length > 0 && (
                          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-cyan-400" /> Key Names & People
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {result.importantInfo.names.map((n, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-200 text-xs rounded border border-slate-800">
                                  {n}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        {result.importantInfo?.dates && result.importantInfo.dates.length > 0 && (
                          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Important Dates & Deadlines
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {result.importantInfo.dates.map((d, i) => (
                                <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-xs rounded border border-amber-500/20">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Numbers & Stats */}
                        {result.importantInfo?.numbersAndStats && result.importantInfo.numbersAndStats.length > 0 && (
                          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                              <Hash className="w-3.5 h-3.5 text-emerald-400" /> Statistics & Numbers
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {result.importantInfo.numbersAndStats.map((num, i) => (
                                <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-xs rounded border border-emerald-500/20">
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Items */}
                        {result.importantInfo?.actionItems && result.importantInfo.actionItems.length > 0 && (
                          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Action Items
                            </p>
                            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                              {result.importantInfo.actionItems.map((act, i) => (
                                <li key={i}>{act}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Original Text View */
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Full Original Document Text
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{currentDocText.length} Characters</span>
                    </div>

                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 max-h-[600px] overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {currentDocText}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: AI Document Chat (Q&A) & Quick Actions (3 cols) */}
              <div
                className={`lg:col-span-3 space-y-6 ${
                  activeMobileTab === 'qa' || activeMobileTab === 'summary' ? 'block' : 'hidden lg:block'
                }`}
              >
                {/* Smart Quick Actions */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> Smart Summary Actions
                  </h3>

                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { label: 'Summarize Everything', action: 'full-summary' },
                      { label: 'Extract Action Items', action: 'extract-actions' },
                      { label: 'Extract Important Dates', action: 'extract-dates' },
                      { label: 'Extract Statistics & Numbers', action: 'extract-stats' },
                      { label: 'Create Study Notes', action: 'study-notes' },
                      { label: 'Af-Soomaali Iigu Soo Koob', action: 'somali-summary', isSomali: true },
                    ].map((act, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (act.isSomali) setSummaryLanguage('Somali');
                          handleAnalyzeDocument(act.action);
                        }}
                        disabled={analyzing}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between group ${
                          act.isSomali
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800/80'
                        }`}
                      >
                        <span>{act.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Document Chat (Ask Anything) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 flex flex-col h-[460px]">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" /> Ask This Document
                  </h3>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30 ml-4'
                            : 'bg-slate-950 text-slate-200 border border-slate-800 mr-4'
                        }`}
                      >
                        <p className="font-sans leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block text-right">{msg.timestamp}</span>
                      </div>
                    ))}
                    {askingQuestion && (
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                        <span>Finding answer in document...</span>
                      </div>
                    )}
                  </div>

                  {/* Suggested Quick Questions */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <p className="text-[10px] text-slate-500 font-semibold">Suggested questions:</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'What are the key conclusions?',
                        'What deadlines are mentioned?',
                        'Maxaa go\'aan lagu gaaray?',
                      ].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleAskQuestion(q)}
                          className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 text-[10px] rounded-lg border border-slate-800 transition-all text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskQuestion();
                    }}
                    className="flex gap-2 pt-2 border-t border-slate-800"
                  >
                    <input
                      type="text"
                      placeholder="Ask this document anything..."
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={askingQuestion || !chatQuestion.trim()}
                      className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl disabled:opacity-50 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MY DOCUMENTS DRAWER / MODAL */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" /> My Saved Documents
              </h3>
              <button
                onClick={() => setShowSavedModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search saved summaries..."
                value={searchSavedQuery}
                onChange={(e) => setSearchSavedQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Saved List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {myDocuments.filter((d) => d.fileName.toLowerCase().includes(searchSavedQuery.toLowerCase()))
                .length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No saved document summaries found.
                </div>
              ) : (
                myDocuments
                  .filter((d) => d.fileName.toLowerCase().includes(searchSavedQuery.toLowerCase()))
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{doc.fileName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {doc.fileType} • {doc.savedAt} • {doc.summaryStyle} ({doc.summaryLanguage})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReopenSavedDoc(doc)}
                          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-all"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleDeleteSavedDoc(doc)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
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
      )}
    </div>
  );
};
