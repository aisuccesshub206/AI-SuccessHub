import React, { useState } from 'react';
import { MarketplaceItem, MarketplaceCategory } from '../../types';
import {
  ShoppingBag,
  Search,
  Star,
  Plus,
  Tag,
  Download,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Share2,
} from 'lucide-react';

import { INITIAL_MARKETPLACE_ITEMS } from '../../data/v2Data';

interface MarketplacePageProps {
  items?: MarketplaceItem[];
  onAddItem?: (item: MarketplaceItem) => void;
}

const CATEGORIES: MarketplaceCategory[] = [
  'Business Templates',
  'Marketing Templates',
  'Resume Templates',
  'AI Prompts',
  'Social Media Templates',
  'PDF Templates',
];

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  items = INITIAL_MARKETPLACE_ITEMS,
  onAddItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<MarketplaceItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  // Form states
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [priceInput, setPriceInput] = useState('15');
  const [catInput, setCatInput] = useState<MarketplaceCategory>('Business Templates');

  const safeItems = items || INITIAL_MARKETPLACE_ITEMS;
  const filteredItems = safeItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newItem: MarketplaceItem = {
      id: `mp-${Date.now()}`,
      title: titleInput,
      description: descInput,
      priceUSD: parseFloat(priceInput) || 0,
      category: catInput,
      authorName: 'Sarah Jenkins',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      rating: 5.0,
      salesCount: 1,
      previewImageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
      tags: ['New', catInput.split(' ')[0]],
      isFeatured: true,
    };

    if (onAddItem) {
      onAddItem(newItem);
    }
    setShowUploadModal(false);
    setTitleInput('');
    setDescInput('');
  };

  const handlePurchase = (item: MarketplaceItem) => {
    setPurchasedIds((prev) => [...prev, item.id]);
    alert(`Success! You have unlocked "${item.title}". It has been added to your Workspace templates.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
            Template & Prompt Marketplace V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Buy, Sell & Monetize AI Workflows & PDF Kits
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Discover thousands of high-converting business templates, viral social media carousels, resume packs, and AI prompt suites.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Sell a Template / Prompt</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-[#07070e]/80 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-[#07070e]/80 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates & prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#07070e]/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Marketplace Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const isPurchased = purchasedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group bg-[#07070e]/80 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-indigo-500/50 overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.previewImageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-indigo-300 border border-white/10">
                    {item.category}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-indigo-600 text-white font-extrabold text-xs shadow-md">
                    {item.priceUSD === 0 ? 'FREE' : `$${item.priceUSD}`}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Author Footer */}
              <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <img src={item.authorAvatar} alt={item.authorName} className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[11px] text-slate-300 font-medium truncate max-w-[100px]">{item.authorName}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{item.rating}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({item.salesCount})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-800/60">
                {activeItem.category}
              </span>
              <button onClick={() => setActiveItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">{activeItem.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{activeItem.description}</p>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300">
                <span>Rating: <strong className="text-amber-400">{activeItem.rating} ★</strong></span>
                <span>Downloads/Sales: <strong className="text-white">{activeItem.salesCount}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-xl font-extrabold text-white">
                {activeItem.priceUSD === 0 ? 'FREE DOWNLOAD' : `$${activeItem.priceUSD}`}
              </div>

              {purchasedIds.includes(activeItem.id) ? (
                <button disabled className="px-5 py-2.5 text-xs font-bold text-emerald-300 bg-emerald-950 border border-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Unlocked in Workspace</span>
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(activeItem)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                >
                  {activeItem.priceUSD === 0 ? 'Instant Download' : `Buy Template ($${activeItem.priceUSD})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Listing Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreateListing} className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                List Template or Prompt
              </h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Legal Contract Prompt Pack"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value as MarketplaceCategory)}
                  className="w-full px-3 py-2.5 bg-[#07070e] border border-white/10 rounded-xl text-white focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Price (USD)</label>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain what buyers get..."
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md">
                Publish Listing
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
