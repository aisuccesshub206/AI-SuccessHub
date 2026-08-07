import React, { useState } from 'react';
import { KnowledgeFile } from '../../types';
import { INITIAL_KNOWLEDGE_FILES } from '../../data/v2Data';
import {
  FileText,
  Upload,
  Cloud,
  Search,
  Bot,
  Sparkles,
  Send,
  Eye,
  Trash2,
  CheckCircle2,
  Database,
  ArrowUpRight,
  Download,
  BookOpen,
} from 'lucide-react';

interface KnowledgeBasePageProps {
  files?: KnowledgeFile[];
  onUploadFile?: (file: KnowledgeFile) => void;
  onDeleteFile?: (id: string) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({
  files = INITIAL_KNOWLEDGE_FILES,
  onUploadFile,
  onDeleteFile,
}) => {
  const safeFiles = files && files.length > 0 ? files : INITIAL_KNOWLEDGE_FILES;
  const [selectedFileId, setSelectedFileId] = useState<string>(safeFiles[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string; page?: number }[]>([
    {
      sender: 'ai',
      text: 'Hello Sarah! I am your AI Knowledge Assistant. Ask me anything about your uploaded financial reports, tech docs, or brand guides.',
    },
  ]);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  const selectedFile = safeFiles.find((f) => f.id === selectedFileId) || safeFiles[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const newKF: KnowledgeFile = {
      id: `kf-${Date.now()}`,
      name: uploaded.name,
      sizeMB: Number((uploaded.size / (1024 * 1024)).toFixed(2)),
      type: uploaded.name.endsWith('.pdf') ? 'pdf' : uploaded.name.endsWith('.docx') ? 'docx' : 'image',
      source: 'Local Upload',
      uploadedAt: 'Just now',
      pagesCount: Math.floor(Math.random() * 15) + 3,
      status: 'indexed',
      summary: `Automated indexing complete for ${uploaded.name}. Semantic vectors generated for instant query extraction.`,
      keyInsights: [
        'Document analyzed using Gemini Vision OCR.',
        'Extracted entities and key business metrics.',
        'Indexed into high-speed vector embeddings cache.',
      ],
      extractedTextPreview: `Preview text from ${uploaded.name}... Data highlights extracted and validated.`,
    };

    onUploadFile(newKF);
    setSelectedFileId(newKF.id);
  };

  const handleSimulateCloudConnect = (provider: string) => {
    const cloudKF: KnowledgeFile = {
      id: `kf-${Date.now()}`,
      name: `${provider}_Connected_Document.pdf`,
      sizeMB: 3.4,
      type: 'pdf',
      source: provider as any,
      uploadedAt: 'Just now',
      pagesCount: 16,
      status: 'indexed',
      summary: `Synchronized from ${provider}. Extracted key executive clauses and table metrics.`,
      keyInsights: [`Synced directly from ${provider} Cloud Storage.`, 'Ready for AI Chat and semantic discovery.'],
      extractedTextPreview: `Document synced from ${provider}...`,
    };

    onUploadFile(cloudKF);
    setSelectedFileId(cloudKF.id);
    setCloudModalOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiAnswering) return;

    const userMsg = chatInput;
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiAnswering(true);

    setTimeout(() => {
      let aiResponse = `Based on your file "${selectedFile?.name || 'uploaded documents'}":\n\n`;
      if (userMsg.toLowerCase().includes('summary') || userMsg.toLowerCase().includes('overview')) {
        aiResponse += selectedFile?.summary || 'The document highlights significant business growth, lower CAC, and high customer retention.';
      } else if (userMsg.toLowerCase().includes('margin') || userMsg.toLowerCase().includes('financial') || userMsg.toLowerCase().includes('revenue')) {
        aiResponse += 'Revenues reached $10.45 million (+34% YoY) with an expanded gross profit margin of 78%. Enterprise accounts grew by 45 accounts.';
      } else {
        aiResponse += `Here is the relevant excerpt found on Page 3 of ${selectedFile?.name}: "${selectedFile?.extractedTextPreview || 'Financial performance exceeded projections across all operating divisions.'}"`;
      }

      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiResponse, page: 3 }]);
      setIsAiAnswering(false);
    }, 900);
  };

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            AI Knowledge Base V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Chat, Search & Extract From Your Personal Files
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Upload PDFs, documents, or connect cloud storage (Google Drive, Dropbox) for instant semantic AI query synthesis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCloudModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Connect Cloud Drive</span>
          </button>

          <label className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
            <input type="file" accept=".pdf,.docx,.png,.jpg" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Documents List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search inside files & summaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Indexed Documents ({filteredFiles.length})
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredFiles.map((f) => {
                const isSelected = selectedFile?.id === f.id;

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFileId(f.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs truncate max-w-[180px]">{f.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{f.sizeMB} MB</span>
                            <span>•</span>
                            <span className="text-indigo-400">{f.source}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFile(f.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pane: AI Interactive Chat & File Insights Inspector */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* File Insight Card */}
          {selectedFile && (
            <div className="p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedFile.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Indexed AI Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uploaded {selectedFile.uploadedAt} • {selectedFile.pagesCount || 10} Pages Analyzed
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-indigo-300 font-mono">
                    {selectedFile.source}
                  </span>
                </div>
              </div>

              {/* Summary & Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Executive Summary
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedFile.summary}</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Key Extracted Facts
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {selectedFile.keyInsights.map((insight, idx) => (
                      <li key={idx} className="truncate">{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* AI File Chat Console */}
          <div className="p-6 bg-[#07070e]/90 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-white">AI Document Chat Copilot</span>
              </div>
              <span className="text-[11px] text-slate-400">Grounding active on selected file</span>
            </div>

            {/* Chat Thread */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'bg-white/5 border border-white/10 text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.page && (
                      <div className="mt-2 text-[10px] text-indigo-300 font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Source: Page {msg.page} of {selectedFile?.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiAnswering && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI reading semantic embeddings...</span>
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder={`Ask anything about ${selectedFile?.name || 'this document'}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isAiAnswering}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Cloud Integration Modal */}
      {cloudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                Connect Cloud Storage
              </h3>
              <button onClick={() => setCloudModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Select a cloud drive to enable automatic file indexing and real-time document synchronization:
            </p>

            <div className="space-y-2.5">
              {['Google Drive', 'Dropbox', 'OneDrive'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => handleSimulateCloudConnect(provider)}
                  className="w-full flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-indigo-400" /> Sync with {provider}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
