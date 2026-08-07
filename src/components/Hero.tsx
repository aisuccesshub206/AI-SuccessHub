import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  FileText,
  Combine,
  Scissors,
  Minimize2,
  Wand2,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  FileCode,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { ToolItem } from '../types';

interface HeroProps {
  onSelectTool: (toolId: string, initialFile?: File) => void;
  tools: ToolItem[];
}

export const Hero: React.FC<HeroProps> = ({ onSelectTool, tools }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const getRecommendedToolsForFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return ['merge-pdf', 'split-pdf', 'compress-pdf', 'ai-summarizer', 'protect-pdf'];
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      return ['jpg-to-pdf', 'image-compressor', 'image-resizer', 'watermark-image'];
    } else if (['doc', 'docx', 'txt', 'md'].includes(ext || '')) {
      return ['word-to-pdf', 'ai-summarizer', 'ai-grammar-checker', 'doc-converter'];
    }
    return ['ai-summarizer', 'compress-pdf', 'pdf-to-text'];
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 transition-colors">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-r from-indigo-600/15 via-purple-600/15 to-cyan-500/15 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Eyebrow */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Next-Gen AI PDF & Productivity Platform</span>
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Every PDF Tool & AI Assistant You Need,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300 drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]">
              In One Platform.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Merge, split, compress, sign, and convert PDFs instantly. Plus, unlock built-in AI Copilot, document summarizer, writing assistant, and image generation.
          </p>
        </div>

        {/* Interactive Universal Upload Box */}
        <div className="mt-10 max-w-2xl mx-auto">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => !uploadedFile && fileInputRef.current?.click()}
            className={`relative rounded-3xl p-8 sm:p-10 text-center border transition-all duration-300 cursor-pointer backdrop-blur-2xl ${
              dragOver
                ? 'border-indigo-400 bg-indigo-950/70 scale-[1.01] shadow-[0_0_30px_rgba(99,102,241,0.4)]'
                : 'border-white/10 bg-[#0A0A10]/80 hover:border-indigo-500/50 hover:bg-[#0A0A10]/95 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {!uploadedFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Drop your document or file here
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, DOCX, JPG, PNG, WEBP, TXT up to 500 MB
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] inline-flex items-center gap-2 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Select File
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white truncate max-w-xs sm:max-w-md">
                        {uploadedFile.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFile(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Recommended Actions */}
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                    Select action for this file:
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getRecommendedToolsForFile(uploadedFile).map((toolId) => {
                      const tool = tools.find((t) => t.id === toolId);
                      if (!tool) return null;
                      return (
                        <button
                          key={tool.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTool(tool.id, uploadedFile);
                          }}
                          className="flex items-center gap-2 p-2.5 text-left bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/50 rounded-xl transition-all group shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        >
                          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-semibold text-white truncate">
                            {tool.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Security & Guarantee Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              End-to-End Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Secure Authentication Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-indigo-400" />
              1.2M+ Files Processed
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
