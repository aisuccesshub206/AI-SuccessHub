import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  X,
  ArrowRight,
  FileText,
  Zap,
  ShoppingBag,
  Code2,
  Database,
  HelpCircle,
  Users,
  DollarSign,
  Smartphone,
} from 'lucide-react';
import { ToolItem } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolItem[];
  onSelectTool: (toolId: string) => void;
  onNavigatePage: (page: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tools,
  onSelectTool,
  onNavigatePage,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'tools' | 'pages' | 'v2'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPages = [
    { id: 'automation', name: 'AI Workflow & Drag-and-Drop Creator', type: 'page', icon: Zap, cat: 'v2' },
    { id: 'knowledge-base', name: 'AI Knowledge Base & File Chat', type: 'page', icon: Database, cat: 'v2' },
    { id: 'api-platform', name: 'Developer API Platform & Keys', type: 'page', icon: Code2, cat: 'v2' },
    { id: 'marketplace', name: 'Template & AI Prompt Marketplace', type: 'page', icon: ShoppingBag, cat: 'v2' },
    { id: 'affiliate', name: 'Affiliate & Creator Dashboard', type: 'page', icon: DollarSign, cat: 'v2' },
    { id: 'team-workspace', name: 'Team & Enterprise Workspaces', type: 'page', icon: Users, cat: 'v2' },
    { id: 'support-center', name: '24/7 AI Support & Ticket System', type: 'page', icon: HelpCircle, cat: 'v2' },
    { id: 'mobile-hub', name: 'Mobile App Companion & Push SDK', type: 'page', icon: Smartphone, cat: 'v2' },
  ];

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredPages = quickPages.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0A0A10] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Search Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search tools, workflows, docs, API keys, marketplace, or AI chats..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-none focus:outline-none text-white placeholder-slate-500"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Auto-Suggestions Bar */}
        <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-400 text-[11px]">AI Suggestions:</span>
          <button
            onClick={() => setQuery('compress pdf')}
            className="px-2 py-0.5 rounded bg-white/5 text-indigo-300 hover:bg-white/10 text-[11px]"
          >
            Compress PDF
          </button>
          <button
            onClick={() => setQuery('workflow')}
            className="px-2 py-0.5 rounded bg-white/5 text-indigo-300 hover:bg-white/10 text-[11px]"
          >
            AI Workflows
          </button>
          <button
            onClick={() => setQuery('api')}
            className="px-2 py-0.5 rounded bg-white/5 text-indigo-300 hover:bg-white/10 text-[11px]"
          >
            Developer API
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3">
          
          {/* Quick SaaS Modules Section */}
          {filteredPages.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                SaaS Modules & V2 Platforms
              </div>
              {filteredPages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      onNavigatePage(page.id);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl flex items-center justify-between text-left bg-white/5 hover:bg-indigo-950/60 border border-white/5 hover:border-indigo-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-950 border border-indigo-800 text-indigo-400 rounded-lg">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                        {page.name}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Tools Section */}
          {filteredTools.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                PDF & AI Tools ({filteredTools.length})
              </div>
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-950 border border-purple-800 text-purple-400 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-300">
                        {tool.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-sm">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Command Footer */}
        <div className="p-3 bg-[#050508] border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Navigate with ⌘K</span>
          <span>Press ESC to exit</span>
        </div>

      </div>
    </div>
  );
};

