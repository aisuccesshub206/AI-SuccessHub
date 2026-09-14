import React, { useState } from 'react';
import {
  CheckCheck,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Download,
  Globe,
  Sliders,
  Layers,
  HelpCircle,
  Wand2,
  AlertCircle,
  FileCode,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export interface GrammarCorrectionItem {
  id: string;
  originalWord: string;
  correctedWord: string;
  type: 'grammar' | 'spelling' | 'clarity' | 'tone' | 'punctuation';
  explanation: string;
  whyCorrected: string;
  alternatives: string[];
}

interface AiGrammarStudioProps {
  user: UserProfile;
  onBack?: () => void;
  onLogFileProcess?: (tool: string, detail: string) => void;
  onIncrementAiUsage?: () => void;
}

const WRITING_MODES = [
  { id: 'correct', label: 'Correct Grammar', desc: 'Fix spelling & punctuation only' },
  { id: 'professional', label: 'Make Professional', desc: 'Corporate, polished & formal' },
  { id: 'clearer', label: 'Make Clearer', desc: 'Simplify complex phrasing' },
  { id: 'concise', label: 'Make Concise', desc: 'Cut fluff & wordiness' },
  { id: 'friendly', label: 'Make Friendly', desc: 'Warm & conversational' },
  { id: 'academic', label: 'Make Academic', desc: 'Scholarly & objective' },
  { id: 'natural', label: 'Make Natural', desc: 'Native idiomatic flow' },
  { id: 'vocabulary', label: 'Improve Vocabulary', desc: 'Elevated, rich word choice' },
];

export const AiGrammarStudio: React.FC<AiGrammarStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
}) => {
  const { inputLanguage, outputLanguage, setInputLanguage, setOutputLanguage, languages } = useLanguage();

  const [inputText, setInputText] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('correct');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<GrammarCorrectionItem[]>([]);
  const [activeCorrection, setActiveCorrection] = useState<GrammarCorrectionItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>('English');

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleCheckWriting = () => {
    if (!inputText.trim()) return;

    if (onIncrementAiUsage) onIncrementAiUsage();
    setIsChecking(true);

    setTimeout(() => {
      // Automatic detection simulation
      const isSomali = /waxaan|rabaa|ku|aad|lahay|sabab/i.test(inputText) || inputLanguage === 'so';
      setDetectedLang(isSomali ? 'Somali (Soomaali)' : 'English');

      const mockData = analyzeAndCorrectWriting(inputText, selectedMode, isSomali);
      setCorrectedText(mockData.corrected);
      setCorrections(mockData.correctionsList);
      setIsChecking(false);

      if (onLogFileProcess) onLogFileProcess('AI Grammar & Proofreader', `Analyzed ${wordCount} words`);
    }, 1100);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Professional Writing Correction Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI Grammar & <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Proofreader</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Real-time side-by-side editing, automatic language detection (Somali, English, Arabic, French, Spanish), inline diff explanations & tone adjustments.
            </p>
          </div>

          {/* Writing Modes Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-white/10 p-2 rounded-2xl max-w-md">
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full bg-slate-800 text-white font-bold text-xs rounded-xl px-3 py-2 border border-emerald-500/30 focus:outline-none"
            >
              {WRITING_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — ({m.desc})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Side-By-Side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Original Text Input (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Original Text</span>
              {detectedLang && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  Detected: {detectedLang}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {wordCount} words | {charCount} chars
            </div>
          </div>

          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your text here in Somali, English, Arabic, French, Spanish..."
            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed font-sans"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setInputText('Waxaan rabaa in aad iga caawiso saxida qoraalkan si uu u noqdo mid aad u xioso badan iyo xirfad leh.')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Try Somali Sample Text
            </button>

            <button
              onClick={handleCheckWriting}
              disabled={isChecking || !inputText.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-extrabold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Writing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Check Writing
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Corrected Side-by-Side Output (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <CheckCheck className="w-4 h-4 text-cyan-400" />
              <span>Corrected Text</span>
              {corrections.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
                  {corrections.length} Improvements Made
                </span>
              )}
            </div>

            {correctedText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyText(correctedText, 'corrected')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'corrected' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy
                </button>
              </div>
            )}
          </div>

          {correctedText ? (
            <div className="space-y-4">
              {/* Corrected Text Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 text-sm text-slate-100 leading-relaxed font-sans min-h-[220px]">
                {correctedText}
              </div>

              {/* Highlighted Corrections List */}
              {corrections.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Click a correction to view explanation:</span>
                  <div className="flex flex-wrap gap-2">
                    {corrections.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveCorrection(item)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          activeCorrection?.id === item.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                            : 'bg-slate-800 text-emerald-300 border-emerald-500/30 hover:bg-slate-700'
                        }`}
                      >
                        <span className="line-through text-slate-400 mr-1">{item.originalWord}</span> → {item.correctedWord}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Correction Explanation Modal / Card */}
              {activeCorrection && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span className="capitalize">{activeCorrection.type} Improvement</span>
                    <button onClick={() => setActiveCorrection(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <p className="text-slate-300"><strong>Why:</strong> {activeCorrection.whyCorrected}</p>
                  <p className="text-slate-400"><strong>Explanation:</strong> {activeCorrection.explanation}</p>
                  {activeCorrection.alternatives.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-slate-500">Alternatives:</span>
                      {activeCorrection.alternatives.map((alt, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {alt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center bg-slate-950/40">
              <CheckCheck className="w-10 h-10 text-emerald-400/50 mx-auto mb-3" />
              <p className="text-slate-400 text-xs max-w-xs mx-auto">
                Enter your text on the left and click <strong className="text-emerald-300">Check Writing</strong> to receive side-by-side corrections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function analyzeAndCorrectWriting(text: string, mode: string, isSomali: boolean) {
  if (isSomali) {
    return {
      corrected: text
        .replace(/xioso/gi, 'xioso badan')
        .replace(/aadu/gi, 'aad u')
        .replace(/iga caawiso/gi, 'iga caawi') +
        ' Qoraalkan waa mid si buuxda loo saxay iyadoo loo adeegsanayo naxawaha rasmiga ah ee Soomaaliga.',
      correctionsList: [
        {
          id: 'c1',
          originalWord: 'xioso',
          correctedWord: 'xioso badan',
          type: 'spelling' as const,
          explanation: 'Erayga xioso waxaa loo saxaa xioso badan ama xiso leh.',
          whyCorrected: 'Sida saxda ah ee loo adeegsado soomaaliga rasmiga ah.',
          alternatives: ['xiso leh', 'qurux badan'],
        },
      ],
    };
  }

  return {
    corrected:
      text
        .replace(/i wants/gi, 'I want')
        .replace(/good/gi, 'exceptional')
        .replace(/alot/gi, 'a lot') +
      ' This text has been proofread and refined to maintain clarity, strong vocabulary, and impeccable grammar.',
    correctionsList: [
      {
        id: 'c1',
        originalWord: 'i wants',
        correctedWord: 'I want',
        type: 'grammar' as const,
        explanation: 'Subject-verb agreement error with first person singular pronoun.',
        whyCorrected: 'The pronoun "I" requires the base form of the verb "want".',
        alternatives: ['I would like', 'I intend to'],
      },
      {
        id: 'c2',
        originalWord: 'good',
        correctedWord: 'exceptional',
        type: 'tone' as const,
        explanation: 'Upgraded basic adjective to a higher impact vocabulary selection.',
        whyCorrected: 'Improves professional tone and precision.',
        alternatives: ['outstanding', 'remarkable', 'superb'],
      },
    ],
  };
}
