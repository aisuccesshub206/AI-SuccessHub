import React from 'react';
import { CoverLetterData, CoverLetterTemplateId, CoverLetterFont, CoverLetterFontSize, CoverLetterSpacing } from '../../types/coverLetter';
import { COVER_LETTER_TEMPLATES } from '../../data/coverLetterSampleData';
import { Check, Sliders, Palette, Type, Layout, SlidersHorizontal, Image } from 'lucide-react';

interface CoverLetterCustomizePanelProps {
  data: CoverLetterData;
  onChange: (updated: CoverLetterData) => void;
}

const COLOR_PRESETS = [
  { name: 'Royal Indigo', value: '#2563eb' },
  { name: 'Slate Gray', value: '#1e293b' },
  { name: 'Navy Midnight', value: '#0f172a' },
  { name: 'Emerald Green', value: '#059669' },
  { name: 'Deep Rose', value: '#be123c' },
  { name: 'Royal Purple', value: '#7c3aed' },
  { name: 'Ocean Blue', value: '#0284c7' },
  { name: 'Gold Amber', value: '#b45309' },
  { name: 'Charcoal Dark', value: '#18181b' },
];

const FONT_PRESETS: CoverLetterFont[] = [
  'Inter',
  'Plus Jakarta Sans',
  'Playfair Display',
  'Merriweather',
  'Montserrat',
  'Georgia',
  'Garamond',
  'Space Grotesk',
];

export const CoverLetterCustomizePanel: React.FC<CoverLetterCustomizePanelProps> = ({ data, onChange }) => {
  const { customization, personalInfo, letterContent } = data;

  const updateCustomization = (fields: Partial<typeof customization>) => {
    onChange({
      ...data,
      customization: {
        ...customization,
        ...fields,
      },
    });
  };

  const updatePersonalInfo = (fields: Partial<typeof personalInfo>) => {
    onChange({
      ...data,
      personalInfo: {
        ...personalInfo,
        ...fields,
      },
    });
  };

  const updateLetterContent = (fields: Partial<typeof letterContent>) => {
    onChange({
      ...data,
      letterContent: {
        ...letterContent,
        ...fields,
      },
    });
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      {/* 1. Primary Color Theme */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Palette className="w-4 h-4 text-indigo-500" />
          Primary Theme Color
        </div>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PRESETS.map((color) => {
            const isSelected = customization.primaryColor.toLowerCase() === color.value.toLowerCase();
            return (
              <button
                key={color.value}
                onClick={() => updateCustomization({ primaryColor: color.value, accentColor: color.value })}
                className={`h-9 rounded-lg flex items-center justify-center transition-all relative border ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800 scale-105'
                    : 'border-transparent hover:scale-100'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Custom Color:</label>
          <input
            type="color"
            value={customization.primaryColor}
            onChange={(e) => updateCustomization({ primaryColor: e.target.value, accentColor: e.target.value })}
            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
          />
          <span className="text-xs font-mono text-slate-500">{customization.primaryColor}</span>
        </div>
      </div>

      {/* 2. Typography & Font Family */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Type className="w-4 h-4 text-indigo-500" />
          Typography Font Family
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FONT_PRESETS.map((font) => (
            <button
              key={font}
              onClick={() => updateCustomization({ font })}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                customization.font === font
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Font Size & Spacing */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          Text Size & Spacing
        </div>

        {/* Font Size Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Font Size:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as CoverLetterFontSize[]).map((size) => (
              <button
                key={size}
                onClick={() => updateCustomization({ fontSize: size })}
                className={`py-1.5 px-3 rounded-lg border text-xs capitalize transition-all ${
                  customization.fontSize === size
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Line Spacing Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Line Spacing:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'normal', 'spacious'] as CoverLetterSpacing[]).map((sp) => (
              <button
                key={sp}
                onClick={() => updateCustomization({ spacing: sp })}
                className={`py-1.5 px-3 rounded-lg border text-xs capitalize transition-all ${
                  customization.spacing === sp
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Margins */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Page Margins:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['narrow', 'normal', 'wide'] as const).map((m) => (
              <button
                key={m}
                onClick={() => updateCustomization({ margins: m })}
                className={`py-1.5 px-3 rounded-lg border text-xs capitalize transition-all ${
                  customization.margins === m
                    ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Photo Settings */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <Image className="w-4 h-4 text-indigo-500" />
            Profile Photo
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={personalInfo.showPhoto}
              onChange={(e) => updatePersonalInfo({ showPhoto: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {personalInfo.showPhoto && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Image URL / Data URL:</label>
              <input
                type="text"
                value={personalInfo.photoUrl || ''}
                onChange={(e) => updatePersonalInfo({ photoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Photo Shape:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['circle', 'square', 'rounded'] as const).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => updatePersonalInfo({ photoShape: shape })}
                    className={`py-1 px-2 rounded border text-xs capitalize transition-all ${
                      personalInfo.photoShape === shape
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Signature Style */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
          <Type className="w-4 h-4 text-indigo-500" />
          Signature Style
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateLetterContent({ signatureType: 'script' })}
            className={`p-2.5 rounded-lg border text-xs transition-all ${
              letterContent.signatureType === 'script'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="font-serif italic text-sm">Cursive Script</span>
          </button>
          <button
            onClick={() => updateLetterContent({ signatureType: 'typed' })}
            className={`p-2.5 rounded-lg border text-xs transition-all ${
              letterContent.signatureType === 'typed'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="font-semibold">Formal Typed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
