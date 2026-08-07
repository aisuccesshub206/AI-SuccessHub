import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Award,
  Briefcase,
  GraduationCap,
  Sparkles,
  Code,
  Languages,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { ResumeData } from '../../types/resume';

interface ResumePreviewProps {
  data: ResumeData;
  zoomLevel?: number; // percentage, default 100
  previewId?: string;
  isPrinting?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  zoomLevel = 100,
  previewId = 'resume-live-preview',
  isPrinting = false,
}) => {
  const { personalInfo, summary, experiences, education, skills, certificates, projects, languages, references, design } = data;
  const { primaryColor, fontFamily, fontSize, layout, showReferences, showSkillBars, showPhoto } = design;

  // Font family mapping
  const getFontClass = () => {
    switch (fontFamily) {
      case 'Roboto':
        return 'font-sans';
      case 'Playfair Display':
        return 'font-serif';
      case 'Merriweather':
        return 'font-serif';
      case 'Space Grotesk':
        return 'font-mono';
      case 'Montserrat':
        return 'font-sans tracking-tight';
      case 'Fira Code':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  // Font size mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-[11px] leading-relaxed';
      case 'large':
        return 'text-sm leading-relaxed';
      default:
        return 'text-xs leading-relaxed';
    }
  };

  const currentScale = zoomLevel / 100;

  return (
    <div
      id={previewId}
      className={`bg-white text-slate-800 shadow-2xl transition-transform duration-200 origin-top ${
        isPrinting ? 'w-full shadow-none p-0' : 'mx-auto rounded-none p-8 border border-slate-200/60'
      } ${getFontClass()} ${getFontSizeClass()}`}
      style={{
        transform: isPrinting ? 'none' : `scale(${currentScale})`,
        width: isPrinting ? '100%' : '794px', // Standard A4 width in pixels at 96 DPI
        minHeight: isPrinting ? 'auto' : '1123px', // Standard A4 height
        fontFamily: `${fontFamily}, sans-serif`,
      }}
    >
      {/* Dynamic Header Section */}
      <header
        className={`pb-6 mb-6 border-b ${
          design.template === 'creative' || design.template === 'modern'
            ? 'p-6 rounded-2xl text-white mb-6'
            : ''
        }`}
        style={{
          borderColor: design.template === 'ats' ? '#cbd5e1' : `${primaryColor}30`,
          backgroundColor:
            design.template === 'creative' || design.template === 'modern'
              ? primaryColor
              : 'transparent',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <h1
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                design.template === 'creative' || design.template === 'modern'
                  ? 'text-white'
                  : 'text-slate-900'
              }`}
            >
              {personalInfo.fullName || 'Your Full Name'}
            </h1>
            <p
              className={`text-sm sm:text-base font-semibold ${
                design.template === 'creative' || design.template === 'modern'
                  ? 'text-white/90'
                  : ''
              }`}
              style={{
                color:
                  design.template === 'creative' || design.template === 'modern'
                    ? '#ffffff'
                    : primaryColor,
              }}
            >
              {personalInfo.jobTitle || 'Professional Job Title'}
            </p>

            {/* Quick Contact Links Grid */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-[11px] text-slate-600">
              {personalInfo.email && (
                <div className={`flex items-center gap-1.5 ${design.template === 'creative' || design.template === 'modern' ? 'text-white/80' : ''}`}>
                  <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: design.template === 'creative' ? '#ffffff' : primaryColor }} />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className={`flex items-center gap-1.5 ${design.template === 'creative' || design.template === 'modern' ? 'text-white/80' : ''}`}>
                  <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: design.template === 'creative' ? '#ffffff' : primaryColor }} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {(personalInfo.city || personalInfo.country) && (
                <div className={`flex items-center gap-1.5 ${design.template === 'creative' || design.template === 'modern' ? 'text-white/80' : ''}`}>
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: design.template === 'creative' ? '#ffffff' : primaryColor }} />
                  <span>
                    {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className={`flex items-center gap-1.5 ${design.template === 'creative' || design.template === 'modern' ? 'text-white/80' : ''}`}>
                  <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: design.template === 'creative' ? '#ffffff' : primaryColor }} />
                  <span>{personalInfo.linkedin}</span>
                </div>
              )}
              {personalInfo.portfolio && (
                <div className={`flex items-center gap-1.5 ${design.template === 'creative' || design.template === 'modern' ? 'text-white/80' : ''}`}>
                  <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: design.template === 'creative' ? '#ffffff' : primaryColor }} />
                  <span>{personalInfo.portfolio}</span>
                </div>
              )}
              {personalInfo.github && (
                <div className={`flex items-center gap-1.5 ${design.template === 'creative' || design.template === 'modern' ? 'text-white/80' : ''}`}>
                  <Github className="w-3.5 h-3.5 shrink-0" style={{ color: design.template === 'creative' ? '#ffffff' : primaryColor }} />
                  <span>{personalInfo.github}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Photo Display */}
          {showPhoto && personalInfo.photoUrl && (
            <div className="shrink-0">
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.fullName}
                referrerPolicy="no-referrer"
                className={`w-24 h-24 object-cover border-2 shadow-md ${
                  personalInfo.photoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
                style={{ borderColor: primaryColor }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Body Layout Engine */}
      <div className={layout === 'sidebar' ? 'grid grid-cols-12 gap-6' : layout === 'double' ? 'grid grid-cols-2 gap-6' : 'space-y-6'}>
        
        {/* Main Content Stream */}
        <div className={layout === 'sidebar' ? 'col-span-8 space-y-6' : 'space-y-6'}>
          
          {/* Summary Section */}
          {summary && (
            <section className="space-y-2">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Professional Summary</span>
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            </section>
          )}

          {/* Work Experience Section */}
          {experiences.length > 0 && (
            <section className="space-y-4">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work Experience</span>
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{exp.jobTitle}</h3>
                        <div className="text-slate-600 font-medium">
                          {exp.company} {exp.location && `• ${exp.location}`} ({exp.employmentType})
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                        </span>
                      </div>
                    </div>
                    {exp.responsibilities && (
                      <p className="text-slate-700 whitespace-pre-line pl-2 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                        {exp.responsibilities}
                      </p>
                    )}
                    {exp.achievements && (
                      <div className="mt-1 text-[11px] text-slate-600">
                        <strong className="text-slate-900 font-semibold">Key Achievements: </strong>
                        {exp.achievements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {education.length > 0 && (
            <section className="space-y-3">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Education</span>
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h3>
                        <div className="text-slate-600 font-medium">{edu.institution} {edu.grade && `• ${edu.grade}`}</div>
                      </div>
                      <div className="text-[11px] text-slate-500 shrink-0">
                        {edu.startDate} - {edu.endDate}
                      </div>
                    </div>
                    {edu.description && <p className="text-slate-600 text-[11px]">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          {projects.length > 0 && (
            <section className="space-y-3">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Featured Projects</span>
              </h2>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">{proj.name}</h3>
                      {proj.projectUrl && (
                        <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-[11px] font-semibold underline" style={{ color: primaryColor }}>
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-slate-700">{proj.description}</p>
                    {proj.technologiesUsed && (
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Tech:</span> {proj.technologiesUsed}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar / Auxiliary Section */}
        <div className={layout === 'sidebar' ? 'col-span-4 space-y-6 pl-4 border-l border-slate-100' : 'space-y-6'}>
          
          {/* Skills Section */}
          {skills.length > 0 && (
            <section className="space-y-3">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Skills & Expertise</span>
              </h2>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="space-y-1">
                    <div className="flex items-center justify-between text-slate-800 font-semibold text-xs">
                      <span>{skill.name}</span>
                      <span className="text-[10px] text-slate-500">{skill.category}</span>
                    </div>
                    {showSkillBars && (
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(skill.level / 5) * 100}%`,
                            backgroundColor: primaryColor,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificates Section */}
          {certificates.length > 0 && (
            <section className="space-y-2.5">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certificates</span>
              </h2>
              <div className="space-y-2">
                {certificates.map((cert) => (
                  <div key={cert.id} className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 text-xs">{cert.name}</h4>
                    <p className="text-slate-600 text-[11px]">{cert.organization} ({cert.issueDate})</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages Section */}
          {languages.length > 0 && (
            <section className="space-y-2">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Languages</span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="font-bold text-slate-900">{lang.language}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{lang.proficiency}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* References Section */}
          {showReferences && references.length > 0 && (
            <section className="space-y-2">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b flex items-center gap-1.5"
                style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>References</span>
              </h2>
              <div className="space-y-2">
                {references.map((ref) => (
                  <div key={ref.id} className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-900">{ref.name}</div>
                    <div className="text-slate-600">{ref.position} at {ref.company}</div>
                    <div className="text-[10px] text-slate-500">{ref.email} • {ref.phone}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
