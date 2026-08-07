import React from 'react';
import {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Stamp,
  Hash,
  FileImage,
  ImagePlus,
  FileText,
  FileCode,
  PenTool,
  Bot,
  Sparkles,
  Feather,
  Briefcase,
  Mail,
  Send,
  Newspaper,
  Video,
  Languages,
  CheckCheck,
  Wand2,
  Terminal,
  Share2,
  FileDigit,
  Scaling,
  RefreshCw,
  Layers,
  FileStack,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { ToolItem } from '../types';

interface ToolCardProps {
  tool: ToolItem;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
  onSelectTool: (toolId: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Stamp,
  Hash,
  FileImage,
  ImagePlus,
  FileText,
  FileCode,
  PenTool,
  Bot,
  Sparkles,
  Feather,
  Briefcase,
  Mail,
  Send,
  Newspaper,
  Video,
  Languages,
  CheckCheck,
  Wand2,
  Terminal,
  Share2,
  FileDigit,
  Scaling,
  RefreshCw,
  Layers,
  FileStack,
};

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isFavorite,
  onToggleFavorite,
  onSelectTool,
}) => {
  const IconComponent = iconMap[tool.iconName] || Sparkles;

  const getBadgeStyle = () => {
    switch (tool.badge) {
      case 'AI Powered':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Popular':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Pro':
        return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getCategoryColor = () => {
    switch (tool.category) {
      case 'pdf':
        return 'text-red-500 bg-red-50 dark:bg-red-950/50';
      case 'ai':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-950/50';
      case 'image':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/50';
      case 'converter':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50';
      default:
        return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50';
    }
  };

  return (
    <div
      onClick={() => onSelectTool(tool.id)}
      className="group relative bg-[#07070e]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-indigo-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:bg-[#0C0D18]/90 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`p-3 rounded-xl ${getCategoryColor()} border border-white/5 group-hover:scale-105 transition-transform duration-200 shadow-inner`}>
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-sm ${getBadgeStyle()}`}>
                {tool.badge}
              </span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(tool.id);
              }}
              className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
          <span>{tool.name}</span>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </h3>

        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Footer Tags */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-1">
        {tool.tags.slice(0, 3).map((tag, idx) => (
          <span key={idx} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};
