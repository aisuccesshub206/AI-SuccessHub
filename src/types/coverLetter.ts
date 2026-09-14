export type CoverLetterTemplateId =
  | 'modern'
  | 'professional'
  | 'executive'
  | 'minimal'
  | 'creative'
  | 'elegant'
  | 'corporate'
  | 'ats'
  | 'premium';

export type CoverLetterFont =
  | 'Inter'
  | 'Plus Jakarta Sans'
  | 'Playfair Display'
  | 'Merriweather'
  | 'Montserrat'
  | 'Georgia'
  | 'Garamond'
  | 'Space Grotesk';

export type CoverLetterFontSize = 'small' | 'medium' | 'large';
export type CoverLetterSpacing = 'compact' | 'normal' | 'spacious';

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  photoUrl?: string;
  photoShape: 'circle' | 'square' | 'rounded';
  showPhoto: boolean;
}

export interface RecipientInfo {
  date: string;
  hiringManager: string;
  hiringManagerTitle: string;
  companyName: string;
  companyAddress: string;
}

export interface LetterContent {
  subject: string;
  salutation: string;
  body: string;
  signOff: string;
  signatureName: string;
  signatureTitle: string;
  signatureType: 'typed' | 'script';
}

export interface CoverLetterCustomization {
  templateId: CoverLetterTemplateId;
  font: CoverLetterFont;
  fontSize: CoverLetterFontSize;
  spacing: CoverLetterSpacing;
  primaryColor: string;
  accentColor: string;
  layoutStyle: 'top-header' | 'split-header' | 'sidebar' | 'centered' | 'bordered';
  margins: 'narrow' | 'normal' | 'wide';
}

export interface CoverLetterData {
  id: string;
  title: string;
  updatedAt: string;
  personalInfo: PersonalInfo;
  recipientInfo: RecipientInfo;
  letterContent: LetterContent;
  customization: CoverLetterCustomization;
}

export interface CoverLetterTemplateMeta {
  id: CoverLetterTemplateId;
  name: string;
  description: string;
  badge?: string;
  popular?: boolean;
  primaryColor: string;
  accentColor: string;
  font: CoverLetterFont;
}
