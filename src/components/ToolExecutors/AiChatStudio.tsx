import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Loader2,
  Zap,
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';
import { aiService } from '../../services/aiService';

interface AiChatStudioProps {
  user?: UserProfile;
  onBack: () => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export const AiChatStudio: React.FC<AiChatStudioProps> = ({
  user,
  onBack,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I am your AI Success Hub Copilot. How can I assist you with document summaries, writing, code, or workflow automation today?",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptTemplates = [
    'Summarize key obligations in a commercial contract',
    'Draft a high-converting cold email for B2B prospects',
    'Explain complex financial metrics in plain terms',
    'Write a 5-step strategy to boost document security',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    // Validate remaining monthly/daily request credits using aiService before calling model
    const limitCheck = aiService.checkLimits(user);
    if (!limitCheck.allowed) {
      const reason = limitCheck.reason === 'ai_monthly' ? 'ai_monthly' : 'ai_daily';
      if (onTriggerUsageLimit) onTriggerUsageLimit(reason);
      const limitMsg: ChatMessage = {
        id: `limit-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ ${limitCheck.message || 'Request limit reached for your plan.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, limitMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendChatMessage({
        user,
        messages: [...messages, userMsg].map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text,
        })),
        systemInstruction: "You are the AI Success Hub Assistant. Be helpful, concise, professional, and clear.",
      });

      if (!response.success) {
        if (response.reason === 'ai_daily' || response.reason === 'ai_monthly') {
          if (onTriggerUsageLimit) onTriggerUsageLimit(response.reason);
        }
        const limitMsg: ChatMessage = {
          id: `limit-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ ${response.error || 'Request failed due to usage limit or server error.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, limitMsg]);
        return;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.data?.result || "I couldn't process your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      if (onIncrementAiUsage) onIncrementAiUsage();
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, an error occurred: ${err.message || 'Failed to communicate with Gemini API.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Tools</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[680px]">
        
        {/* Chat Top Bar */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Chat Copilot</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded">
                  Active
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Powered by Gemini 3.6 Flash
              </div>
            </div>
          </div>

          <button
            onClick={() => setMessages([])}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600'
                    : 'bg-purple-600'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] opacity-60 pt-1 border-t border-black/10 dark:border-white/10">
                  <span>{m.timestamp}</span>
                  <button
                    onClick={() => copyText(m.id, m.text)}
                    className="hover:opacity-100 transition-opacity"
                  >
                    {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Templates */}
        <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {promptTemplates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => handleSend(tpl)}
              className="px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap transition-colors"
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
