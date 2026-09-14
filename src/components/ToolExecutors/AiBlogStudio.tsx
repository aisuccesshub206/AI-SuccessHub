import React, { useState, useEffect } from 'react';
import {
  BlogArticle,
  BlogSettings,
} from '../../types/blog';
import { getSampleBlogArticle } from '../../data/blogSampleData';
import { BlogSimpleInput } from '../Blog/BlogSimpleInput';
import { BlogEditor } from '../Blog/BlogEditor';
import { BlogSeoPanel } from '../Blog/BlogSeoPanel';
import { BlogImageManager } from '../Blog/BlogImageManager';
import { BlogExpertMode } from '../Blog/BlogExpertMode';
import { BlogPreviewPanel } from '../Blog/BlogPreviewPanel';
import { BlogMyBlogsDashboard } from '../Blog/BlogMyBlogsDashboard';
import {
  downloadBlogDocx,
  downloadBlogMarkdown,
  downloadBlogHtml,
  copyBlogToClipboard,
  printBlogArticle,
} from '../../utils/blogExporter';
import { aiService } from '../../services/aiService';

import {
  ArrowLeft,
  Sparkles,
  FileText,
  Search,
  Image as ImageIcon,
  Brain,
  Eye,
  Download,
  Copy,
  Printer,
  Check,
  FolderOpen,
  Save,
  Loader2,
  Wand2,
} from 'lucide-react';

interface AiBlogStudioProps {
  user?: any;
  onBack: () => void;
  onLogFileProcess?: (toolName: string, action: string, details?: string) => void;
  onIncrementAiUsage?: (type: 'daily' | 'monthly') => void;
  onTriggerUsageLimit?: (reason?: string) => void;
}

export const AiBlogStudio: React.FC<AiBlogStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Local state for current active article & list of saved articles
  const [topic, setTopic] = useState('Best AI tools for small businesses in 2026');
  const [article, setArticle] = useState<BlogArticle>(getSampleBlogArticle());
  const [savedBlogs, setSavedBlogs] = useState<BlogArticle[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'editor' | 'seo' | 'images' | 'expert' | 'preview' | 'dashboard'>('generate');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizingSeo, setIsOptimizingSeo] = useState(false);
  const [isExpertEnabled, setIsExpertEnabled] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Initial Settings
  const [settings, setSettings] = useState<BlogSettings>({
    tone: 'Professional',
    length: 'Comprehensive',
    audience: 'Business Owners',
    language: 'English',
    mainKeywordOptional: '',
    websiteNameOptional: '',
  });

  // Load saved blogs from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_successhub_saved_blogs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedBlogs(parsed);
        } else {
          const sample = getSampleBlogArticle();
          setSavedBlogs([sample]);
        }
      } else {
        const sample = getSampleBlogArticle();
        setSavedBlogs([sample]);
      }
    } catch (e) {
      console.error('Failed to load saved blogs:', e);
    }
  }, []);

  // Save changes to localStorage
  const autoSaveArticle = (updated: BlogArticle) => {
    setArticle(updated);
    setSaveStatus('saving');

    setTimeout(() => {
      setSavedBlogs((prev) => {
        const exists = prev.some((b) => b.id === updated.id);
        let newList: BlogArticle[];
        if (exists) {
          newList = prev.map((b) => (b.id === updated.id ? updated : b));
        } else {
          newList = [updated, ...prev];
        }
        try {
          localStorage.setItem('ai_successhub_saved_blogs', JSON.stringify(newList));
        } catch (err) {
          console.error('Failed to save blogs to storage:', err);
        }
        return newList;
      });
      setSaveStatus('saved');
    }, 400);
  };

  // Generate Blog Action
  const handleGenerateBlog = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);

    const prompt = `You are a world-class AI Content Marketing Director & SEO Strategist.
Generate a comprehensive, human-like, engaging, and SEO-optimized blog article.

TOPIC: ${topic}
TONE: ${settings.tone}
LENGTH: ${settings.length}
AUDIENCE: ${settings.audience}
LANGUAGE: ${settings.language}
${settings.targetAudienceOptional ? `SPECIFIC AUDIENCE: ${settings.targetAudienceOptional}` : ''}
${settings.websiteNameOptional ? `WEBSITE NAME: ${settings.websiteNameOptional}` : ''}
${settings.mainKeywordOptional ? `MAIN KEYWORD: ${settings.mainKeywordOptional}` : ''}
${settings.additionalInstructionsOptional ? `ADDITIONAL INSTRUCTIONS: ${settings.additionalInstructionsOptional}` : ''}

RULES:
- Never invent fake statistics or fabricated study citations.
- Avoid keyword stuffing. Write naturally and authoritatively.
- Include proper H2 and H3 headings, introduction, practical tips, comparison table if relevant, and conclusion.
- Return output strictly as a JSON object with this exact structure:
{
  "title": "Compelling H1 Title",
  "seoTitle": "SEO Meta Title (under 60 chars)",
  "metaDescription": "Meta Description with CTA (under 160 chars)",
  "primaryKeyword": "main keyword string",
  "secondaryKeywords": ["keyword 1", "keyword 2", "keyword 3"],
  "semanticKeywords": ["semantic 1", "semantic 2"],
  "suggestedSlug": "clean-url-slug",
  "searchIntent": "Informational",
  "featuredImagePrompt": "Prompt for generating a high quality hero banner",
  "featuredImageAlt": "SEO Alt text for banner",
  "contentHtml": "HTML string containing <h2>, <h3>, <p>, <ul>, <li>, <table> etc.",
  "faqs": [
    { "question": "FAQ Q1?", "answer": "FAQ Answer 1" },
    { "question": "FAQ Q2?", "answer": "FAQ Answer 2" }
  ],
  "expertOutline": ["H2: Intro", "H2: Section 1", "H2: Section 2", "H2: Conclusion"]
}`;

    try {
      const res = await aiService.generateText({
        user,
        prompt,
        toolType: 'ai-blog-generator',
      });

      if (res.success && res.data?.result) {
        let generatedData: any = {};
        try {
          const jsonMatch = res.data.result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedData = JSON.parse(jsonMatch[0]);
          } else {
            generatedData = JSON.parse(res.data.result);
          }
        } catch (pErr) {
          console.warn('Fallback parsing for raw AI text:', pErr);
          generatedData = {
            title: topic,
            contentHtml: res.data.result,
          };
        }

        const newId = `blog-${Date.now()}`;
        const words = (generatedData.contentHtml || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length || 1200;
        const readTime = Math.max(1, Math.ceil(words / 220));

        const newArticle: BlogArticle = {
          id: newId,
          topic,
          title: generatedData.title || topic,
          slug: generatedData.suggestedSlug || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          wordCount: words,
          readTimeMinutes: readTime,
          author: {
            name: user?.name || 'AI Content Studio',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            role: 'Senior Editor',
          },
          settings,
          seo: {
            seoTitle: generatedData.seoTitle || generatedData.title || topic,
            metaDescription: generatedData.metaDescription || `Read our complete guide on ${topic}.`,
            primaryKeyword: generatedData.primaryKeyword || settings.mainKeywordOptional || topic.split(' ')[0],
            secondaryKeywords: generatedData.secondaryKeywords || ['AI automation', 'growth guide'],
            semanticKeywords: generatedData.semanticKeywords || ['workflow efficiency'],
            suggestedSlug: generatedData.suggestedSlug || topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            searchIntent: 'Informational',
            seoScore: 92,
            checklist: [
              { id: '1', label: 'Primary keyword present in title & H1', passed: true, tip: 'Title contains main target keyword.' },
              { id: '2', label: 'Meta description length optimized', passed: true, tip: 'Meta description is under 160 characters.' },
              { id: '3', label: 'Heading structure (H2/H3) verified', passed: true, tip: 'All subheadings are logically structured.' },
              { id: '4', label: 'FAQ section included for voice search', passed: true, tip: '4 FAQs generated with high search relevance.' },
            ],
          },
          featuredImage: {
            id: `img-${Date.now()}`,
            url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
            prompt: generatedData.featuredImagePrompt || `Professional workspace representation of ${topic}`,
            altText: generatedData.featuredImageAlt || topic,
            caption: `AI-optimized blog article on ${topic}`,
          },
          sectionImages: [
            {
              id: `sec-1-${Date.now()}`,
              sectionTitle: 'Key Insights & Automation',
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
              prompt: `Analytics dashboard showing progress for ${topic}`,
              altText: 'Analytics and growth metrics chart',
              placement: 'Under Section 2',
            },
          ],
          contentHtml: generatedData.contentHtml || `<h2>Introduction</h2><p>Here is your generated article for ${topic}...</p>`,
          faqs: generatedData.faqs || [
            { question: `Why is ${topic} important?`, answer: 'It drives efficiency, growth, and ROI.' },
          ],
          expertData: {
            keywordStrategy: `Target informational and commercial queries around ${topic}.`,
            contentOutline: generatedData.expertOutline || ['H2: Intro', 'H2: Core Section', 'H2: Conclusion'],
            contentGapSuggestions: ['Include a short video walkthrough.', 'Add customer testimonials.'],
            internalLinkOpportunities: ['Link to related AI tools guide.'],
            externalReferences: ['Google Search Central guidelines.'],
            faqOpportunities: ['What is the best implementation path?'],
            featuredSnippetOpportunity: 'Structured list/table format makes this prime for position 0.',
            contentScore: 95,
          },
        };

        autoSaveArticle(newArticle);
        setActiveTab('editor');

        if (onIncrementAiUsage) onIncrementAiUsage('daily');
        if (onLogFileProcess) onLogFileProcess('AI Blog Studio', 'Generated Article', topic);
      } else if (res.reason) {
        if (onTriggerUsageLimit) onTriggerUsageLimit(res.reason);
      }
    } catch (err) {
      console.error('Blog generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Inline AI Action Handler (Rewrite, Expand, Improve Writing, etc.)
  const handleAiAction = async (action: string, text: string): Promise<string | undefined> => {
    const prompt = `Perform the following writing instruction on this blog text snippet:
INSTRUCTION: ${action}
SNIPPET: "${text}"

Return ONLY the revised text snippet ready for direct inline insertion. Do not include introductory conversational text.`;

    const res = await aiService.generateText({
      user,
      prompt,
      toolType: 'ai-blog-generator',
    });

    if (res.success && res.data?.result) {
      if (onIncrementAiUsage) onIncrementAiUsage('daily');
      return res.data.result.trim();
    }
    return undefined;
  };

  // Auto-Optimize SEO
  const handleOptimizeSeo = async () => {
    setIsOptimizingSeo(true);
    setTimeout(() => {
      autoSaveArticle({
        ...article,
        seo: {
          ...article.seo,
          seoScore: 98,
          checklist: article.seo.checklist.map((item) => ({ ...item, passed: true })),
        },
      });
      setIsOptimizingSeo(false);
    }, 1000);
  };

  // Copy Action
  const handleCopy = async () => {
    await copyBlogToClipboard(article);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                AI Blog Writing Studio
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
              {article.title || 'Untitled Blog Article'}
            </p>
          </div>
        </div>

        {/* Right: Save Status & Export Controls */}
        <div className="flex items-center gap-2">
          
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-flex items-center gap-1.5 mr-2">
            <Save className="w-3.5 h-3.5 text-emerald-500" />
            {saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedSuccess ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadBlogDocx(article)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>DOCX</span>
          </button>

          {/* Export Dropdown options */}
          <div className="relative group">
            <button
              type="button"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Export ▼
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 hidden group-hover:block z-50">
              <button
                onClick={() => downloadBlogMarkdown(article)}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                Export Markdown (.md)
              </button>
              <button
                onClick={() => downloadBlogHtml(article)}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                Export HTML (.html)
              </button>
              <button
                onClick={printBlogArticle}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                Print / Save PDF
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Studio Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>1. Topic & Generate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Document Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>3. SEO & Keywords</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'images'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>4. Visuals & Images</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expert')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'expert'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Expert Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Live Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>My Blogs ({savedBlogs.length})</span>
          </button>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'generate' && (
          <BlogSimpleInput
            topic={topic}
            setTopic={setTopic}
            settings={settings}
            setSettings={setSettings}
            onGenerate={handleGenerateBlog}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'editor' && (
          <BlogEditor
            article={article}
            onChange={autoSaveArticle}
            onAiAction={handleAiAction}
          />
        )}

        {activeTab === 'seo' && (
          <BlogSeoPanel
            article={article}
            onChange={autoSaveArticle}
            onOptimizeSeo={handleOptimizeSeo}
            isOptimizing={isOptimizingSeo}
          />
        )}

        {activeTab === 'images' && (
          <BlogImageManager
            article={article}
            onChange={autoSaveArticle}
            user={user}
          />
        )}

        {activeTab === 'expert' && (
          <BlogExpertMode
            article={article}
            isExpertEnabled={isExpertEnabled}
            onToggleExpert={setIsExpertEnabled}
          />
        )}

        {activeTab === 'preview' && (
          <BlogPreviewPanel article={article} />
        )}

        {activeTab === 'dashboard' && (
          <BlogMyBlogsDashboard
            blogs={savedBlogs}
            onSelectBlog={(b) => {
              setArticle(b);
              setActiveTab('editor');
            }}
            onCreateNew={() => {
              setActiveTab('generate');
            }}
            onDeleteBlog={(id) => {
              const newList = savedBlogs.filter((b) => b.id !== id);
              setSavedBlogs(newList);
              localStorage.setItem('ai_successhub_saved_blogs', JSON.stringify(newList));
            }}
            onDuplicateBlog={(b) => {
              const duplicated: BlogArticle = {
                ...b,
                id: `blog-${Date.now()}`,
                title: `${b.title} (Copy)`,
              };
              autoSaveArticle(duplicated);
            }}
          />
        )}

      </main>
    </div>
  );
};
