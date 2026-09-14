import React, { useState } from 'react';
import { BlogArticle, BlogImageItem } from '../../types/blog';
import {
  Image as ImageIcon,
  Sparkles,
  Upload,
  RefreshCw,
  Trash2,
  Wand2,
  Loader2,
  Check,
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface BlogImageManagerProps {
  article: BlogArticle;
  onChange: (updated: BlogArticle) => void;
  user?: any;
}

export const BlogImageManager: React.FC<BlogImageManagerProps> = ({ article, onChange, user }) => {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle AI Image Generation for Featured or Section Image
  const handleGenerateAiImage = async (imageItem: BlogImageItem, isFeatured: boolean) => {
    setGeneratingId(imageItem.id);
    setErrorMsg('');

    try {
      const res = await aiService.generateImage({
        user,
        prompt: imageItem.prompt || article.topic,
        aspectRatio: isFeatured ? '16:9' : '4:3',
        quality: 'standard',
      });

      if (res.success && res.data?.imageUrl) {
        if (isFeatured) {
          onChange({
            ...article,
            featuredImage: {
              ...article.featuredImage,
              url: res.data.imageUrl,
            },
          });
        } else {
          const updatedSectionImages = article.sectionImages.map((img) =>
            img.id === imageItem.id ? { ...img, url: res.data!.imageUrl } : img
          );
          onChange({
            ...article,
            sectionImages: updatedSectionImages,
          });
        }
      } else {
        setErrorMsg(res.error || 'Failed to generate AI image.');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setErrorMsg(err.message || 'Image generation service error.');
    } finally {
      setGeneratingId(null);
    }
  };

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, imageItem: BlogImageItem, isFeatured: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (isFeatured) {
        onChange({
          ...article,
          featuredImage: {
            ...article.featuredImage,
            url: dataUrl,
          },
        });
      } else {
        const updatedSectionImages = article.sectionImages.map((img) =>
          img.id === imageItem.id ? { ...img, url: dataUrl } : img
        );
        onChange({
          ...article,
          sectionImages: updatedSectionImages,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Image
  const handleRemoveImage = (imageItem: BlogImageItem, isFeatured: boolean) => {
    if (isFeatured) {
      onChange({
        ...article,
        featuredImage: {
          ...article.featuredImage,
          url: '',
        },
      });
    } else {
      const updatedSectionImages = article.sectionImages.map((img) =>
        img.id === imageItem.id ? { ...img, url: '' } : img
      );
      onChange({
        ...article,
        sectionImages: updatedSectionImages,
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-500" />
            Visual Assets & Image Manager
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate AI visuals or upload custom images for featured banners and section headers.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* 1. Featured Hero Banner Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            ★ Featured Article Header Banner
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Recommended Ratio: 16:9 (1200x675)</span>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 min-h-[220px] flex items-center justify-center">
          {article.featuredImage.url ? (
            <div className="relative w-full h-[280px] group">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.altText || 'Featured banner'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => handleGenerateAiImage(article.featuredImage, true)}
                  disabled={generatingId === article.featuredImage.id}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  {generatingId === article.featuredImage.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate AI
                </button>
                <label className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg">
                  <Upload className="w-4 h-4" />
                  Replace
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, article.featuredImage, true)} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(article.featuredImage, true)}
                  className="p-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4 max-w-md">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 inline-block">
                <Wand2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Featured Banner Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  AI Prompt Recommendation: "{article.featuredImage.prompt || article.topic}"
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerateAiImage(article.featuredImage, true)}
                  disabled={generatingId === article.featuredImage.id}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generatingId === article.featuredImage.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate AI Hero Banner
                </button>

                <label className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, article.featuredImage, true)} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Alt Text & Caption Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Banner Alt Text (SEO)</label>
            <input
              type="text"
              value={article.featuredImage.altText}
              onChange={(e) =>
                onChange({
                  ...article,
                  featuredImage: { ...article.featuredImage, altText: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Banner Caption</label>
            <input
              type="text"
              value={article.featuredImage.caption || ''}
              onChange={(e) =>
                onChange({
                  ...article,
                  featuredImage: { ...article.featuredImage, caption: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Section Images Placeholders */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Section Visual Opportunities</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {article.sectionImages.map((secImg) => (
            <div
              key={secImg.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{secImg.sectionTitle}</span>
                <span className="text-[10px] text-slate-400 font-mono">{secImg.placement}</span>
              </div>

              <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-200/50 dark:bg-slate-900 flex items-center justify-center">
                {secImg.url ? (
                  <img src={secImg.url} alt={secImg.altText} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-3">
                    <p className="text-[11px] text-slate-500 italic mb-2">"{secImg.prompt}"</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateAiImage(secImg, false)}
                        disabled={generatingId === secImg.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {generatingId === secImg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Generate AI
                      </button>

                      <label className="px-3 py-1.5 rounded-lg bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, secImg, false)} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
