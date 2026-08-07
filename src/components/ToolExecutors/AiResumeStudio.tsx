import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Printer,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Check,
  Copy,
  FileText,
  Sliders,
  Eye,
  Edit3,
  Loader2,
  Flame,
  Award,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

import { UserProfile } from '../../types';
import { ResumeData, ResumeCategory } from '../../types/resume';
import { getSampleResumeData } from '../../data/resumeSampleData';
import { ResumeForm } from '../Resume/ResumeForm';
import { ResumePreview } from '../Resume/ResumePreview';
import { aiService } from '../../services/aiService';

interface AiResumeStudioProps {
  user?: UserProfile;
  onBack: () => void;
  onLogFileProcess?: (fileName: string, originalSize: number, processedSize: number, toolUsed: string) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

const LOCAL_STORAGE_KEY = 'ais_resume_builder_data_v1';

export const AiResumeStudio: React.FC<AiResumeStudioProps> = ({
  user,
  onBack,
  onLogFileProcess,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  // Resume Data State with LocalStorage fallback
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load resume data:', e);
    }
    return getSampleResumeData('Graphic Designer');
  });

  // Undo / Redo History stack
  const [historyStack, setHistoryStack] = useState<ResumeData[]>([resumeData]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Auto-save timestamp
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved just now');

  // Preview controls
  const [zoomLevel, setZoomLevel] = useState<number>(85); // % zoom
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // AI loading field tracker
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

  // Auto save to LocalStorage whenever resumeData changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resumeData));
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      // If storage quota is exceeded (e.g. large base64 image uploaded), try saving without large photo payload
      try {
        const cleanData = {
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            photoUrl: resumeData.personalInfo.photoUrl?.startsWith('data:') ? '' : resumeData.personalInfo.photoUrl,
          },
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanData));
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (innerErr) {
        // Quota still exceeded or unavailable, keep in memory without throwing noisy errors
        setLastSavedTime('Saved in session');
      }
    }
  }, [resumeData]);

  // Update resume state with history tracking
  const handleUpdateResume = (newData: ResumeData) => {
    setResumeData(newData);
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(newData);
    setHistoryStack(newStack.slice(-20)); // keep last 20 states
    setHistoryIndex(newStack.length - 1);
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setResumeData(historyStack[prevIndex]);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setResumeData(historyStack[nextIndex]);
    }
  };

  // Switch category
  const handleSelectCategory = (category: ResumeCategory) => {
    const freshSample = getSampleResumeData(category);
    handleUpdateResume(freshSample);
  };

  // Calculate Resume Completion Progress Percentage
  const calculateProgress = (): number => {
    let score = 0;
    if (resumeData.personalInfo.fullName) score += 15;
    if (resumeData.personalInfo.email) score += 10;
    if (resumeData.personalInfo.phone) score += 10;
    if (resumeData.summary) score += 20;
    if (resumeData.experiences.length > 0) score += 20;
    if (resumeData.education.length > 0) score += 15;
    if (resumeData.skills.length > 0) score += 10;
    return Math.min(100, score);
  };

  // AI Helper: Generate Summary
  const handleAiGenerateSummary = async (style: string) => {
    setAiLoadingField('summary');
    try {
      const prompt = `Write a compelling 3-4 sentence professional summary for a ${resumeData.personalInfo.jobTitle || resumeData.category} in ${style} style. Name: ${resumeData.personalInfo.fullName}. Key skills: ${resumeData.skills.map((s) => s.name).join(', ')}.`;
      const response = await aiService.generateText({
        user,
        toolType: 'resume',
        prompt,
        tone: style,
      });

      if (response.success && response.data?.result) {
        handleUpdateResume({
          ...resumeData,
          summary: response.data.result.trim(),
        });
        if (onIncrementAiUsage) onIncrementAiUsage();
      }
    } catch (err) {
      console.error('AI summary error:', err);
    } finally {
      setAiLoadingField(null);
    }
  };

  // AI Helper: Improve Experience
  const handleAiImproveExperience = async (index: number) => {
    setAiLoadingField(`exp_${index}`);
    try {
      const targetExp = resumeData.experiences[index];
      const prompt = `Rewrite and enhance these work experience bullet points into high-impact, action-verb statements with quantifiable achievements for a ${targetExp.jobTitle} at ${targetExp.company}: ${targetExp.responsibilities}`;
      const response = await aiService.generateText({
        user,
        toolType: 'resume',
        prompt,
      });

      if (response.success && response.data?.result) {
        const updatedExps = [...resumeData.experiences];
        updatedExps[index].responsibilities = response.data.result.trim();
        handleUpdateResume({
          ...resumeData,
          experiences: updatedExps,
        });
        if (onIncrementAiUsage) onIncrementAiUsage();
      }
    } catch (err) {
      console.error('AI experience error:', err);
    } finally {
      setAiLoadingField(null);
    }
  };

  // AI Helper: Skills
  const handleAiGenerateSkills = async () => {
    setAiLoadingField('skills');
    try {
      const prompt = `Provide a list of 6 essential technical and soft skills for a ${resumeData.personalInfo.jobTitle || resumeData.category}. Output only comma separated skill names.`;
      const response = await aiService.generateText({
        user,
        toolType: 'resume',
        prompt,
      });

      if (response.success && response.data?.result) {
        const skillNames = response.data.result.split(',').map((s) => s.trim()).filter(Boolean);
        const newSkills = skillNames.map((name, i) => ({
          id: `ai_s_${Date.now()}_${i}`,
          name,
          category: 'Technical Skills' as const,
          level: 4,
        }));
        handleUpdateResume({
          ...resumeData,
          skills: [...resumeData.skills, ...newSkills],
        });
        if (onIncrementAiUsage) onIncrementAiUsage();
      }
    } catch (err) {
      console.error('AI skills error:', err);
    } finally {
      setAiLoadingField(null);
    }
  };

  // EXPORT HELPERS
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const textContent = `
${resumeData.personalInfo.fullName.toUpperCase()}
${resumeData.personalInfo.jobTitle}
Email: ${resumeData.personalInfo.email} | Phone: ${resumeData.personalInfo.phone}
Location: ${resumeData.personalInfo.city}, ${resumeData.personalInfo.country}

SUMMARY
${resumeData.summary}

WORK EXPERIENCE
${resumeData.experiences
  .map(
    (e) => `
- ${e.jobTitle} at ${e.company} (${e.startDate} - ${e.currentlyWorking ? 'Present' : e.endDate})
  ${e.responsibilities}
`
  )
  .join('')}

EDUCATION
${resumeData.education
  .map((edu) => `- ${edu.degree} in ${edu.fieldOfStudy}, ${edu.institution} (${edu.startDate} - ${edu.endDate})`)
  .join('\n')}

SKILLS
${resumeData.skills.map((s) => `- ${s.name}`).join('\n')}
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.fullName.replaceAll(' ', '_')}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (onLogFileProcess) onLogFileProcess('Resume.txt', textContent.length, textContent.length, 'AI Resume Builder');
  };

  const completionPercentage = calculateProgress();

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                AI Resume & CV Builder
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                CANVA & RESUME.IO STYLE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Category: <span className="font-bold text-slate-700 dark:text-slate-200">{resumeData.category}</span> • {lastSavedTime}
            </p>
          </div>
        </div>

        {/* Action Controls (Undo, Redo, Print, Download) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:text-blue-600"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= historyStack.length - 1}
              className="p-1.5 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:text-blue-600"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Resume Completeness Score</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Screen View (Left: Form | Right: Live Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Editor (6 cols on desktop) */}
        <div className="lg:col-span-6 space-y-6">
          <ResumeForm
            data={resumeData}
            onChange={handleUpdateResume}
            onSelectCategory={handleSelectCategory}
            onAiGenerateSummary={handleAiGenerateSummary}
            onAiImproveExperience={handleAiImproveExperience}
            onAiRewriteBullets={handleAiImproveExperience}
            onAiGenerateSkills={handleAiGenerateSkills}
            onAiGenerateProjects={() => {}}
            aiLoadingField={aiLoadingField}
          />
        </div>

        {/* Right Column: Interactive Live Preview (6 cols on desktop) */}
        <div className="lg:col-span-6 space-y-4 sticky top-6">
          
          {/* Canvas Toolbar Controls */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Live Resume Canvas</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 min-w-[36px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 ml-2 border-l pl-2"
                title="Fullscreen Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Preview Container */}
          <div className="overflow-x-auto p-4 bg-slate-200/60 dark:bg-slate-950/80 rounded-3xl border border-slate-300 dark:border-slate-800 flex justify-center shadow-inner min-h-[700px]">
            <ResumePreview data={resumeData} zoomLevel={zoomLevel} />
          </div>
        </div>

      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-white">
            <div className="text-sm font-bold">Fullscreen Resume View ({resumeData.personalInfo.fullName})</div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 text-white bg-slate-800 hover:bg-slate-700 rounded-full"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
            <ResumePreview data={resumeData} zoomLevel={100} />
          </div>
        </div>
      )}

    </div>
  );
};
