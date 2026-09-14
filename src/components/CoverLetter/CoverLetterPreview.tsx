import React from 'react';
import { CoverLetterData } from '../../types/coverLetter';

interface CoverLetterPreviewProps {
  data: CoverLetterData;
  zoomLevel?: number; // Zoom % e.g. 100
}

export const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({ data, zoomLevel = 100 }) => {
  const { personalInfo, recipientInfo, letterContent, customization } = data;

  const getFontFamilyCss = (fontName: string) => {
    switch (fontName) {
      case 'Playfair Display':
        return "'Playfair Display', Georgia, serif";
      case 'Merriweather':
        return "'Merriweather', Georgia, serif";
      case 'Georgia':
        return "Georgia, serif";
      case 'Garamond':
        return "Garamond, serif";
      case 'Plus Jakarta Sans':
        return "'Plus Jakarta Sans', system-ui, sans-serif";
      case 'Montserrat':
        return "'Montserrat', system-ui, sans-serif";
      case 'Space Grotesk':
        return "'Space Grotesk', sans-serif";
      case 'Inter':
      default:
        return "Inter, system-ui, sans-serif";
    }
  };

  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'text-[13px] leading-relaxed';
      case 'large':
        return 'text-[16px] leading-relaxed';
      case 'medium':
      default:
        return 'text-[14px] leading-relaxed';
    }
  };

  const getSpacingClass = (spacing: string) => {
    switch (spacing) {
      case 'compact':
        return 'space-y-3';
      case 'spacious':
        return 'space-y-6';
      case 'normal':
      default:
        return 'space-y-4';
    }
  };

  const getMarginClass = (margins: string) => {
    switch (margins) {
      case 'narrow':
        return 'p-6 sm:p-8';
      case 'wide':
        return 'p-10 sm:p-14';
      case 'normal':
      default:
        return 'p-8 sm:p-12';
    }
  };

  const primaryColor = customization.primaryColor || '#2563eb';
  const fontStyle = { fontFamily: getFontFamilyCss(customization.font) };

  // Format paragraphs from body text
  const bodyParagraphs = letterContent.body
    ? letterContent.body.split('\n\n').filter((p) => p.trim().length > 0)
    : [letterContent.body];

  return (
    <div className="w-full flex justify-center items-start overflow-x-auto py-2 px-1">
      {/* Paper Document Container (Standard A4 / Letter Dimensions) */}
      <div
        id="cover-letter-document"
        className={`bg-white text-slate-800 shadow-2xl rounded-sm w-full max-w-[800px] min-h-[1050px] transition-all duration-300 relative border border-slate-200/80 print:border-none print:shadow-none print:m-0 print:p-8 ${getMarginClass(
          customization.margins
        )}`}
        style={{
          ...fontStyle,
          transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none',
          transformOrigin: 'top center',
        }}
      >
        {/* ================= TEMPLATE 1: MODERN ACCENT ================= */}
        {customization.templateId === 'modern' && (
          <div className="space-y-6">
            <div className="-mx-8 -mt-8 sm:-mx-12 sm:-mt-12 h-3 w-full" style={{ backgroundColor: primaryColor }}></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {personalInfo.showPhoto && personalInfo.photoUrl && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.fullName}
                    className={`w-16 h-16 object-cover border-2 shadow-sm ${
                      personalInfo.photoShape === 'circle'
                        ? 'rounded-full'
                        : personalInfo.photoShape === 'square'
                        ? 'rounded-none'
                        : 'rounded-xl'
                    }`}
                    style={{ borderColor: primaryColor }}
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{personalInfo.fullName}</h1>
                  {personalInfo.jobTitle && (
                    <p className="text-sm font-semibold tracking-wide mt-0.5" style={{ color: primaryColor }}>
                      {personalInfo.jobTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 sm:text-right space-y-1">
                {personalInfo.email && <div className="flex items-center sm:justify-end gap-1.5">{personalInfo.email}</div>}
                {personalInfo.phone && <div className="flex items-center sm:justify-end gap-1.5">{personalInfo.phone}</div>}
                {personalInfo.location && <div className="flex items-center sm:justify-end gap-1.5">{personalInfo.location}</div>}
                {personalInfo.linkedin && (
                  <div className="flex items-center sm:justify-end gap-1.5 text-indigo-600 font-medium">{personalInfo.linkedin}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 2: EXECUTIVE ================= */}
        {customization.templateId === 'executive' && (
          <div className="space-y-6">
            <div
              className="-mx-8 -mt-8 sm:-mx-12 sm:-mt-12 p-8 text-white text-center shadow-md mb-6"
              style={{ backgroundColor: primaryColor }}
            >
              <h1 className="text-3xl font-serif font-bold tracking-wide">{personalInfo.fullName}</h1>
              {personalInfo.jobTitle && <p className="text-sm font-medium opacity-90 mt-1 uppercase tracking-widest">{personalInfo.jobTitle}</p>}
              <div className="flex flex-wrap justify-center items-center gap-3 text-xs opacity-80 mt-3 pt-2 border-t border-white/20">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.location && <span>• {personalInfo.location}</span>}
                {personalInfo.website && <span>• {personalInfo.website}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 3: CREATIVE STUDIO ================= */}
        {customization.templateId === 'creative' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between pb-6 border-b-2" style={{ borderColor: primaryColor }}>
              <div className="flex items-center gap-4">
                {personalInfo.showPhoto && personalInfo.photoUrl && (
                  <img
                    src={personalInfo.photoUrl}
                    alt={personalInfo.fullName}
                    className="w-20 h-20 object-cover rounded-2xl shadow-md border-2"
                    style={{ borderColor: primaryColor }}
                  />
                )}
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold text-white mb-2" style={{ backgroundColor: primaryColor }}>
                    Application
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{personalInfo.fullName}</h1>
                  <p className="text-sm font-semibold text-slate-600">{personalInfo.jobTitle}</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-1 text-right">
                <p className="font-semibold text-slate-800">{personalInfo.email}</p>
                <p>{personalInfo.phone}</p>
                <p>{personalInfo.location}</p>
                {personalInfo.portfolio && <p className="text-indigo-600">{personalInfo.portfolio}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 4: ELEGANT SERIF ================= */}
        {customization.templateId === 'elegant' && (
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-slate-200">
              <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-wide">{personalInfo.fullName}</h1>
              {personalInfo.jobTitle && <p className="text-sm italic text-slate-600 mt-1 font-serif">{personalInfo.jobTitle}</p>}

              <div className="flex justify-center items-center gap-2 my-3">
                <div className="h-px w-12" style={{ backgroundColor: primaryColor }}></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                <div className="h-px w-12" style={{ backgroundColor: primaryColor }}></div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>| {personalInfo.phone}</span>}
                {personalInfo.location && <span>| {personalInfo.location}</span>}
                {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 5: CORPORATE ENTERPRISE ================= */}
        {customization.templateId === 'corporate' && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 shadow-xs flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-extrabold uppercase tracking-tight" style={{ color: primaryColor }}>
                  {personalInfo.fullName}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{personalInfo.jobTitle}</p>
              </div>
              <div className="text-xs text-slate-600 text-right space-y-1">
                <p>{personalInfo.email}</p>
                <p>{personalInfo.phone}</p>
                <p>{personalInfo.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 6: PREMIUM GOLD ================= */}
        {customization.templateId === 'premium' && (
          <div className="space-y-6">
            <div className="border-l-4 pl-6 py-2" style={{ borderColor: primaryColor }}>
              <h1 className="text-3xl font-serif font-bold text-slate-900">{personalInfo.fullName}</h1>
              {personalInfo.jobTitle && (
                <p className="text-sm font-medium tracking-wide mt-1 uppercase" style={{ color: primaryColor }}>
                  {personalInfo.jobTitle}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-2">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.location && <span>• {personalInfo.location}</span>}
                {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATES 7, 8, 9: PROFESSIONAL / MINIMAL / ATS ================= */}
        {(customization.templateId === 'professional' ||
          customization.templateId === 'minimal' ||
          customization.templateId === 'ats') && (
          <div className="space-y-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">{personalInfo.fullName}</h1>
              {personalInfo.jobTitle && <p className="text-sm font-semibold text-slate-600">{personalInfo.jobTitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.phone && <span>• {personalInfo.phone}</span>}
              {personalInfo.email && <span>• {personalInfo.email}</span>}
              {personalInfo.linkedin && <span>• {personalInfo.linkedin}</span>}
              {personalInfo.website && <span>• {personalInfo.website}</span>}
            </div>
          </div>
        )}

        {/* ================= RECIPIENT INFORMATION & DATE ================= */}
        <div className="my-6 space-y-4 text-slate-800">
          {recipientInfo.date && <p className="text-xs font-semibold text-slate-500">{recipientInfo.date}</p>}

          {(recipientInfo.hiringManager || recipientInfo.companyName) && (
            <div className="text-xs space-y-0.5 leading-snug">
              {recipientInfo.hiringManager && (
                <p className="font-bold text-slate-900 text-sm">{recipientInfo.hiringManager}</p>
              )}
              {recipientInfo.hiringManagerTitle && (
                <p className="text-slate-600 font-medium">{recipientInfo.hiringManagerTitle}</p>
              )}
              {recipientInfo.companyName && (
                <p className="font-semibold text-slate-800">{recipientInfo.companyName}</p>
              )}
              {recipientInfo.companyAddress && (
                <p className="text-slate-500 whitespace-pre-line">{recipientInfo.companyAddress}</p>
              )}
            </div>
          )}

          {/* Subject Line */}
          {letterContent.subject && (
            <div className="pt-2">
              <p className="font-bold text-sm sm:text-base border-l-2 pl-3 py-0.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                {letterContent.subject}
              </p>
            </div>
          )}
        </div>

        {/* Salutation */}
        {letterContent.salutation && (
          <p className="font-semibold text-slate-900 text-sm mb-4">{letterContent.salutation}</p>
        )}

        {/* ================= COVER LETTER BODY PARAGRAPHS ================= */}
        <div className={`${getFontSizeClass(customization.fontSize)} ${getSpacingClass(customization.spacing)} text-slate-700 text-justify`}>
          {bodyParagraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* ================= SIGN OFF & SIGNATURE ================= */}
        <div className="mt-8 pt-4 space-y-2">
          {letterContent.signOff && <p className="text-xs font-medium text-slate-600">{letterContent.signOff}</p>}

          <div className="pt-2">
            {letterContent.signatureType === 'script' ? (
              <p
                className="text-2xl font-serif italic font-bold tracking-wide"
                style={{ color: primaryColor }}
              >
                {letterContent.signatureName || personalInfo.fullName}
              </p>
            ) : (
              <p className="text-base font-bold text-slate-900">{letterContent.signatureName || personalInfo.fullName}</p>
            )}

            {(letterContent.signatureTitle || personalInfo.jobTitle) && (
              <p className="text-xs text-slate-500 font-medium">{letterContent.signatureTitle || personalInfo.jobTitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
