import React, { useState } from 'react';
import { CoverLetterData } from '../../types/coverLetter';
import { UserProfile } from '../../types';
import { aiService } from '../../services/aiService';
import {
  Sparkles,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  FileText,
  Wand2,
  Loader2,
  RefreshCw,
  Check,
} from 'lucide-react';

interface CoverLetterFormProps {
  data: CoverLetterData;
  user?: UserProfile;
  onChange: (updated: CoverLetterData) => void;
  onIncrementAiUsage?: () => void;
  onTriggerUsageLimit?: (reason: 'ai_daily' | 'ai_monthly') => void;
}

export const CoverLetterForm: React.FC<CoverLetterFormProps> = ({
  data,
  user,
  onChange,
  onIncrementAiUsage,
  onTriggerUsageLimit,
}) => {
  const { personalInfo, recipientInfo, letterContent } = data;

  // AI Generator local state
  const [targetJobTitle, setTargetJobTitle] = useState(personalInfo.jobTitle || 'Senior Full-Stack Engineer');
  const [targetCompany, setTargetCompany] = useState(recipientInfo.companyName || 'Google Cloud');
  const [keySkills, setKeySkills] = useState('React, TypeScript, Node.js, Cloud Run, UI/UX Design, Leadership');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional & Confident');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  const updatePersonal = (fields: Partial<typeof personalInfo>) => {
    onChange({
      ...data,
      personalInfo: { ...personalInfo, ...fields },
    });
  };

  const updateRecipient = (fields: Partial<typeof recipientInfo>) => {
    onChange({
      ...data,
      recipientInfo: { ...recipientInfo, ...fields },
    });
  };

  const updateContent = (fields: Partial<typeof letterContent>) => {
    onChange({
      ...data,
      letterContent: { ...letterContent, ...fields },
    });
  };

  const handleAiGenerate = async () => {
    const limitCheck = aiService.checkLimits(user);
    if (!limitCheck.allowed) {
      if (onTriggerUsageLimit) {
        onTriggerUsageLimit(limitCheck.reason === 'ai_monthly' ? 'ai_monthly' : 'ai_daily');
      }
      return;
    }

    setGeneratingAi(true);
    setAiSuccessMessage('');

    try {
      const prompt = `Write a high-converting, professional cover letter tailored for the position of "${targetJobTitle}" at "${targetCompany}".
User Name: ${personalInfo.fullName || 'Applicant'}
Applicant Key Skills & Experience: ${keySkills}
Job Description / Requirements: ${jobDescription || 'Standard requirements for ' + targetJobTitle}
Tone: ${tone}

Please format the cover letter with paragraphs that highlight relevant accomplishments, enthusiasm for ${targetCompany}, and a polite call to action. Do not include markdown code block syntax.`;

      const response = await aiService.generateText({
        user,
        toolType: 'cover-letter',
        prompt,
        tone,
      });

      if (response.success && response.data?.result) {
        if (onIncrementAiUsage) onIncrementAiUsage();

        // Update form with AI generated content
        onChange({
          ...data,
          personalInfo: {
            ...personalInfo,
            jobTitle: targetJobTitle,
          },
          recipientInfo: {
            ...recipientInfo,
            companyName: targetCompany,
          },
          letterContent: {
            ...letterContent,
            subject: `Application for ${targetJobTitle} Position`,
            body: response.data.result.trim(),
          },
        });

        setAiSuccessMessage('Cover letter generated & populated successfully!');
        setTimeout(() => setAiSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error generating cover letter:', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* 1. AI Quick Writer Assistant */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">AI Cover Letter Generator</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">Generate a tailored cover letter in seconds using Gemini AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Job Title *</label>
            <input
              type="text"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Google Cloud"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Skills & Accomplishments</label>
          <input
            type="text"
            value={keySkills}
            onChange={(e) => setKeySkills(e.target.value)}
            placeholder="e.g. React, Node.js, 6+ years experience, reduced latency by 40%"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tone of Voice</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Professional & Confident">Professional & Confident</option>
            <option value="Enthusiastic & Passionate">Enthusiastic & Passionate</option>
            <option value="Executive & Authoritative">Executive & Authoritative</option>
            <option value="Creative & Bold">Creative & Bold</option>
            <option value="Concise & Direct">Concise & Direct</option>
          </select>
        </div>

        <button
          onClick={handleAiGenerate}
          disabled={generatingAi}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {generatingAi ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Writing your Cover Letter with AI...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Cover Letter with AI
            </>
          )}
        </button>

        {aiSuccessMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {aiSuccessMessage}
          </div>
        )}
      </div>

      {/* 2. Personal Contact Information */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          Personal Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={personalInfo.fullName}
              onChange={(e) => updatePersonal({ fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Job Title</label>
            <input
              type="text"
              value={personalInfo.jobTitle}
              onChange={(e) => updatePersonal({ jobTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) => updatePersonal({ email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
            <input
              type="text"
              value={personalInfo.phone}
              onChange={(e) => updatePersonal({ phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Location</label>
            <input
              type="text"
              value={personalInfo.location}
              onChange={(e) => updatePersonal({ location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={personalInfo.linkedin}
              onChange={(e) => updatePersonal({ linkedin: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Website / Portfolio</label>
            <input
              type="text"
              value={personalInfo.website}
              onChange={(e) => updatePersonal({ website: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Recipient Details */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-500" />
          Employer & Recipient Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
            <input
              type="text"
              value={recipientInfo.date}
              onChange={(e) => updateRecipient({ date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Hiring Manager Name</label>
            <input
              type="text"
              value={recipientInfo.hiringManager}
              onChange={(e) => updateRecipient({ hiringManager: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Hiring Manager Title</label>
            <input
              type="text"
              value={recipientInfo.hiringManagerTitle}
              onChange={(e) => updateRecipient({ hiringManagerTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Company Name</label>
            <input
              type="text"
              value={recipientInfo.companyName}
              onChange={(e) => updateRecipient({ companyName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Company Address</label>
            <input
              type="text"
              value={recipientInfo.companyAddress}
              onChange={(e) => updateRecipient({ companyAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Cover Letter Content & Signature */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          Letter Content & Body Text
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject Line / Re:</label>
            <input
              type="text"
              value={letterContent.subject}
              onChange={(e) => updateContent({ subject: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Salutation</label>
            <input
              type="text"
              value={letterContent.salutation}
              onChange={(e) => updateContent({ salutation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cover Letter Body Paragraphs</label>
            <textarea
              rows={12}
              value={letterContent.body}
              onChange={(e) => updateContent({ body: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs font-sans leading-relaxed focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Sign-Off</label>
              <input
                type="text"
                value={letterContent.signOff}
                onChange={(e) => updateContent({ signOff: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Signature Name</label>
              <input
                type="text"
                value={letterContent.signatureName}
                onChange={(e) => updateContent({ signatureName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
