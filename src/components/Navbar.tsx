import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  FileText,
  Wand2,
  Image as ImageIcon,
  RefreshCw,
  Sun,
  Moon,
  User,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Crown,
  Command,
  Menu,
  X,
  Zap,
  Bell,
  Database,
  Code2,
  ShoppingBag,
  DollarSign,
  Users,
  HelpCircle,
  Smartphone,
  HardDrive,
  Globe,
} from 'lucide-react';
import { UserProfile, ToolCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  user: UserProfile;
  activeCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  onOpenAuth: () => void;
  onOpenPricing: () => void;
  onOpenSubscriptionManagement?: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onNavigatePage: (page: string) => void;
  currentPage: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeCategory,
  onSelectCategory,
  onOpenAuth,
  onOpenPricing,
  onOpenSubscriptionManagement,
  onOpenDashboard,
  onOpenAdmin,
  onOpenCommandPalette,
  onOpenNotifications,
  unreadNotificationsCount,
  onNavigatePage,
  currentPage,
  darkMode,
  onToggleDarkMode,
}) => {
  const { language, setLanguage, languages } = useLanguage();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [v2MenuOpen, setV2MenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#050508]/80 border-b border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigatePage('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
                AI Success<span className="text-indigo-400">Hub</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 ml-2 bg-indigo-950/80 text-indigo-300 rounded-md border border-indigo-800/60 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                v2.6 SaaS
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => {
                onNavigatePage('home');
                onSelectCategory('all');
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'home' && activeCategory === 'all'
                  ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-800/40 font-semibold shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              All Tools
            </button>

            {/* V2 SaaS Ecosystem Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setV2MenuOpen(true)}
              onMouseLeave={() => setV2MenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 hover:bg-indigo-900/50`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI V2 Ecosystem</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${v2MenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {v2MenuOpen && (
                <div className="absolute top-full left-0 w-[520px] p-4 bg-[#0A0A10]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <button
                    onClick={() => {
                      onNavigatePage('automation');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">AI Automation Builder</div>
                      <div className="text-[11px] text-slate-400">Drag & drop AI agents</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('knowledge-base');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">AI Knowledge Base</div>
                      <div className="text-[11px] text-slate-400">Document chat & search</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('api-platform');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Developer API</div>
                      <div className="text-[11px] text-slate-400">API keys & usage stats</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('marketplace');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Prompt Marketplace</div>
                      <div className="text-[11px] text-slate-400">Templates & workflows</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('affiliate');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Affiliate Program</div>
                      <div className="text-[11px] text-slate-400">Earn 30% payouts</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('file-pipeline');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">File Engine & Storage</div>
                      <div className="text-[11px] text-slate-400">R2/S3 PDF & Media Pipeline</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('team-workspace');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Team Workspaces</div>
                      <div className="text-[11px] text-slate-400">Roles & shared files</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('support-center');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">AI Support & Tickets</div>
                      <div className="text-[11px] text-slate-400">24/7 AI help bot</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('mobile-hub');
                      setV2MenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-950 text-cyan-300 border border-indigo-800">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Mobile App Hub</div>
                      <div className="text-[11px] text-slate-400">Push & Mobile SDKs</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Mega Menu Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  megaMenuOpen ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-800/40' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {megaMenuOpen && (
                <div className="absolute top-full left-0 w-[480px] p-4 bg-[#0A0A10]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <button
                    onClick={() => {
                      onNavigatePage('home');
                      onSelectCategory('pdf');
                      setMegaMenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-red-950 border border-red-800 text-red-400 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">PDF Suite</div>
                      <div className="text-xs text-slate-400">Merge, split, compress, protect & sign PDFs</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('home');
                      onSelectCategory('ai');
                      setMegaMenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 group-hover:scale-105 transition-transform">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">AI Productivity</div>
                      <div className="text-xs text-slate-400">Copilot, summarizer, writer & resume builder</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('home');
                      onSelectCategory('image');
                      setMegaMenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Image Tools</div>
                      <div className="text-xs text-slate-400">Compress, resize, convert & watermark</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigatePage('home');
                      onSelectCategory('converter');
                      setMegaMenuOpen(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-105 transition-transform">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">File Converters</div>
                      <div className="text-xs text-slate-400">Docs, text & image file format conversion</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigatePage('pricing')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'pricing'
                  ? 'text-indigo-400 bg-indigo-950/50 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Pricing
            </button>

            <button
              onClick={() => onNavigatePage('blog')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'blog'
                  ? 'text-indigo-400 bg-indigo-950/50 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Blog
            </button>

            <button
              onClick={() => onNavigatePage('api-docs')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'api-docs'
                  ? 'text-indigo-400 bg-indigo-950/50 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              API Docs
            </button>
          </nav>

          {/* Search Trigger & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Cmd + K Button */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search tools...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-black/60 text-slate-400 rounded border border-white/10 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-black" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 p-2 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition-colors"
                title="Select Language"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className="font-bold uppercase tracking-wider text-[11px]">{languages.find(l => l.code === language)?.flag} {language.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 p-1.5 bg-[#0A0A10] rounded-2xl shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${
                        language === lang.code
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {language === lang.code && <span className="text-[10px] font-bold uppercase text-indigo-200">Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Upgrade CTA Button */}
            {user.plan === 'Free' && (
              <button
                onClick={onOpenPricing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 rounded-lg shadow-sm transition-all shadow-amber-500/20"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Upgrade Pro</span>
              </button>
            )}

            {/* User Account / Auth Button */}
            {user.id ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2 hover:bg-white/5 rounded-xl border border-white/10 transition-colors"
                >
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30" />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-200">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 p-2 bg-[#0A0A10] rounded-2xl shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-white/10 mb-1">
                      <div className="font-semibold text-sm text-white">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-300 bg-indigo-950/80 rounded-md border border-indigo-800/60">
                        <Zap className="w-3 h-3 text-indigo-400" />
                        <span>{user.plan} Plan</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onOpenDashboard();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 rounded-lg text-left transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      <span>User Dashboard</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onOpenAdmin();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-950/50 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Admin Console</span>
                        </div>
                        <span className="text-[9px] font-bold bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-1.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onOpenSubscriptionManagement) {
                          onOpenSubscriptionManagement();
                        } else {
                          onOpenPricing();
                        }
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-950/40 rounded-lg text-left transition-colors"
                    >
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>Manage Usage &amp; Limits</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenPricing();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 rounded-lg text-left transition-colors"
                    >
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span>Billing &amp; Store Plans</span>
                    </button>

                    <div className="pt-1 mt-1 border-t border-white/10">
                      <button
                        onClick={onOpenAuth}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg text-left transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Sign Out / Switch</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors shadow-indigo-600/20"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:bg-white/5 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 bg-[#0A0A10] border-b border-white/10 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onNavigatePage('home');
              onSelectCategory('all');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-200 hover:bg-white/5"
          >
            All Tools
          </button>
          <button
            onClick={() => {
              onNavigatePage('automation');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-indigo-300 hover:bg-white/5 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            AI Automation Platform
          </button>
          <button
            onClick={() => {
              onNavigatePage('knowledge-base');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-cyan-300 hover:bg-white/5 flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            AI Knowledge Base
          </button>
          <button
            onClick={() => {
              onNavigatePage('api-platform');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-emerald-300 hover:bg-white/5 flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            Developer API Platform
          </button>
          <button
            onClick={() => {
              onNavigatePage('marketplace');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-purple-300 hover:bg-white/5 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            Prompt & Template Marketplace
          </button>
        </div>
      )}
    </header>
  );
};

