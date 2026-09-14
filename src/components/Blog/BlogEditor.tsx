import React, { useState, useRef } from 'react';
import { BlogArticle } from '../../types/blog';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Table as TableIcon,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  Undo,
  Redo,
  Loader2,
  Check,
} from 'lucide-react';

interface BlogEditorProps {
  article: BlogArticle;
  onChange: (updated: BlogArticle) => void;
  onAiAction: (action: string, selectedText: string) => Promise<string | undefined>;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ article, onChange, onAiAction }) => {
  const [selectedText, setSelectedText] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTitleChange = (newTitle: string) => {
    onChange({
      ...article,
      title: newTitle,
    });
  };

  const handleContentChange = (newHtml: string) => {
    // Estimate word count
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newHtml;
    const text = tempDiv.textContent || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 220));

    onChange({
      ...article,
      contentHtml: newHtml,
      wordCount: words,
      readTimeMinutes: readTime,
    });
  };

  // Helper formatting commands on contentEditable
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleContentChange(editorRef.current.innerHTML);
    }
  };

  // Handle Text Selection for Floating AI Actions
  const handleSelectText = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      setSelectedText(sel.toString().trim());
    } else {
      setSelectedText('');
    }
  };

  const handleRunAiAction = async (action: string) => {
    if (!selectedText) return;

    setIsAiProcessing(true);
    setAiSuccessMessage('');

    try {
      const result = await onAiAction(action, selectedText);
      if (result && editorRef.current) {
        // Replace selected text in content
        const currentHtml = editorRef.current.innerHTML;
        const updatedHtml = currentHtml.replace(selectedText, result);
        editorRef.current.innerHTML = updatedHtml;
        handleContentChange(updatedHtml);

        setAiSuccessMessage(`AI Action "${action}" applied!`);
        setTimeout(() => setAiSuccessMessage(''), 3000);
        setSelectedText('');
      }
    } catch (err) {
      console.error('AI Action error:', err);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const AI_ACTIONS = [
    { id: 'Improve Writing', label: 'Improve Writing' },
    { id: 'Rewrite', label: 'Rewrite' },
    { id: 'Expand', label: 'Expand Paragraph' },
    { id: 'Shorten', label: 'Shorten & Concise' },
    { id: 'Simplify', label: 'Simplify Wording' },
    { id: 'Make Professional', label: 'Make Professional' },
    { id: 'Make More Engaging', label: 'Make Engaging' },
    { id: 'Fix Grammar', label: 'Fix Grammar' },
    { id: 'Continue Writing', label: 'Continue Writing' },
  ];

  return (
    <div className="space-y-4">
      {/* Document Editor Toolbar */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h2>')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all text-xs font-bold flex items-center gap-1"
            title="Heading 2 (H2)"
          >
            <Heading2 className="w-4 h-4 text-indigo-500" />
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<h3>')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all text-xs font-bold flex items-center gap-1"
            title="Heading 3 (H3)"
          >
            <Heading3 className="w-4 h-4 text-indigo-500" />
            H3
          </button>
          <button
            type="button"
            onClick={() => executeCommand('formatBlock', '<p>')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all text-xs font-semibold"
            title="Paragraph"
          >
            P
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Bold / Italic */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Insert Table / Link */}
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter link URL:');
              if (url) executeCommand('createLink', url);
            }}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Word Count Indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>{article.wordCount} words</span>
          <span>•</span>
          <span>~{article.readTimeMinutes} min read</span>
        </div>
      </div>

      {/* Floating AI Actions Toolbar when text is selected */}
      {selectedText && (
        <div className="p-3 bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl shadow-xl border border-indigo-500/50 flex flex-wrap items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span className="text-xs font-bold text-indigo-200">AI Quick Actions for selected text:</span>
            <span className="text-[11px] bg-indigo-950/80 px-2 py-0.5 rounded text-indigo-300 font-mono truncate max-w-[150px]">
              "{selectedText.slice(0, 20)}..."
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {AI_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleRunAiAction(action.id)}
                disabled={isAiProcessing}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 transition-all disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {aiSuccessMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {aiSuccessMessage}
        </div>
      )}

      {/* Modern Document Editor Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Title Input Area */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Article Title (H1)</label>
          <input
            type="text"
            value={article.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter Blog Article Title..."
            className="w-full text-2xl md:text-3xl font-black text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:outline-none pb-2 transition-all leading-tight"
          />
        </div>

        {/* Content Editable Area */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Article Body (Highlight any text for instant AI writing actions)
          </label>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onMouseUp={handleSelectText}
            onKeyUp={handleSelectText}
            onBlur={() => {
              if (editorRef.current) {
                handleContentChange(editorRef.current.innerHTML);
              }
            }}
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            className="min-h-[500px] p-4 md:p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 prose dark:prose-invert max-w-none font-sans"
          />
        </div>

      </div>
    </div>
  );
};
