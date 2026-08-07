import React, { useState } from 'react';
import { Search, Sparkles, FileText, Wand2, Image as ImageIcon, RefreshCw, Star, Grid } from 'lucide-react';
import { ToolItem, ToolCategory } from '../types';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  tools: ToolItem[];
  activeCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
  onSelectTool: (toolId: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  activeCategory,
  onSelectCategory,
  favorites,
  onToggleFavorite,
  onSelectTool,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const categories: { id: ToolCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Tools', icon: Grid },
    { id: 'pdf', label: 'PDF Suite', icon: FileText },
    { id: 'ai', label: 'AI Productivity', icon: Wand2 },
    { id: 'image', label: 'Image Tools', icon: ImageIcon },
    { id: 'converter', label: 'Converters', icon: RefreshCw },
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorites = !showFavoritesOnly || favorites.includes(tool.id);

    return matchesCategory && matchesSearch && matchesFavorites;
  });

  return (
    <section className="py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0A0A10]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Favorite Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search PDF & AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                showFavoritesOnly
                  ? 'bg-amber-950/60 border-amber-800/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-[#0A0A10]/90 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Favorites</span>
            </button>
          </div>
        </div>

        {/* Tools Cards Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectTool={onSelectTool}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No tools found matching your search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing search terms or changing categories.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setShowFavoritesOnly(false);
                onSelectCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl hover:bg-indigo-100"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
