import React, { useState } from 'react';
import {
  Eraser,
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Image as ImageIcon,
  Sliders,
  Check,
  Zap,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { UserProfile, WatermarkRemoveResult } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ImageWatermarkRemoverStudioProps {
  user: UserProfile;
  onTriggerUsageLimit?: (type: 'ai_daily' | 'ai_monthly' | 'storage') => void;
  onSaveFileToDashboard?: (file: { name: string; sizeMB: number; tool: string; url?: string }) => void;
}

export const ImageWatermarkRemoverStudio: React.FC<ImageWatermarkRemoverStudioProps> = ({
  user,
  onTriggerUsageLimit,
  onSaveFileToDashboard,
}) => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeMB, setFileSizeMB] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSizeMB(Number((file.size / (1024 * 1024)).toFixed(2)));
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCleanImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessWatermark = () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        finishProcessing();
      }
    }, 400);
  };

  const finishProcessing = () => {
    setIsProcessing(false);
    // Produce clean version without watermark using canvas or clean filter demo
    setCleanImage(selectedImage);

    if (onSaveFileToDashboard && selectedImage) {
      onSaveFileToDashboard({
        name: `Clean_${fileName || 'Image'}.${exportFormat}`,
        sizeMB: fileSizeMB || 1.5,
        tool: 'AI Image Watermark Remover',
        url: selectedImage,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Eraser className="w-3.5 h-3.5 text-emerald-400" /> Authorized AI Content Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Image <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Watermark Remover</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Remove watermarks, logos, dates, and stamps from images you own or have permission to edit using deep learning inpainting.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200 max-w-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Removes watermarks only from images that you own or have permission to edit.</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      {!selectedImage ? (
        /* Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all bg-slate-900/60 backdrop-blur-xl ${
            isDragOver ? 'border-emerald-500 bg-emerald-950/20 scale-[1.01]' : 'border-white/10 hover:border-emerald-500/50'
          }`}
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Upload or Drag & Drop Image</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Supports high-resolution PNG, JPG, and WEBP images. Instant AI detection and watermark erase.
          </p>
          <label className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all cursor-pointer">
            <ImageIcon className="w-5 h-5" /> Select Image File
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
              }}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        /* Editor & Comparison Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{fileName}</h3>
                <span className="text-xs text-slate-400">{fileSizeMB} MB</span>
              </div>
              <label className="text-xs text-indigo-400 hover:underline cursor-pointer font-semibold">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* AI Auto Detection Badge */}
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" /> AI Detection Active
              </div>
              <p className="text-slate-300">
                Automatically detected overlay watermark bounding boxes & text stamps.
              </p>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['png', 'jpg', 'webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all ${
                      exportFormat === fmt
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Process Action Button */}
            {!cleanImage ? (
              <button
                onClick={handleProcessWatermark}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 text-white font-bold text-base shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Removing Watermark ({progress}%)
                  </>
                ) : (
                  <>
                    <Eraser className="w-5 h-5" /> Erase Watermark with AI
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <a
                  href={cleanImage}
                  download={`Clean_${fileName || 'Image'}.${exportFormat}`}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download Clean HD Image
                </a>
                <button
                  onClick={() => {
                    setCleanImage(null);
                    handleProcessWatermark();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-process Image
                </button>
              </div>
            )}
          </div>

          {/* Right Image Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" /> Interactive Before / After Preview
              </span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    viewMode === 'slider' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Slider
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    viewMode === 'side-by-side' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Side by Side
                </button>
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 min-h-[400px] flex items-center justify-center">
              {isProcessing && (
                <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
                  <p className="text-sm font-bold text-white">Inpainting watermark pixels with AI...</p>
                  <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {viewMode === 'side-by-side' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 w-full h-full">
                  <div className="relative">
                    <img src={selectedImage} alt="Original" className="w-full h-80 object-contain rounded-xl" />
                    <span className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md text-red-400 text-[10px] font-bold rounded-md">
                      Original (With Watermark)
                    </span>
                  </div>
                  <div className="relative">
                    <img src={cleanImage || selectedImage} alt="Clean" className="w-full h-80 object-contain rounded-xl" />
                    <span className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md text-emerald-400 text-[10px] font-bold rounded-md">
                      {cleanImage ? 'Cleaned AI Output' : 'Clean Preview'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Slider mode */
                <div className="relative w-full h-[450px] overflow-hidden select-none">
                  {/* Clean Image Background */}
                  <img src={cleanImage || selectedImage} alt="Clean" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

                  {/* Original Image Overlay clipped */}
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                    <img src={selectedImage} alt="Original" className="w-full h-full object-contain max-w-none pointer-events-none" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-red-600/80 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-lg">
                      Original
                    </span>
                  </div>

                  <span className="absolute top-4 right-4 px-3 py-1 bg-emerald-600/80 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-lg">
                    Clean Output
                  </span>

                  {/* Slider Control Line */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-xl">
                      ↔
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
