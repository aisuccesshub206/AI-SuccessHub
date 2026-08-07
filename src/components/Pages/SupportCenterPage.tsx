import React, { useState } from 'react';
import { SupportTicket, FAQItem } from '../../types';
import { INITIAL_SUPPORT_TICKETS, INITIAL_FAQS } from '../../data/v2Data';
import {
  HelpCircle,
  MessageSquare,
  Bot,
  Plus,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface SupportCenterPageProps {
  tickets?: SupportTicket[];
  faqs?: FAQItem[];
  onCreateTicket?: (subject: string, category: string, initialMessage: string) => void;
  onAddMessageToTicket?: (ticketId: string, text: string) => void;
}

export const SupportCenterPage: React.FC<SupportCenterPageProps> = ({
  tickets = INITIAL_SUPPORT_TICKETS,
  faqs = INITIAL_FAQS,
  onCreateTicket,
  onAddMessageToTicket,
}) => {
  const safeTickets = tickets && tickets.length > 0 ? tickets : INITIAL_SUPPORT_TICKETS;
  const safeFaqs = faqs || INITIAL_FAQS;

  const [activeTab, setActiveTab] = useState<'ai_bot' | 'tickets' | 'faqs'>('ai_bot');
  const [selectedTicketId, setSelectedTicketId] = useState<string>(safeTickets[0]?.id || '');
  const [replyInput, setReplyInput] = useState('');
  const [faqSearch, setFaqSearch] = useState('');

  // Ticket Modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');
  const [catInput, setCatInput] = useState('Technical Issue');
  const [msgInput, setMsgInput] = useState('');

  // Live AI Bot Chat
  const [botChatHistory, setBotChatHistory] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    {
      sender: 'bot',
      text: 'Hello Sarah! I am your 24/7 AI Support Agent. How can I assist you with PDF tools, API integration, or workspace setup today?',
    },
  ]);
  const [botInput, setBotInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  const selectedTicket = safeTickets.find((t) => t.id === selectedTicketId) || safeTickets[0];

  const handleBotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botInput.trim() || isBotThinking) return;

    const query = botInput;
    setBotChatHistory((prev) => [...prev, { sender: 'user', text: query }]);
    setBotInput('');
    setIsBotThinking(true);

    setTimeout(() => {
      let botAns = "I'm happy to help! ";
      if (query.toLowerCase().includes('api') || query.toLowerCase().includes('key')) {
        botAns += 'To manage or generate API Keys, visit the Developer API Platform tab where you can test cURL endpoints live.';
      } else if (query.toLowerCase().includes('pdf') || query.toLowerCase().includes('limit')) {
        botAns += 'Free tier supports PDF merging/splitting up to 100MB. Pro tier raises limits to 500MB with batch execution.';
      } else if (query.toLowerCase().includes('team') || query.toLowerCase().includes('invite')) {
        botAns += 'You can invite colleagues and assign Admin/Editor roles in the Team & Enterprise tab.';
      } else {
        botAns += 'Our automated Vision OCR and document processing engine operates with 99.9% uptime. If you need dedicated human support, click "Submit Support Ticket".';
      }

      setBotChatHistory((prev) => [...prev, { sender: 'bot', text: botAns }]);
      setIsBotThinking(false);
    }, 700);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedTicket) return;
    if (onAddMessageToTicket) {
      onAddMessageToTicket(selectedTicket.id, replyInput);
    }
    setReplyInput('');
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectInput.trim() || !msgInput.trim()) return;
    if (onCreateTicket) {
      onCreateTicket(subjectInput, catInput, msgInput);
    }
    setSubjectInput('');
    setMsgInput('');
    setShowTicketModal(false);
    setActiveTab('tickets');
  };

  const filteredFaqs = safeFaqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            24/7 AI Support & Helpdesk V2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How Can We Help You Today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Chat with our instant AI support chatbot, search our knowledge base, or submit a support ticket to our human team.
          </p>
        </div>

        <button
          onClick={() => setShowTicketModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('ai_bot')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'ai_bot'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>Instant AI Chatbot</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'tickets'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>My Support Tickets ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === 'faqs'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>FAQ Knowledge Base</span>
        </button>
      </div>

      {/* TAB 1: AI Support Chatbot */}
      {activeTab === 'ai_bot' && (
        <div className="p-6 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold text-white">AI Support Copilot</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 Live
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {botChatHistory.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-md ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white/5 border border-white/10 text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isBotThinking && (
              <div className="text-xs text-indigo-400 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI searching solution database...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleBotSubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ask a question about your account or tools..."
              value={botInput}
              onChange={(e) => setBotInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isBotThinking}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Support Tickets Thread */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 p-5 bg-[#07070e]/80 backdrop-blur-xl border border-white/10 rounded-2xl space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tickets ({tickets.length})
            </div>

            <div className="space-y-2">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{t.subject}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {t.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-2">
                      <span>{t.id}</span>
                      <span>Updated {t.lastUpdate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 p-6 bg-[#0A0A10]/90 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
            {selectedTicket ? (
              <>
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400">ID: {selectedTicket.id} • Category: {selectedTicket.category}</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {selectedTicket.status}
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedTicket.messages.map((m, idx) => (
                    <div key={idx} className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-indigo-300 font-bold">
                        <span>{m.name}</span>
                        <span className="text-slate-500 font-normal">{m.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleReplySubmit} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type your reply to the support team..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button type="submit" className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl">
                    Reply
                  </button>
                </form>
              </>
            ) : (
              <div className="text-xs text-slate-400 text-center py-10">No ticket selected</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FAQ Knowledge Base */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search FAQ topics..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#07070e] border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="p-5 bg-[#07070e]/80 border border-white/10 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-indigo-400">{faq.category}</div>
                <h4 className="text-sm font-bold text-white">{faq.question}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreateTicketSubmit} className="bg-[#0A0A10] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                Submit Support Ticket
              </h3>
              <button type="button" onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue or question..."
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Category</label>
                <select
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#07070e] border border-white/10 rounded-xl text-white"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Billing & Pricing">Billing & Pricing</option>
                  <option value="API Platform">API Platform</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Message Detail</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your issue in detail..."
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowTicketModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md">
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
