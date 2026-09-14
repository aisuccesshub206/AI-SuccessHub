import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Layout,
  Sliders,
  Edit3,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Palette,
  Type,
  Share2,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { CoverLetterData, CoverLetterTemplateId } from '../../types/coverLetter';
import { COVER_LETTER_TEMPLATES, getSampleCoverLetterData } from '../../data/coverLetterSampleData';
import { CoverLetterThumbnail } from '../CoverLetter/CoverLetterThumbnail';
import { CoverLetterPreview } from '../CoverLetter/CoverLetterPreview';
import { CoverLetterForm } from '../CoverLetter/CoverLetterForm';
import { CoverLetterCustomizePanel } from '../CoverLetter/CoverLetterCustomizePanel';
import { downloadCoverLetterDocx, printCoverLetter, copyCoverLetterText } from '../../utils/coverLetterExporter';

interface AiCoverLetterStudioProps {
  user?: UserProfile;
  onBack: () => void;
  onLogFileProcess?: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

const LOCAL_STORAGE_KEY = 'ais_cover_letter_data_v1';

export const AiCoverLetterStudio: React.FC<AiCoverLetterStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Load initial data from localStorage or fallback to sample
  const [coverData, setCoverData] = useState<CoverLetterData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved cover letter:', e);
    }
    return getSampleCoverLetterData('softwareEngineer');
  });

  // Main UI Mode / Tab: 'edit' | 'templates' | 'customize' | 'preview'
  const [activeTab, setActiveTab] = useState<'edit' | 'templates' | 'customize' | 'preview'>('edit');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedText, setCopiedText] = useState(false);
  const [lastSaved, setLastSaved] = useState('Saved in browser');

  // Auto save to LocalStorage whenever coverData changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(coverData));
      setLastSaved(`Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch (e) {
      setLastSaved('Saved in session');
    }
  }, [coverData]);

  const handleSelectTemplate = (templateId: CoverLetterTemplateId) => {
    const templateMeta = COVER_LETTER_TEMPLATES.find((t) => t.id === templateId);
    setCoverData((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        templateId,
        primaryColor: templateMeta?.primaryColor || prev.customization.primaryColor,
        font: templateMeta?.font || prev.customization.font,
      },
    }));
  };

  const handleDownloadDocx = async () => {
    try {
      await downloadCoverLetterDocx(coverData);
      if (onLogFileProcess) {
        onLogFileProcess(
          `${coverData.personalInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter.docx`,
          1024 * 180,
          1024 * 180,
          'AI Cover Letter Builder'
        );
      }
    } catch (err) {
      console.error('DOCX download failed:', err);
    }
  };

  const handleDownloadPdf = () => {
    printCoverLetter();
    if (onLogFileProcess) {
      onLogFileProcess(
        `${coverData.personalInfo.fullName.replace(/\s+/g, '_')}_Cover_Letter.pdf`,
        1024 * 250,
        1024 * 250,
        'AI Cover Letter Builder'
      );
    }
  };

  const handleCopyText = async () => {
    await copyCoverLetterText(coverData);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* ================= TOP ACTION BAR ================= */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                  AI Cover Letter Builder
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    Visual Studio
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">{lastSaved}</p>
              </div>
            </div>
          </div>

          {/* Desktop Tab Switcher */}
          <div className="hidden lg:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'edit'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'templates'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              Change Template
            </button>

            <button
              onClick={() => setActiveTab('customize')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'customize'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Customize
            </button>
          </div>

          {/* Document Actions (PDF, DOCX, Print, Copy) */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 border border-slate-700"
              title="Copy plain text"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={printCoverLetter}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 border border-slate-700"
              title="Print document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadDocx}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border border-blue-900/50"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download DOCX</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden items-center justify-around mt-3 pt-2 border-t border-slate-800 bg-slate-900">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-1.5 text-center text-xs font-bold border-b-2 transition-all ${
              activeTab === 'edit'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 text-center text-xs font-bold border-b-2 transition-all ${
              activeTab === 'templates'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`flex-1 py-1.5 text-center text-xs font-bold border-b-2 transition-all ${
              activeTab === 'customize'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            Customize
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1.5 text-center text-xs font-bold border-b-2 transition-all ${
              activeTab === 'preview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            Preview
          </button>
        </div>
      </header>

      {/* ================= MAIN SPLIT WORKSPACE ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Form / Templates / Customize */}
        <div
          className={`lg:col-span-5 space-y-6 ${
            activeTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* 1. EDIT MODE */}
          {activeTab === 'edit' && (
            <CoverLetterForm
              data={coverData}
              user={user}
              onChange={setCoverData}
              onIncrementAiUsage={onIncrementAiUsage}
              onTriggerUsageLimit={onTriggerUsageLimit}
            />
          )}

          {/* 2. TEMPLATE GALLERY */}
          {activeTab === 'templates' && (
            <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-400" />
                    Cover Letter Template Gallery
                  </h2>
                  <p className="text-xs text-slate-400">Choose a visual template layout for your cover letter</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
                {COVER_LETTER_TEMPLATES.map((tmpl) => (
                  <CoverLetterThumbnail
                    key={tmpl.id}
                    templateId={tmpl.id}
                    templateName={tmpl.name}
                    primaryColor={tmpl.primaryColor}
                    font={tmpl.font}
                    isSelected={coverData.customization.templateId === tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. CUSTOMIZE PANEL */}
          {activeTab === 'customize' && (
            <CoverLetterCustomizePanel data={coverData} onChange={setCoverData} />
          )}
        </div>

        {/* RIGHT PANEL: LIVE VISUAL DOCUMENT PREVIEW */}
        <div
          className={`lg:col-span-7 bg-slate-950/60 rounded-2xl border border-slate-800 p-4 md:p-6 sticky top-20 shadow-inner flex flex-col items-center ${
            activeTab !== 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Document Preview Controls Header */}
          <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-slate-200">Live Document Preview</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full capitalize">
                {coverData.customization.templateId} Template
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1 hover:text-white transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-8 text-center text-slate-300">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1 hover:text-white transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rendered Visual Document */}
          <CoverLetterPreview data={coverData} zoomLevel={zoomLevel} />
        </div>
      </main>
    </div>
  );
};
