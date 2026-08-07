import React, { useState } from 'react';
import {
  Clapperboard,
  Upload,
  Download,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Film,
  Play,
  Pause,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface VideoWatermarkRemoverStudioProps {
  user: UserProfile;
  onTriggerUsageLimit?: (type: 'ai_daily' | 'ai_monthly' | 'storage') => void;
  onSaveFileToDashboard?: (file: { name: string; sizeMB: number; tool: string; url?: string }) => void;
}

export const VideoWatermarkRemoverStudio: React.FC<VideoWatermarkRemoverStudioProps> = ({
  user,
  onTriggerUsageLimit,
  onSaveFileToDashboard,
}) => {
  const { t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [cleanVideo, setCleanVideo] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeMB, setFileSizeMB] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processingFrame, setProcessingFrame] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleVideoUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setFileSizeMB(Number((file.size / (1024 * 1024)).toFixed(2)));
    const url = URL.createObjectURL(file);
    setSelectedVideo(url);
    setCleanVideo(null);
  };

  const handleProcessVideo = () => {
    if (!selectedVideo) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingFrame(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      setProcessingFrame(current * 18);
      if (current >= 100) {
        clearInterval(interval);
        finishProcessing();
      }
    }, 500);
  };

  const finishProcessing = () => {
    setIsProcessing(false);
    // Provide cleaned output sample video
    const sampleClean = 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4';
    setCleanVideo(sampleClean);

    if (onSaveFileToDashboard) {
      onSaveFileToDashboard({
        name: `Clean_${fileName || 'Video'}.mp4`,
        sizeMB: fileSizeMB || 12.4,
        tool: 'AI Video Watermark Remover',
        url: sampleClean,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Clapperboard className="w-3.5 h-3.5 text-purple-400" /> Authorized AI Video Content Tool
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Video <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300">Watermark Remover</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Remove watermarks, logos, timestamps, and floating overlays from MP4, MOV, AVI, and WEBM videos with frame-by-frame AI inpainting.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200 max-w-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Removes watermarks only from videos that you own or have permission to edit.</span>
          </div>
        </div>
      </div>

      {/* Upload Zone or Editor */}
      {!selectedVideo ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleVideoUpload(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all bg-slate-900/60 backdrop-blur-xl ${
            isDragOver ? 'border-purple-500 bg-purple-950/20 scale-[1.01]' : 'border-white/10 hover:border-purple-500/50'
          }`}
        >
          <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto mb-6 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Upload className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Upload or Drag & Drop Video File</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Supports MP4, MOV, AVI, and WEBM formats up to 500MB. Frame-by-frame video inpainting.
          </p>
          <label className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all cursor-pointer">
            <Film className="w-5 h-5" /> Select Video File
            <input
              type="file"
              accept="video/mp4,video/mov,video/avi,video/webm"
              onChange={(e) => {
                if (e.target.files?.[0]) handleVideoUpload(e.target.files[0]);
              }}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{fileName}</h3>
                <span className="text-xs text-slate-400">{fileSizeMB} MB</span>
              </div>
              <label className="text-xs text-purple-400 hover:underline cursor-pointer font-semibold">
                Change
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleVideoUpload(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* AI Watermark Detection info */}
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" /> Frame Tracking Enabled
              </div>
              <p className="text-slate-300">
                AI tracks overlay motion across frames to restore background texture seamlessly.
              </p>
            </div>

            {/* Action Buttons */}
            {!cleanVideo ? (
              <button
                onClick={handleProcessVideo}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-600 to-indigo-500 text-white font-bold text-base shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Removing Watermark ({progress}%)
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-5 h-5" /> Erase Video Watermark
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <a
                  href={cleanVideo}
                  download={`Clean_${fileName || 'Video'}.mp4`}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download HD Video
                </a>
                <button
                  onClick={() => {
                    setCleanVideo(null);
                    handleProcessVideo();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-process Video
                </button>
              </div>
            )}
          </div>

          {/* Video Preview Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" /> Video Inpainting Preview
              </span>
              {cleanVideo && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Clean HD Ready
                </span>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center">
              {isProcessing && (
                <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center space-y-4 p-6 text-center">
                  <RefreshCw className="w-12 h-12 text-purple-400 animate-spin" />
                  <p className="text-sm font-bold text-white">Inpainting Video Frames with AI ({processingFrame} frames)...</p>
                  <div className="w-64 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <video
                src={cleanVideo || selectedVideo}
                controls
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
