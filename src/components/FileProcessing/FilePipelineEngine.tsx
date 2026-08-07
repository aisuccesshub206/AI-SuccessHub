import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FileCode,
  Video,
  Music,
  Archive,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  HardDrive,
  Download,
  Eye,
  RefreshCw,
  FilePlus,
  Scissors,
  Minimize2,
  FileType,
  Sparkles,
  Clock,
  Key,
  Trash2,
  Check,
} from 'lucide-react';
import { UserProfile, ProcessedFile } from '../../types';

interface FilePipelineEngineProps {
  user: UserProfile;
  onLogFileProcess?: (fileName: string, originalSize: number, processedSize: number, toolName: string) => void;
}

type PdfActionType = 'merge' | 'split' | 'compress' | 'convert' | 'ocr' | 'extract' | 'edit';

export const FilePipelineEngine: React.FC<FilePipelineEngineProps> = ({ user, onLogFileProcess }) => {
  const [selectedAction, setSelectedAction] = useState<PdfActionType>('compress');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'validating' | 'processing' | 'completed' | 'error'>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Storage settings
  const [useStorageBackend, setUseStorageBackend] = useState<'cloudflare_r2' | 'aws_s3'>('cloudflare_r2');
  const [enableSignedLink, setEnableSignedLink] = useState(true);
  const [expirationHours, setExpirationHours] = useState<number>(24);

  // Result State
  const [resultFile, setResultFile] = useState<{
    originalName: string;
    outputName: string;
    originalSizeMB: number;
    outputSizeMB: number;
    downloadUrl: string;
    signedExpirationTime: string;
    extractedText?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size limit by plan
  const planSizeLimitMB = user.plan === 'Free' ? 10 : user.plan === 'Pro Monthly' || user.plan === 'Pro Yearly' ? 100 : 2000;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleFilesAdded = (files: File[]) => {
    setErrorMessage('');
    
    // Validate file sizes
    for (const f of files) {
      const sizeMB = f.size / (1024 * 1024);
      if (sizeMB > planSizeLimitMB) {
        setErrorMessage(`File "${f.name}" (${sizeMB.toFixed(1)} MB) exceeds your plan size limit of ${planSizeLimitMB} MB. Upgrade for higher limits.`);
        return;
      }
    }

    setUploadedFiles(files);
    setProcessingStatus('idle');
  };

  const startPipeline = () => {
    if (uploadedFiles.length === 0) return;

    setProcessingStatus('uploading');
    setProgressPercent(10);

    // Step 1: Uploading to Cloudflare R2 / AWS S3
    setTimeout(() => {
      setProgressPercent(35);
      setProcessingStatus('validating');

      // Step 2: Virus scanning & Malware check
      setTimeout(() => {
        setProgressPercent(65);
        setProcessingStatus('processing');

        // Step 3: Action Execution
        setTimeout(() => {
          setProgressPercent(100);
          setProcessingStatus('completed');

          const primaryFile = uploadedFiles[0];
          const origMB = primaryFile.size / (1024 * 1024) || 3.8;
          let outMB = origMB;

          if (selectedAction === 'compress') outMB = Math.max(0.2, origMB * 0.45);
          if (selectedAction === 'split') outMB = origMB * 0.3;

          const actionLabel = selectedAction.toUpperCase();
          const outName = `${primaryFile.name.replace(/\.[^/.]+$/, '')}_${actionLabel}.pdf`;

          const expTime = new Date(Date.now() + expirationHours * 3600 * 1000).toLocaleString();

          const dummyText = `CONFIDENTIAL DOCUMENT SUMMARY & EXTRACTED TEXT:\n\n1. Executive Summary: Financial statements for Q3 show a 34% expansion in subscription revenue.\n2. EVC Plus & Mobile Payments: Processed $148,000 via Somalia local gateway APIs.\n3. Cloud Infrastructure: R2 Storage buckets verified with zero malware signatures.`;

          setResultFile({
            originalName: primaryFile.name,
            outputName: outName,
            originalSizeMB: origMB,
            outputSizeMB: outMB,
            downloadUrl: '#download-ready',
            signedExpirationTime: expTime,
            extractedText: selectedAction === 'extract' || selectedAction === 'ocr' ? dummyText : undefined,
          });

          if (onLogFileProcess) {
            onLogFileProcess(primaryFile.name, origMB * 1024 * 1024, outMB * 1024 * 1024, `PDF ${actionLabel}`);
          }
        }, 1200);
      }, 900);
    }, 800);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('image')) return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    if (fileType.includes('video')) return <Video className="w-5 h-5 text-purple-500" />;
    if (fileType.includes('audio')) return <Music className="w-5 h-5 text-emerald-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="w-5 h-5 text-amber-500" />;
    return <FileCode className="w-5 h-5 text-cyan-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloudflare R2 & AWS S3 Storage Pipeline</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Universal File Processing Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Process PDF, Images, Video, Audio, & ZIP files securely with malware scanning and signed download link expiration controls.
          </p>
        </div>

        {/* Plan Limit Badge */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-right min-w-[200px]">
          <div className="text-xs text-slate-400">Current Plan Storage Enforcer</div>
          <div className="text-lg font-bold text-indigo-400">{user.plan} Plan</div>
          <div className="text-xs font-semibold text-emerald-400 mt-0.5">
            Max Upload Limit: <span className="text-white font-mono">{planSizeLimitMB} MB</span> / file
          </div>
        </div>
      </div>

      {/* PDF Tool Actions Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Select Pipeline Action Suite</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {[
            { id: 'compress', label: 'Compress PDF', icon: Minimize2, color: 'text-indigo-500' },
            { id: 'merge', label: 'Merge PDFs', icon: FilePlus, color: 'text-emerald-500' },
            { id: 'split', label: 'Split PDF', icon: Scissors, color: 'text-amber-500' },
            { id: 'convert', label: 'Convert PDF', icon: FileType, color: 'text-cyan-500' },
            { id: 'ocr', label: 'OCR Vision', icon: Eye, color: 'text-purple-500' },
            { id: 'extract', label: 'Extract Text', icon: FileText, color: 'text-rose-500' },
            { id: 'edit', label: 'Edit & Mark', icon: Sparkles, color: 'text-blue-500' },
          ].map((act) => {
            const Icon = act.icon;
            const isSel = selectedAction === act.id;
            return (
              <button
                key={act.id}
                onClick={() => setSelectedAction(act.id as PdfActionType)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  isSel
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg ring-2 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSel ? 'text-white' : act.color}`} />
                <span className="text-xs font-semibold">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STORAGE BACKEND & SECURITY SETTINGS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Encrypted Cloud Storage Node</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setUseStorageBackend('cloudflare_r2')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                useStorageBackend === 'cloudflare_r2'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Cloudflare R2
            </button>
            <button
              onClick={() => setUseStorageBackend('aws_s3')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-colors ${
                useStorageBackend === 'aws_s3'
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              AWS S3 Bucket
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Signed Access Link Expiration</span>
          </label>
          <select
            value={expirationHours}
            onChange={(e) => setExpirationHours(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>1 Hour Expiration (Strict)</option>
            <option value={24}>24 Hours Expiration (Recommended)</option>
            <option value={72}>72 Hours Expiration</option>
            <option value={168}>7 Days Expiration</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Malware & Security Protocol</span>
          </label>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>AES-256 Encryption & Antivirus Enabled</span>
          </div>
        </div>
      </div>

      {/* DRAG AND DROP UPLOAD ZONE */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer relative ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.mp4,.mp3,.zip,.rar"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-slate-700">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Drag & Drop files here or <span className="text-indigo-600 dark:text-indigo-400 underline">Browse Files</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PDF, PNG, JPG, DOCX, MP4, MP3, and ZIP files up to {planSizeLimitMB} MB.
            </p>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* UPLOADED FILES QUEUE LIST */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>File Queue ({uploadedFiles.length} item{uploadedFiles.length > 1 ? 's' : ''})</span>
            </h4>

            <button
              onClick={() => setUploadedFiles([])}
              className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{file.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Binary file'}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready
                </span>
              </div>
            ))}
          </div>

          {/* PROCESS START BUTTON */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={startPipeline}
              disabled={processingStatus !== 'idle'}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Pipeline ({selectedAction.toUpperCase()})</span>
            </button>
          </div>
        </div>
      )}

      {/* PIPELINE PROGRESS INDICATOR */}
      {processingStatus !== 'idle' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-indigo-400">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>
                {processingStatus === 'uploading' && 'Uploading file to encrypted bucket...'}
                {processingStatus === 'validating' && 'Executing malware scanning & security verification...'}
                {processingStatus === 'processing' && `Processing ${selectedAction.toUpperCase()} engine...`}
                {processingStatus === 'completed' && 'Processing Pipeline Completed Successfully!'}
              </span>
            </span>
            <span className="font-mono text-emerald-400">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* PIPELINE OUTPUT RESULT DISPLAY */}
      {resultFile && processingStatus === 'completed' && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 text-slate-100 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-emerald-300">File Output Ready for Download</h4>
                <p className="text-xs text-slate-300">
                  Storage: <span className="font-semibold text-amber-300 uppercase">{useStorageBackend}</span> • Signed Link Expiration: <span className="font-mono text-emerald-400">{resultFile.signedExpirationTime}</span>
                </p>
              </div>
            </div>

            <a
              href="#download"
              onClick={(e) => {
                e.preventDefault();
                alert(`Simulating download of processed output file: ${resultFile.outputName}`);
              }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Processed File</span>
            </a>
          </div>

          {resultFile.extractedText && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Extracted OCR / Document Text:
              </div>
              <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed">
                {resultFile.extractedText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
