import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  FileText,
  Wand2,
  Languages,
  BookOpen,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface AiTextStudioProps {
  toolId: string;
  initialText?: string;
  user?: UserProfile;
  onBack: () => void;
  onLogFileProcess: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export const AiTextStudio: React.FC<AiTextStudioProps> = ({
  toolId,
  initialText = '',
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  const [prompt, setPrompt] = useState('');
  const [contextText, setContextText] = useState(initialText);
  const [tone, setTone] = useState('Professional');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [length, setLength] = useState('Comprehensive');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const getToolTitle = () => {
    switch (toolId) {
      case 'ai-summarizer':
        return 'AI Document Summarizer';
      case 'ai-writing-assistant':
        return 'AI Writing Assistant';
      case 'ai-resume-builder':
        return 'AI Resume & CV Builder';
      case 'ai-cover-letter':
        return 'AI Cover Letter Generator';
      case 'ai-email-generator':
        return 'AI Email Writer';
      case 'ai-blog-generator':
        return 'AI Blog & Article Writer';
      case 'ai-youtube-script':
        return 'AI YouTube Script Generator';
      case 'ai-translator':
        return 'AI Multi-Language Translator';
      case 'ai-grammar-checker':
        return 'AI Grammar Checker & Proofreader';
      case 'ai-prompt-generator':
        return 'AI Prompt Engineer';
      case 'ai-social-post':
        return 'AI Social Post Generator';
      default:
        return 'AI Productivity Generator';
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !contextText) return;

    // Validate remaining monthly/daily request credits using aiService before calling model
    const limitCheck = aiService.checkLimits(user);
    if (!limitCheck.allowed) {
      const reason = limitCheck.reason === 'ai_monthly' ? 'ai_monthly' : 'ai_daily';
      if (onTriggerUsageLimit) onTriggerUsageLimit(reason);
      setResult(`⚠️ ${limitCheck.message || 'Request limit reached for your plan.'}`);
      return;
    }

    setGenerating(true);
    setResult('');

    try {
      const response = await aiService.generateText({
        user,
        toolType: toolId.replace('ai-', ''),
        prompt,
        contextText,
        tone,
        targetLanguage,
        length,
      });

      if (!response.success) {
        if (response.reason === 'ai_daily' || response.reason === 'ai_monthly') {
          if (onTriggerUsageLimit) onTriggerUsageLimit(response.reason);
        }
        setResult(`⚠️ ${response.error || 'Failed to process AI request.'}`);
        return;
      }

      if (response.data?.result) {
        setResult(response.data.result);
        onLogFileProcess(`${toolId}_output.txt`, prompt.length, response.data.result.length, getToolTitle());
        if (onIncrementAiUsage) onIncrementAiUsage();
      } else {
        setResult('Error generating content. Please try again.');
      }
    } catch (err: any) {
      console.error('AI Text Studio Error:', err);
      setResult(`Failed to connect to AI server: ${err.message || err}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolId}_result.txt`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Back Button */}
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
          <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {getToolTitle()}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by Google Gemini AI 3.6 Flash. Instant high-precision outputs.
            </p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="space-y-4 mb-6">
          
          {/* Main User Prompt / Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
              Topic, Prompt or Specific Instructions:
            </label>
            <input
              type="text"
              placeholder={
                toolId === 'ai-resume-builder'
                  ? 'e.g. Senior Software Engineer with 7 years Experience in React, Node, and Cloud'
                  : toolId === 'ai-email-generator'
                  ? 'e.g. Follow up email after sales demo for enterprise SaaS plan'
                  : 'Describe what you want to generate...'
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Context Textarea (for Summarizer, Grammar, Translator) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
              Document Text / Context Content (Optional):
            </label>
            <textarea
              rows={5}
              placeholder="Paste article, document text, email thread or resume bullet points here..."
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tone Style
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Professional">Professional Executive</option>
                <option value="Conversational">Conversational & Friendly</option>
                <option value="Persuasive">Persuasive Marketing</option>
                <option value="Academic">Academic & Analytical</option>
                <option value="Urgent">Urgent & Direct</option>
              </select>
            </div>

            {toolId === 'ai-translator' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Mandarin Chinese">Mandarin Chinese</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Target Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Concise">Concise & Punchy</option>
                  <option value="Comprehensive">Standard Comprehensive</option>
                  <option value="Detailed">In-Depth & Detailed</option>
                </select>
              </div>
            )}
          </div>

        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || (!prompt && !contextText)}
          className="w-full py-3.5 px-6 font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 rounded-2xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Content</span>
            </>
          )}
        </button>

        {/* Output Section */}
        {result && (
          <div className="mt-8 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                AI Output Result:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={downloadText}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save TXT</span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {result}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
