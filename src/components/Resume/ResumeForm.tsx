import React, { useState, useRef } from 'react';
import {
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  UserCheck,
  Palette,
  Camera,
  Upload,
  Trash2,
  Plus,
  RefreshCw,
  Layout,
  Type,
  Check,
  ChevronDown,
  ChevronUp,
  Wand2,
  HelpCircle,
  FileText,
  Sliders,
  Crop,
  X,
  Layers,
} from 'lucide-react';
import {
  ResumeCategory,
  ResumeData,
  ResumeTemplateId,
  FontChoice,
  FontSizeChoice,
  LayoutType,
  ExperienceItem,
  EducationItem,
  SkillItem,
  CertificateItem,
  ProjectItem,
  LanguageItem,
  ReferenceItem,
} from '../../types/resume';
import { ALL_RESUME_CATEGORIES } from '../../data/resumeSampleData';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  onSelectCategory: (category: ResumeCategory) => void;
  onAiGenerateSummary: (style: string) => void;
  onAiImproveExperience: (index: number) => void;
  onAiRewriteBullets: (index: number) => void;
  onAiGenerateSkills: () => void;
  onAiGenerateProjects: () => void;
  aiLoadingField: string | null;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  data,
  onChange,
  onSelectCategory,
  onAiGenerateSummary,
  onAiImproveExperience,
  onAiRewriteBullets,
  onAiGenerateSkills,
  onAiGenerateProjects,
  aiLoadingField,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'category'
    | 'photo'
    | 'personal'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'certificates'
    | 'projects'
    | 'languages'
    | 'references'
    | 'design'
  >('personal');

  const [searchCategory, setSearchCategory] = useState('');
  const [summaryStyle, setSummaryStyle] = useState<string>('Professional');
  
  // Webcam capture state
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Gallery Avatars
  const galleryAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  ];

  // Colors presets
  const colorPresets = [
    { name: 'Indigo Blue', hex: '#2563eb' },
    { name: 'Emerald Green', hex: '#059669' },
    { name: 'Deep Violet', hex: '#7c3aed' },
    { name: 'Rose Red', hex: '#e11d48' },
    { name: 'Slate Gray', hex: '#475569' },
    { name: 'Midnight Dark', hex: '#0f172a' },
    { name: 'Teal Cyan', hex: '#0891b2' },
    { name: 'Warm Amber', hex: '#d97706' },
  ];

  // Helper updates
  const updatePersonalInfo = (field: string, value: any) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value },
    });
  };

  const updateDesign = (field: string, value: any) => {
    onChange({
      ...data,
      design: { ...data.design, [field]: value },
    });
  };

  // Profile Photo Helpers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    try {
      setShowWebcamModal(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied or unavailable on your device.');
      setShowWebcamModal(false);
    }
  };

  const captureWebcamPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        updatePersonalInfo('photoUrl', dataUrl);
      }
    }
    stopWebcam();
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setShowWebcamModal(false);
  };

  // Form tab definitions
  const formSteps = [
    { id: 'category', label: '1. Target Role', icon: Briefcase },
    { id: 'photo', label: '2. Profile Photo', icon: Camera },
    { id: 'personal', label: '3. Personal Info', icon: User },
    { id: 'summary', label: '4. Summary', icon: Sparkles },
    { id: 'experience', label: '5. Work Experience', icon: Briefcase },
    { id: 'education', label: '6. Education', icon: GraduationCap },
    { id: 'skills', label: '7. Skills', icon: Award },
    { id: 'certificates', label: '8. Certificates', icon: Award },
    { id: 'projects', label: '9. Projects', icon: Code },
    { id: 'languages', label: '10. Languages', icon: Languages },
    { id: 'references', label: '11. References', icon: UserCheck },
    { id: 'design', label: '12. Design & Styling', icon: Palette },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Horizontal Step Navigation Bar */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 p-2 gap-1 scrollbar-none bg-slate-50 dark:bg-slate-950">
        {formSteps.map((step) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveTab(step.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6 space-y-6">

        {/* STEP 1: CATEGORY SELECTION */}
        {activeTab === 'category' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Choose Job Category & Load Sample Content
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your target job title to instantly load pre-written professional bullet points and formatting.
                </p>
              </div>
              <input
                type="text"
                placeholder="Search 32 categories..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {ALL_RESUME_CATEGORIES.filter((c) =>
                c.id.toLowerCase().includes(searchCategory.toLowerCase())
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setActiveTab('personal');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 group ${
                    data.category === cat.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{cat.id}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{cat.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE PHOTO */}
        {activeTab === 'photo' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Profile Photo Management</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a professional headshot or choose an AI portrait avatar.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={data.design.showPhoto}
                  onChange={(e) => updateDesign('showPhoto', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Photo on Resume</span>
              </label>
            </div>

            {/* Photo Preview & Shape selector */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="relative">
                {data.personalInfo.photoUrl ? (
                  <img
                    src={data.personalInfo.photoUrl}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className={`w-32 h-32 object-cover border-4 border-blue-600 shadow-xl ${
                      data.personalInfo.photoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-32 h-32 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 border-4 border-dashed border-slate-300 dark:border-slate-600 ${
                      data.personalInfo.photoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    }`}
                  >
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Photo Frame Shape:
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePersonalInfo('photoShape', 'circle')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      data.personalInfo.photoShape === 'circle'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Circle Frame
                  </button>
                  <button
                    onClick={() => updatePersonalInfo('photoShape', 'square')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      data.personalInfo.photoShape === 'square'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Rounded Square
                  </button>
                </div>

                {/* Photo Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    onClick={startWebcam}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo</span>
                  </button>

                  {data.personalInfo.photoUrl && (
                    <button
                      onClick={() => updatePersonalInfo('photoUrl', '')}
                      className="px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Avatars */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Or choose from sample professional portraits:
              </span>
              <div className="flex items-center gap-3">
                {galleryAvatars.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => updatePersonalInfo('photoUrl', url)}
                    className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-600 transition-all focus:ring-2 focus:ring-blue-500"
                  >
                    <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  placeholder="e.g. Sophia Martinez"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Professional Job Title *</label>
                <input
                  type="text"
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                  placeholder="e.g. Senior Graphic Designer"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="e.g. sophia@example.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={data.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={data.personalInfo.city}
                  onChange={(e) => updatePersonalInfo('city', e.target.value)}
                  placeholder="e.g. San Francisco"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  value={data.personalInfo.country}
                  onChange={(e) => updatePersonalInfo('country', e.target.value)}
                  placeholder="e.g. United States"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={data.personalInfo.linkedin || ''}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Portfolio / Website</label>
                <input
                  type="text"
                  value={data.personalInfo.portfolio || ''}
                  onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                  placeholder="myportfolio.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PROFESSIONAL SUMMARY + AI WRITER */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Professional Summary</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Write a concise 3-4 sentence elevator pitch highlighting your core achievements.
                </p>
              </div>

              {/* AI Style selector */}
              <div className="flex items-center gap-2">
                <select
                  value={summaryStyle}
                  onChange={(e) => setSummaryStyle(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300"
                >
                  <option value="Professional">Style: Professional</option>
                  <option value="Executive">Style: Executive</option>
                  <option value="Creative">Style: Creative</option>
                  <option value="Modern">Style: Modern</option>
                  <option value="Simple">Style: Simple</option>
                  <option value="Friendly">Style: Friendly</option>
                  <option value="ATS Optimized">Style: ATS Optimized</option>
                </select>

                <button
                  onClick={() => onAiGenerateSummary(summaryStyle)}
                  disabled={aiLoadingField === 'summary'}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  <span>{aiLoadingField === 'summary' ? 'Writing...' : 'AI Generate Summary'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={data.summary}
              onChange={(e) => onChange({ ...data, summary: e.target.value })}
              placeholder="Write your professional summary here..."
              className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white leading-relaxed"
            />
          </div>
        )}

        {/* STEP 5: WORK EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Work Experience</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add your previous roles, accomplishments, and bullet points.
                </p>
              </div>
              <button
                onClick={() => {
                  const newExp: ExperienceItem = {
                    id: `exp_${Date.now()}`,
                    company: '',
                    jobTitle: '',
                    location: '',
                    employmentType: 'Full-time',
                    startDate: '',
                    endDate: '',
                    currentlyWorking: false,
                    responsibilities: '',
                    achievements: '',
                  };
                  onChange({ ...data, experiences: [newExp, ...data.experiences] });
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-6">
              {data.experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      Position #{idx + 1}
                    </span>
                    <button
                      onClick={() => {
                        onChange({
                          ...data,
                          experiences: data.experiences.filter((e) => e.id !== exp.id),
                        });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => {
                          const updated = [...data.experiences];
                          updated[idx].jobTitle = e.target.value;
                          onChange({ ...data, experiences: updated });
                        }}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...data.experiences];
                          updated[idx].company = e.target.value;
                          onChange({ ...data, experiences: updated });
                        }}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => {
                          const updated = [...data.experiences];
                          updated[idx].startDate = e.target.value;
                          onChange({ ...data, experiences: updated });
                        }}
                        className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                      <input
                        type="month"
                        disabled={exp.currentlyWorking}
                        value={exp.endDate}
                        onChange={(e) => {
                          const updated = [...data.experiences];
                          updated[idx].endDate = e.target.value;
                          onChange({ ...data, experiences: updated });
                        }}
                        className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exp.currentlyWorking}
                          onChange={(e) => {
                            const updated = [...data.experiences];
                            updated[idx].currentlyWorking = e.target.checked;
                            onChange({ ...data, experiences: updated });
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Currently Working Here</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Responsibilities & Bullet Points
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAiImproveExperience(idx)}
                          disabled={aiLoadingField === `exp_${idx}`}
                          className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Improve Writing</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={exp.responsibilities}
                      onChange={(e) => {
                        const updated = [...data.experiences];
                        updated[idx].responsibilities = e.target.value;
                        onChange({ ...data, experiences: updated });
                      }}
                      placeholder="Bullet points of key duties and tasks..."
                      className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Education History</h3>
              <button
                onClick={() => {
                  const newEdu: EducationItem = {
                    id: `edu_${Date.now()}`,
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    startDate: '',
                    endDate: '',
                  };
                  onChange({ ...data, education: [...data.education, newEdu] });
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.education.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">Education #{idx + 1}</span>
                    <button
                      onClick={() => onChange({ ...data, education: data.education.filter((e) => e.id !== edu.id) })}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="School / University"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[idx].institution = e.target.value;
                        onChange({ ...data, education: updated });
                      }}
                      className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Degree (e.g. Bachelor of Science)"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...data.education];
                        updated[idx].degree = e.target.value;
                        onChange({ ...data, education: updated });
                      }}
                      className="px-3 py-2 text-xs bg-white dark:bg-slate-800 border rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Skills & Expertise</h3>
                <p className="text-xs text-slate-500">Categorize skills and set proficiency levels.</p>
              </div>
              <button
                onClick={onAiGenerateSkills}
                disabled={aiLoadingField === 'skills'}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>AI Generate Skills</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.skills.map((skill, idx) => (
                <div key={skill.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => {
                      const updated = [...data.skills];
                      updated[idx].name = e.target.value;
                      onChange({ ...data, skills: updated });
                    }}
                    placeholder="Skill name"
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border rounded-lg"
                  />
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={skill.level}
                    onChange={(e) => {
                      const updated = [...data.skills];
                      updated[idx].level = parseInt(e.target.value);
                      onChange({ ...data, skills: updated });
                    }}
                    className="w-20"
                  />
                  <button onClick={() => onChange({ ...data, skills: data.skills.filter((s) => s.id !== skill.id) })} className="text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newSkill: SkillItem = { id: `s_${Date.now()}`, name: '', category: 'Technical Skills', level: 4 };
                onChange({ ...data, skills: [...data.skills, newSkill] });
              }}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>
        )}

        {/* STEP 12: DESIGN CUSTOMIZATION */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Design & Template Styling</h3>
            
            {/* Template Selector (8 options) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Choose Template Style:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'professional', name: 'Professional' },
                  { id: 'creative', name: 'Creative Header' },
                  { id: 'ats', name: 'ATS Screen Ready' },
                  { id: 'corporate', name: 'Corporate' },
                  { id: 'minimal', name: 'Minimalist' },
                  { id: 'modern', name: 'Modern Dark Accent' },
                  { id: 'elegant', name: 'Elegant Serif' },
                  { id: 'academic', name: 'Academic CV' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateDesign('template', t.id)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      data.design.template === t.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Primary Color Theme:</label>
              <div className="flex flex-wrap items-center gap-3">
                {colorPresets.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => updateDesign('primaryColor', c.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center ${
                      data.design.primaryColor === c.hex ? 'scale-110 border-black dark:border-white shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {data.design.primaryColor === c.hex && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout type selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Resume Column Layout:</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'single', label: 'One Column' },
                  { id: 'double', label: 'Two Columns' },
                  { id: 'sidebar', label: 'Sidebar Layout' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => updateDesign('layout', l.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      data.design.layout === l.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
