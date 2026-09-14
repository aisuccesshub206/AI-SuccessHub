import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Upload,
  RefreshCw,
  Search,
  FileText,
  ShieldAlert,
  Loader2,
  Trash2,
  Download,
  CheckCircle2,
  X,
  Edit3,
  Layers,
  Wand2,
  HelpCircle,
  MessageSquare,
  BookOpen,
  ChevronRight,
  Plus,
  Users,
  Target,
  Globe,
  Sliders,
  FileCode,
  Zap,
  CornerUpLeft,
  Sparkle,
  Pin,
  Bookmark,
  Share2,
  Maximize2,
  Minus,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface AiEmailStudioProps {
  user?: UserProfile;
  initialText?: string;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export interface SavedEmailDraft {
  id: string;
  subject: string;
  emailType: string;
  fullEmailText: string;
  date: string;
  status: 'Draft' | 'Sent' | 'Final';
}

const EMAIL_CATEGORIES: Record<string, string[]> = {
  Professional: [
    'Business Email',
    'Follow-Up Email',
    'Meeting Request',
    'Meeting Confirmation',
    'Meeting Reschedule',
    'Introduction Email',
    'Networking Email',
    'Thank You Email',
    'Apology Email',
    'Reminder Email',
    'Announcement',
    'Internal Team Email',
  ],
  'Sales & Marketing': [
    'Sales Email',
    'Cold Email',
    'Follow-Up Sales Email',
    'Product Promotion',
    'Product Launch',
    'Customer Outreach',
    'Lead Generation',
    'Partnership Proposal',
  ],
  Career: [
    'Job Application',
    'Cover Letter Email',
    'Recruiter Outreach',
    'Interview Request',
    'Interview Follow-Up',
    'Thank You After Interview',
    'Job Offer Response',
    'Resignation Email',
  ],
  'Customer & Support': [
    'Customer Support',
    'Complaint',
    'Refund Request',
    'Service Request',
    'Feedback Request',
    'Customer Follow-Up',
  ],
  Personal: ['Invitation', 'Thank You', 'Congratulations', 'Apology', 'General Personal Email'],
  Other: ['Custom Email'],
};

const RELATIONSHIPS = ['Client', 'Manager', 'Coworker', 'Customer', 'Recruiter', 'Professor', 'Friend', 'Company', 'Other'];

const PURPOSES = [
  'Inform',
  'Request',
  'Ask a Question',
  'Follow Up',
  'Apologize',
  'Thank',
  'Persuade',
  'Sell',
  'Invite',
  'Confirm',
  'Cancel',
  'Reschedule',
  'Apply',
  'Complain',
  'Respond',
];

const TONES = [
  'Professional',
  'Formal',
  'Friendly',
  'Warm',
  'Confident',
  'Persuasive',
  'Polite',
  'Casual',
  'Direct',
  'Apologetic',
];

const LENGTHS = ['Very Short', 'Short', 'Standard', 'Detailed'];

const LANGUAGES = ['English', 'Somali', 'Arabic', 'French', 'Spanish', 'German', 'Auto Detect'];

const REPLY_INTENTS = [
  'Agree',
  'Decline',
  'Ask for More Information',
  'Follow Up',
  'Thank Them',
  'Apologize',
  'Negotiate',
  'Custom Reply',
];

const EMAIL_TEMPLATES = [
  {
    name: 'Client Meeting Request',
    category: 'Meeting',
    type: 'Meeting Request',
    scenario: 'Request a 30-minute alignment call with a key client to review project deliverables next week.',
    relationship: 'Client',
    purpose: 'Request',
    tone: 'Professional',
  },
  {
    name: 'High-Converting Cold Outreach',
    category: 'Sales',
    type: 'Cold Email',
    scenario: 'Introduce our modern AI workspace solution to a marketing director and propose a quick 10-minute demo.',
    relationship: 'Client',
    purpose: 'Sell',
    tone: 'Persuasive',
  },
  {
    name: 'Post-Interview Thank You',
    category: 'Career',
    type: 'Thank You After Interview',
    scenario: 'Thank the hiring manager for their time during today interview and reiterate strong interest in the Senior Developer role.',
    relationship: 'Recruiter',
    purpose: 'Thank',
    tone: 'Confident',
  },
  {
    name: 'Polite Project Follow-Up',
    category: 'Follow-Up',
    type: 'Follow-Up Email',
    scenario: 'Politely follow up on an unanswered project proposal sent 5 days ago.',
    relationship: 'Client',
    purpose: 'Follow Up',
    tone: 'Polite',
  },
  {
    name: 'Somali Meeting Request',
    category: 'Business',
    type: 'Business Email',
    scenario: 'Macmiilkeyga waxaan rabaa inaan u diro email aan ku weydiisanayo meeting dhanka online-ka ah todobaadka soo socda.',
    relationship: 'Client',
    purpose: 'Request',
    tone: 'Professional',
  },
];

export const AiEmailStudio: React.FC<AiEmailStudioProps> = ({
  user,
  initialText = '',
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Main Mode State
  const [activeTab, setActiveTab] = useState<'create' | 'improve' | 'reply' | 'templates' | 'drafts'>('create');

  // Create Mode Inputs
  const [scenario, setScenario] = useState<string>(initialText || '');
  const [emailType, setEmailType] = useState<string>('Business Email');
  const [recipientName, setRecipientName] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Client');
  const [purpose, setPurpose] = useState<string>('Inform');
  const [tone, setTone] = useState<string>('Professional');
  const [length, setLength] = useState<string>('Standard');
  const [language, setLanguage] = useState<string>('English');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [searchCategory, setSearchCategory] = useState<string>('');

  // Improve / Rewrite Mode Inputs
  const [existingEmail, setExistingEmail] = useState<string>('');
  const [improveAction, setImproveAction] = useState<string>('Improve and Polish');

  // Reply Mode Inputs
  const [receivedEmailText, setReceivedEmailText] = useState<string>('');
  const [replyIntent, setReplyIntent] = useState<string>('Agree');

  // Output Generated Email State
  const [primarySubject, setPrimarySubject] = useState<string>('');
  const [alternativeSubjects, setAlternativeSubjects] = useState<string[]>([]);
  const [greeting, setGreeting] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [closing, setClosing] = useState<string>('');
  const [fullEmailText, setFullEmailText] = useState<string>('');
  const [qualityCheck, setQualityCheck] = useState<any>(null);

  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);
  const [copiedBody, setCopiedBody] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Saved Drafts State
  const [savedDrafts, setSavedDrafts] = useState<SavedEmailDraft[]>(() => {
    try {
      const saved = localStorage.getItem('ais_saved_emails');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync saved drafts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ais_saved_emails', JSON.stringify(savedDrafts));
    } catch (e) {
      console.warn('Failed to save drafts', e);
    }
  }, [savedDrafts]);

  // Main Submit Handler
  const handleGenerate = async (overrideAction?: string) => {
    if (activeTab === 'create' && !scenario.trim() && !additionalContext.trim()) {
      setErrorMsg('Please describe what your email is about.');
      return;
    }
    if (activeTab === 'improve' && !existingEmail.trim()) {
      setErrorMsg('Please paste the existing email you want to rewrite or improve.');
      return;
    }
    if (activeTab === 'reply' && !receivedEmailText.trim()) {
      setErrorMsg('Please paste the received email you want to reply to.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const effectiveMode = activeTab === 'improve' ? 'improve' : activeTab === 'reply' ? 'reply' : 'create';

    try {
      const res = await aiService.generateEmail({
        user,
        mode: effectiveMode,
        scenario,
        emailType,
        recipientName,
        relationship,
        purpose,
        tone,
        length,
        language,
        additionalContext,
        existingEmail: activeTab === 'reply' ? receivedEmailText : existingEmail,
        action: overrideAction || improveAction,
        replyIntent,
      });

      if (!res.success) {
        if (res.reason === 'ai_daily' || res.reason === 'ai_monthly') {
          onTriggerUsageLimit?.(res.reason);
        }
        setErrorMsg(res.error || 'Failed to generate email.');
        setLoading(false);
        return;
      }

      const data = res.data;
      if (data) {
        setPrimarySubject(data.primarySubject || 'Professional Communication');
        setAlternativeSubjects(data.alternativeSubjects || []);
        setGreeting(data.greeting || '');
        setEmailBody(data.body || '');
        setClosing(data.closing || '');
        setFullEmailText(data.fullEmailText || `${data.greeting}\n\n${data.body}\n\n${data.closing}`);
        if (data.qualityCheck) {
          setQualityCheck(data.qualityCheck);
        }
      }

      onIncrementAiUsage?.();
      onLogFileProcess(uploadedFileName || 'email_writer', scenario.length || 100, (data?.fullEmailText || '').length, 'ai-email');
    } catch (err: any) {
      console.error('Error generating email:', err);
      setErrorMsg('An error occurred while connecting to the AI Email Writing Workspace.');
    } finally {
      setLoading(false);
    }
  };

  // Upload Document Context
  const handleFileUpload = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setAdditionalContext((prev) => `${prev}\n\n[Uploaded Document: ${file.name}]\n${text.slice(0, 1500)}`);
      }
    };
    reader.readAsText(file);
  };

  // Copy Helpers
  const handleCopyText = (text: string, type: 'all' | 'subject' | 'body') => {
    navigator.clipboard.writeText(text);
    if (type === 'all') {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } else if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else if (type === 'body') {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    if (!fullEmailText) return;
    const draft: SavedEmailDraft = {
      id: `draft-${Date.now()}`,
      subject: primarySubject || 'Untitled Email Draft',
      emailType,
      fullEmailText,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Draft',
    };
    setSavedDrafts((prev) => [draft, ...prev]);
    alert('Email draft saved to "My Emails"!');
  };

  // Download File Formats
  const handleDownloadEmail = (format: 'txt' | 'doc' | 'pdf') => {
    const filename = `${(primarySubject || 'Email').replace(/[^a-zA-Z0-9]/g, '_')}.${format === 'doc' ? 'doc' : format}`;
    const content = `SUBJECT: ${primarySubject}\n\n${fullEmailText}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
                <Mail className="w-5 h-5 text-cyan-400" /> Professional AI Email Workspace
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                Executive Suite
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Craft high-converting, polite, and persuasive business emails, replies, and subject lines in 50+ languages.
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'create', label: 'Create Email', icon: Send },
            { id: 'improve', label: 'Improve / Rewrite', icon: Wand2 },
            { id: 'reply', label: 'Write Reply', icon: CornerUpLeft },
            { id: 'templates', label: 'Templates', icon: BookOpen },
            { id: 'drafts', label: 'My Emails', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
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

        {/* ================= MODE 1: CREATE NEW EMAIL ================= */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT INPUT CONTROLS (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                {/* 1. Situation / What is this email about */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>1. What is this email about?</span>
                    <span className="text-[10px] text-cyan-400 font-normal">Supports Somali & English</span>
                  </label>
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    rows={4}
                    placeholder="Example: I want to ask a client for a meeting next week to discuss our project proposal. Or in Somali: Macmiilkeyga waxaan rabaa inaan u diro email aan ku weydiisanayo meeting."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 rounded-2xl p-3 focus:outline-none transition-all"
                  />
                </div>

                {/* 2. Email Type Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      2. Email Type
                    </label>
                    <div className="relative w-36">
                      <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                      <input
                        type="text"
                        placeholder="Search type..."
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-[10px] text-slate-200 pl-6 pr-2 py-1 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-300 rounded-2xl p-3 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {Object.entries(EMAIL_CATEGORIES).map(([cat, types]) => {
                      const filtered = types.filter((t) => t.toLowerCase().includes(searchCategory.toLowerCase()));
                      if (filtered.length === 0) return null;
                      return (
                        <optgroup key={cat} label={`── ${cat} ──`}>
                          {filtered.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                {/* 3. Recipient Info & Relationship */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">To (Recipient Name)</label>
                    <input
                      type="text"
                      placeholder="e.g. John Smith"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                    >
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Purpose & Tone */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Primary Purpose</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                    >
                      {PURPOSES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Visual Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-emerald-300 rounded-xl p-2.5 focus:outline-none focus:border-cyan-500"
                    >
                      {TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Length & Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Length</label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5 focus:outline-none"
                    >
                      {LENGTHS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">Output Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-bold rounded-xl p-2.5 focus:outline-none"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang === 'Somali' ? '🇸🇴 Somali (Af-Soomaali)' : lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Optional Additional Context & Doc Upload */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400">Additional Context / Details</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-cyan-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Upload Doc
                    </button>
                  </div>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    rows={2}
                    placeholder="Important dates, meeting links, special instructions..."
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 rounded-xl p-2.5 focus:outline-none"
                  />
                  {uploadedFileName && (
                    <p className="text-[10px] text-emerald-400 font-semibold">Attached: {uploadedFileName}</p>
                  )}
                </div>

                {/* Submit Action Button */}
                <button
                  onClick={() => handleGenerate()}
                  disabled={loading || !scenario.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 fill-current" />}
                  <span>{loading ? 'Generating Email...' : 'Generate Ready-to-Send Email'}</span>
                </button>
              </div>
            </div>

            {/* RIGHT EMAIL PREVIEW & AI TOOLS (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* REALISTIC EMAIL PREVIEW CARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                {/* Realistic Email Top Header */}
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2 font-mono text-xs text-slate-300">
                  <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
                    <span className="text-slate-500 font-bold w-16">SUBJECT:</span>
                    <span className="text-cyan-300 font-bold text-sm">{primarySubject || 'Subject line will appear here...'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold w-16">TO:</span>
                    <span className="text-slate-200">{recipientName || '[Recipient Name]'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold w-16">FROM:</span>
                    <span className="text-slate-400">{user?.name || 'You (Professional Workspace)'}</span>
                  </div>
                </div>

                {/* Email Body Preview / Editable Area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-400" /> Email Message Content
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText(fullEmailText, 'all')}
                        disabled={!fullEmailText}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1 font-semibold"
                      >
                        {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedAll ? 'Copied All' : 'Copy Email'}</span>
                      </button>

                      <button
                        onClick={handleSaveDraft}
                        disabled={!fullEmailText}
                        className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20 flex items-center gap-1"
                      >
                        <Bookmark className="w-3.5 h-3.5" /> Save Draft
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="p-12 bg-slate-950/80 rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      <p className="text-xs font-bold text-white">Drafting high-converting email...</p>
                    </div>
                  ) : (
                    <textarea
                      value={fullEmailText}
                      onChange={(e) => setFullEmailText(e.target.value)}
                      rows={14}
                      placeholder="Your generated email preview will appear here. You can directly edit any text before sending..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm leading-relaxed rounded-2xl p-4 focus:outline-none resize-y font-sans"
                    />
                  )}
                </div>

                {/* Export & Quick Actions Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyText(primarySubject, 'subject')}
                      disabled={!primarySubject}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700"
                    >
                      Copy Subject Only
                    </button>
                    <button
                      onClick={() => handleCopyText(fullEmailText, 'body')}
                      disabled={!fullEmailText}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700"
                    >
                      Copy Body Only
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownloadEmail('txt')}
                      disabled={!fullEmailText}
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700"
                    >
                      TXT
                    </button>
                    <button
                      onClick={() => handleDownloadEmail('doc')}
                      disabled={!fullEmailText}
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700"
                    >
                      DOCX
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBJECT LINE GENERATOR VARIATIONS */}
              {alternativeSubjects.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Alternative Subject Lines (5 High-Converting Options)
                  </h3>
                  <div className="space-y-2">
                    {alternativeSubjects.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-200 font-semibold">{sub}</span>
                        <button
                          onClick={() => {
                            setPrimarySubject(sub);
                            handleCopyText(sub, 'subject');
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold rounded-lg text-[11px] transition-all"
                        >
                          Use Subject
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI EMAIL QUICK ACTIONS / REFINEMENT CHIPS */}
              {fullEmailText && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-cyan-400" /> Quick Email Refinements
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: 'Make More Professional', act: 'Make More Professional' },
                      { label: 'Make Friendlier', act: 'Make Friendlier' },
                      { label: 'Make More Persuasive', act: 'Make More Persuasive' },
                      { label: 'Shorten Email', act: 'Shorten Email' },
                      { label: 'Expand Details', act: 'Expand Details' },
                      { label: 'Fix Grammar', act: 'Fix Grammar' },
                      { label: 'Translate to Somali', act: 'Translate to Somali' },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handleGenerate(btn.act)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all disabled:opacity-50"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUALITY CHECK PANEL */}
              {qualityCheck && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Email Quality Check
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Clarity</span>
                      <strong className="text-cyan-300">{qualityCheck.clarity}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Professionalism</span>
                      <strong className="text-emerald-300">{qualityCheck.professionalism}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Conciseness</span>
                      <strong className="text-amber-300">{qualityCheck.conciseness}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Call To Action</span>
                      <strong className="text-indigo-300">{qualityCheck.callToAction}</strong>
                    </div>
                  </div>
                  {qualityCheck.suggestions && qualityCheck.suggestions.length > 0 && (
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-200">
                      <p className="font-bold mb-1">💡 Professional Tips:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {qualityCheck.suggestions.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MODE 2: IMPROVE / REWRITE EXISTING EMAIL ================= */}
        {activeTab === 'improve' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cyan-400" /> Paste Existing Email
              </h3>
              <textarea
                value={existingEmail}
                onChange={(e) => setExistingEmail(e.target.value)}
                rows={12}
                placeholder="Paste the email draft you want to rewrite, shorten, or make more professional..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-2xl p-4 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Action</label>
                  <select
                    value={improveAction}
                    onChange={(e) => setImproveAction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-cyan-300 rounded-xl p-2.5"
                  >
                    {[
                      'Improve and Polish',
                      'Rewrite Completely',
                      'Shorten Significantly',
                      'Make Executive Professional',
                      'Make Friendly & Warm',
                      'Fix All Grammar & Typos',
                      'Remove Repetition',
                      'Make More Persuasive',
                    ].map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={loading || !existingEmail.trim()}
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                <span>Rewrite & Improve Email</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Polished Email Output
                </span>
                <button
                  onClick={() => handleCopyText(fullEmailText, 'all')}
                  disabled={!fullEmailText}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>

              <textarea
                value={fullEmailText}
                onChange={(e) => setFullEmailText(e.target.value)}
                rows={14}
                placeholder="Your improved email will appear here..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-2xl p-4 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= MODE 3: WRITE A REPLY ================= */}
        {activeTab === 'reply' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CornerUpLeft className="w-4 h-4 text-cyan-400" /> Received Email Content
              </h3>
              <textarea
                value={receivedEmailText}
                onChange={(e) => setReceivedEmailText(e.target.value)}
                rows={8}
                placeholder="Paste the email you received here..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-2xl p-4 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Reply Intent</label>
                  <select
                    value={replyIntent}
                    onChange={(e) => setReplyIntent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-emerald-300 rounded-xl p-2.5"
                  >
                    {REPLY_INTENTS.map((ri) => (
                      <option key={ri} value={ri}>
                        {ri}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl p-2.5"
                  >
                    {TONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={loading || !receivedEmailText.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 fill-current" />}
                <span>Generate Reply</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Generated Reply</span>
                <button
                  onClick={() => handleCopyText(fullEmailText, 'all')}
                  disabled={!fullEmailText}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Reply
                </button>
              </div>

              <textarea
                value={fullEmailText}
                onChange={(e) => setFullEmailText(e.target.value)}
                rows={14}
                placeholder="Your generated reply will appear here..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-2xl p-4 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= MODE 4: TEMPLATES LIBRARY ================= */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" /> High-Converting Email Templates Library
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EMAIL_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-500/20">
                      {tmpl.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">{tmpl.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3">{tmpl.scenario}</p>
                  </div>

                  <button
                    onClick={() => {
                      setScenario(tmpl.scenario);
                      setEmailType(tmpl.type);
                      setRelationship(tmpl.relationship);
                      setPurpose(tmpl.purpose);
                      setTone(tmpl.tone);
                      setActiveTab('create');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MODE 5: SAVED DRAFTS ================= */}
        {activeTab === 'drafts' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> My Saved Emails & Drafts
            </h3>

            {savedDrafts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No saved drafts yet. Click "Save Draft" on any generated email.</p>
            ) : (
              <div className="space-y-3">
                {savedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-300">{draft.subject}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                          {draft.emailType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{draft.fullEmailText}</p>
                      <span className="text-[10px] text-slate-600 block">{draft.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPrimarySubject(draft.subject);
                          setFullEmailText(draft.fullEmailText);
                          setActiveTab('create');
                        }}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-xl"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCopyText(draft.fullEmailText, 'all')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => setSavedDrafts((prev) => prev.filter((d) => d.id !== draft.id))}
                        className="p-1.5 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
