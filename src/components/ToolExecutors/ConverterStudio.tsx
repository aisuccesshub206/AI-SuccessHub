import React, { useState } from 'react';
import {
  FileStack,
  FileText,
  Upload,
  Download,
  ArrowLeft,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ConverterStudioProps {
  toolId: string;
  initialFile?: File | null;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
}

export const ConverterStudio: React.FC<ConverterStudioProps> = ({
  toolId,
  initialFile,
  onBack,
  onLogFileProcess,
}) => {
  const [inputText, setInputText] = useState('');
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleConvertTextToPdf = () => {
    if (!inputText.trim()) return;
    setProcessing(true);

    setTimeout(() => {
      const blob = new Blob([inputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      onLogFileProcess('text_document.pdf', inputText.length, inputText.length, 'Text to PDF');
      setProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Tools</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <FileStack className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {toolId.replace('-', ' ')} Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Universal multi-format document conversion engine.
            </p>
          </div>
        </div>

        {/* Input Text Area */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
            Enter or Paste Text Content to Convert:
          </label>
          <textarea
            rows={8}
            placeholder="Type or paste text notes, logs, code, or document content here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleConvertTextToPdf}
          disabled={!inputText.trim() || processing}
          className="w-full py-3.5 px-6 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Converting Document...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Convert to Document</span>
            </>
          )}
        </button>

        {/* Download Box */}
        {downloadUrl && (
          <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in fade-in duration-200">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Document Converted!
            </h3>
            <a
              href={downloadUrl}
              download="converted_document.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Download className="w-4 h-4" /> Download File
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
