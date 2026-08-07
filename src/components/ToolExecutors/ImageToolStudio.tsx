import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Image as ImageIcon,
  Scaling,
  RefreshCw,
  Layers,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Trash2,
} from 'lucide-react';

interface ImageToolStudioProps {
  toolId: string;
  initialFile?: File | null;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
}

export const ImageToolStudio: React.FC<ImageToolStudioProps> = ({
  toolId,
  initialFile,
  onBack,
  onLogFileProcess,
}) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [quality, setQuality] = useState(80);
  const [targetWidth, setTargetWidth] = useState(1200);
  const [targetFormat, setTargetFormat] = useState('webp');
  const [watermarkText, setWatermarkText] = useState('AI Success Hub');
  const [processing, setProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedImageUrl(null);
    }
  };

  const processImage = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = img.width;
      let height = img.height;

      if (toolId === 'image-resizer') {
        const aspectRatio = img.height / img.width;
        width = targetWidth;
        height = Math.round(targetWidth * aspectRatio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      if (toolId === 'watermark-image') {
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.strokeText(watermarkText, width / 2, height / 2);
        ctx.fillText(watermarkText, width / 2, height / 2);
      }

      let mimeType = `image/${targetFormat}`;
      if (toolId === 'image-compressor') {
        mimeType = file.type || 'image/jpeg';
      }

      const dataUrl = canvas.toDataURL(mimeType, quality / 100);
      setProcessedImageUrl(dataUrl);

      // Estimate byte size
      const head = `data:${mimeType};base64,`;
      const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
      setProcessedSize(sizeInBytes);

      onLogFileProcess(file.name, file.size, sizeInBytes, toolId);
    } catch (err: any) {
      console.error('Image processing error:', err);
      alert('Error processing image.');
    } finally {
      setProcessing(false);
    }
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
          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
              {toolId.replace('-', ' ')} Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browser-side canvas image optimization. Fast, local, and zero data leakage.
            </p>
          </div>
        </div>

        {/* File Dropzone */}
        {!file ? (
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center hover:border-blue-400 bg-slate-50/50 dark:bg-slate-950/50 transition-colors cursor-pointer relative mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Select or Drop an Image File (PNG, JPG, WEBP)
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-blue-500" />
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</div>
                <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setProcessedImageUrl(null);
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls depending on toolId */}
        {file && (
          <div className="space-y-4 mb-6">
            {toolId === 'image-compressor' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quality Level ({quality}%)
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            {toolId === 'image-resizer' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Width (px)
                </label>
                <input
                  type="number"
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(parseInt(e.target.value, 10) || 800)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            )}

            {toolId === 'image-converter' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Format
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="webp">WEBP (Next-Gen Smallest)</option>
                  <option value="jpeg">JPG / JPEG</option>
                  <option value="png">PNG (Lossless)</option>
                </select>
              </div>
            )}

            {toolId === 'watermark-image' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            )}
          </div>
        )}

        {/* Process CTA Button */}
        <button
          onClick={processImage}
          disabled={!file || processing}
          className="w-full py-3.5 px-6 font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Optimizing Image...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Process Image</span>
            </>
          )}
        </button>

        {/* Result Preview Box */}
        {processedImageUrl && (
          <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Image Processed!</span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Original: {file ? (file.size / 1024).toFixed(1) : 0} KB → Optimized:{' '}
              {(processedSize / 1024).toFixed(1)} KB (
              {file ? Math.round((1 - processedSize / file.size) * 100) : 0}% reduction)
            </div>

            <div className="max-h-64 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 mx-auto flex items-center justify-center bg-black/5">
              <img src={processedImageUrl} alt="Processed" className="max-h-60 object-contain" />
            </div>

            <a
              href={processedImageUrl}
              download={`processed_${file?.name || 'image'}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <Download className="w-4 h-4" /> Download Image
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
