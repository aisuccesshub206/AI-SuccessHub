import React from 'react';
import { Sparkles, Heart, Shield, Zap, Globe, Mail, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigatePage: (page: string) => void;
  onSelectCategory: (cat: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage, onSelectCategory }) => {
  return (
    <footer className="bg-[#050508]/90 backdrop-blur-xl text-slate-300 border-t border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigatePage('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                AI Success<span className="text-indigo-400">Hub</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The ultimate all-in-one PDF & AI productivity suite. Combine powerful document merging, splitting, and signing with next-gen AI content generation.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                256-bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" />
                Instant Browser Execution
              </span>
            </div>

            {/* Newsletter Input */}
            <div className="pt-4 max-w-sm">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Subscribe for AI productivity hacks & updates
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-3.5 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 flex-1 transition-colors"
                />
                <button
                  onClick={() => alert('Thank you for subscribing to AI Success Hub updates!')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">PDF Suite</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('pdf'); }} className="hover:text-white transition-colors">
                  Merge PDF Files
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('pdf'); }} className="hover:text-white transition-colors">
                  Split & Extract Pages
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('pdf'); }} className="hover:text-white transition-colors">
                  Compress PDF Size
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('pdf'); }} className="hover:text-white transition-colors">
                  Rotate & Reorder
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('pdf'); }} className="hover:text-white transition-colors">
                  Protect & Unlock PDF
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('pdf'); }} className="hover:text-white transition-colors">
                  E-Sign Documents
                </button>
              </li>
            </ul>
          </div>

          {/* AI Productivity */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">AI Productivity</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('ai'); }} className="hover:text-white transition-colors">
                  AI Chat Copilot
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('ai'); }} className="hover:text-white transition-colors">
                  AI Document Summarizer
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('ai'); }} className="hover:text-white transition-colors">
                  AI Writing Assistant
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('ai'); }} className="hover:text-white transition-colors">
                  AI Resume & CV Builder
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('ai'); }} className="hover:text-white transition-colors">
                  AI Image & Thumbnail Maker
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigatePage('home'); onSelectCategory('ai'); }} className="hover:text-white transition-colors">
                  AI Multi-Lang Translator
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigatePage('pricing')} className="hover:text-white transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('blog')} className="hover:text-white transition-colors">
                  Blog & Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('about')} className="hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('contact')} className="hover:text-white transition-colors">
                  Contact & Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-12 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AI Success Hub. All rights reserved. Crafted with precision for high-performance productivity.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Systems Operational
            </span>
            <button onClick={() => onNavigatePage('terms')} className="hover:text-slate-400">
              Security
            </button>
            <button onClick={() => onNavigatePage('privacy')} className="hover:text-slate-400">
              GDPR Compliant
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
