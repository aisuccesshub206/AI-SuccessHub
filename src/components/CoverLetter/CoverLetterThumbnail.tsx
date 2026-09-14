import React from 'react';
import { CoverLetterTemplateId, CoverLetterFont } from '../../types/coverLetter';

interface CoverLetterThumbnailProps {
  templateId: CoverLetterTemplateId;
  templateName: string;
  primaryColor: string;
  font: CoverLetterFont;
  isSelected?: boolean;
  onClick?: () => void;
}

export const CoverLetterThumbnail: React.FC<CoverLetterThumbnailProps> = ({
  templateId,
  templateName,
  primaryColor,
  font,
  isSelected = false,
  onClick,
}) => {
  const getFontFamilyCss = (fontName: string) => {
    switch (fontName) {
      case 'Playfair Display':
      case 'Merriweather':
      case 'Georgia':
      case 'Garamond':
        return 'serif';
      case 'Space Grotesk':
        return 'monospace';
      default:
        return 'sans-serif';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer rounded-xl border-2 transition-all duration-200 bg-white overflow-hidden text-slate-800 ${
        isSelected
          ? 'border-indigo-600 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30 dark:border-indigo-400'
          : 'border-slate-200 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500 hover:shadow-md'
      }`}
    >
      {/* Miniature Visual Render Canvas (Aspect ratio 1 : 1.41 A4 paper) */}
      <div
        className="w-full aspect-[1/1.3] p-3 flex flex-col justify-between bg-white text-[6px] select-none overflow-hidden relative"
        style={{ fontFamily: getFontFamilyCss(font) }}
      >
        {/* Template-specific Mini Header Mock */}
        {templateId === 'modern' && (
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-xs" style={{ backgroundColor: primaryColor }}></div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="font-bold text-[8px] tracking-tight text-slate-900">ABDIRAHMAN HASSAN</div>
                <div className="text-[5px] font-medium" style={{ color: primaryColor }}>
                  Senior Software Engineer
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[4px] font-bold text-slate-500">
                AH
              </div>
            </div>
            <div className="h-px bg-slate-100 w-full my-0.5"></div>
          </div>
        )}

        {templateId === 'executive' && (
          <div className="-mx-3 -mt-3 p-2 text-white mb-1.5" style={{ backgroundColor: primaryColor }}>
            <div className="font-serif text-[8px] font-bold text-center tracking-wide">ABDIRAHMAN HASSAN</div>
            <div className="text-[5px] text-center opacity-85">Executive Technology Leader</div>
            <div className="text-[4px] text-center opacity-70 mt-0.5">seattle, wa • (555) 234-5678 • email@dev.com</div>
          </div>
        )}

        {templateId === 'creative' && (
          <div className="space-y-1">
            <div className="flex gap-1.5 items-center">
              <div className="w-4 h-4 rounded-md bg-purple-100 border border-purple-300 flex items-center justify-center font-bold text-[5px]" style={{ color: primaryColor }}>
                AH
              </div>
              <div>
                <div className="font-bold text-[8px] text-slate-900">Abdirahman Hassan</div>
                <div className="text-[5px] font-semibold" style={{ color: primaryColor }}>
                  Creative Developer
                </div>
              </div>
            </div>
            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: primaryColor }}></div>
          </div>
        )}

        {templateId === 'elegant' && (
          <div className="text-center space-y-0.5 pb-1 border-b border-rose-200">
            <div className="font-serif text-[9px] font-bold text-slate-900 tracking-wider">Abdirahman Hassan</div>
            <div className="text-[5px] italic text-slate-500">Full-Stack Engineer</div>
            <div className="flex justify-center items-center gap-1 my-0.5">
              <div className="h-px w-6" style={{ backgroundColor: primaryColor }}></div>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: primaryColor }}></div>
              <div className="h-px w-6" style={{ backgroundColor: primaryColor }}></div>
            </div>
          </div>
        )}

        {templateId === 'corporate' && (
          <div className="bg-slate-50 p-1.5 rounded border border-slate-200 mb-1 space-y-0.5">
            <div className="font-bold text-[8px] text-slate-900" style={{ color: primaryColor }}>
              ABDIRAHMAN HASSAN
            </div>
            <div className="text-[5px] text-slate-600 font-medium">Senior Software Engineer</div>
            <div className="text-[4px] text-slate-400">Seattle, WA | +1 555-234-5678 | abdirahman@dev.com</div>
          </div>
        )}

        {templateId === 'premium' && (
          <div className="space-y-1 border-l-2 pl-1.5" style={{ borderColor: primaryColor }}>
            <div className="font-serif font-bold text-[8px] text-slate-900">Abdirahman Hassan</div>
            <div className="text-[5px] font-medium" style={{ color: primaryColor }}>
              Senior Product Developer
            </div>
          </div>
        )}

        {(templateId === 'professional' || templateId === 'minimal' || templateId === 'ats') && (
          <div className="space-y-0.5">
            <div className="font-bold text-[8px] text-slate-900">ABDIRAHMAN HASSAN</div>
            <div className="text-[5px] font-medium text-slate-500">Senior Full-Stack Engineer</div>
            <div className="text-[4px] text-slate-400">Seattle, WA • +1 (555) 234-5678 • dev@example.com</div>
            <div className="h-px bg-slate-200 w-full my-0.5"></div>
          </div>
        )}

        {/* Mini Recipient & Date Mock */}
        <div className="my-1 space-y-0.5 text-slate-600">
          <div className="text-[4px] text-slate-400">October 24, 2026</div>
          <div className="font-semibold text-[5px] text-slate-800">Sarah Jenkins</div>
          <div className="text-[4px] text-slate-500">VP of Engineering • CloudTech Solutions</div>
        </div>

        {/* Mini Subject Line */}
        <div className="font-semibold text-[5px] py-0.5" style={{ color: primaryColor }}>
          Re: Senior Full-Stack Engineer Position
        </div>

        {/* Mini Body Text Simulation Lines */}
        <div className="space-y-1 my-1 flex-1">
          <div className="h-0.5 bg-slate-300 rounded w-full"></div>
          <div className="h-0.5 bg-slate-300 rounded w-[94%]"></div>
          <div className="h-0.5 bg-slate-300 rounded w-[90%]"></div>
          <div className="h-0.5 bg-slate-200 rounded w-[85%] mt-1"></div>
          <div className="h-0.5 bg-slate-200 rounded w-[92%]"></div>
          <div className="h-0.5 bg-slate-200 rounded w-[78%]"></div>
          <div className="h-0.5 bg-slate-200 rounded w-[88%] mt-1"></div>
          <div className="h-0.5 bg-slate-200 rounded w-[60%]"></div>
        </div>

        {/* Mini Sign Off */}
        <div className="mt-auto pt-1 space-y-0.5">
          <div className="text-[4px] text-slate-500">Sincerely,</div>
          <div className="font-bold text-[6px] text-slate-800 font-serif">Abdirahman Hassan</div>
        </div>
      </div>

      {/* Label and Badge Overlay Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 flex items-center justify-between">
        <div>
          <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{templateName}</span>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 capitalize">{templateId} Layout</span>
        </div>
        {isSelected && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
            Selected
          </span>
        )}
      </div>
    </div>
  );
};
