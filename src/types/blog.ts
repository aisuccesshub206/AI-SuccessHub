export type BlogTone = 'Professional' | 'Friendly' | 'Conversational' | 'Expert' | 'Persuasive' | 'Educational';
export type BlogLength = 'Short' | 'Medium' | 'Long' | 'Comprehensive';
export type BlogAudience = 'Beginners' | 'Professionals' | 'Business Owners' | 'Students' | 'General Audience';
export type BlogStatus = 'draft' | 'published' | 'scheduled';

export interface BlogSeoCheckitem {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
}

export interface BlogSeoData {
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  semanticKeywords: string[];
  suggestedSlug: string;
  searchIntent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  seoScore: number; // 0 - 100
  checklist: BlogSeoCheckitem[];
}

export interface BlogImageItem {
  id: string;
  sectionTitle?: string;
  url?: string;
  prompt: string;
  altText: string;
  caption?: string;
  placement?: string;
}

export interface BlogSettings {
  tone: BlogTone;
  length: BlogLength;
  audience: BlogAudience;
  language: string;
  targetAudienceOptional?: string;
  websiteNameOptional?: string;
  mainKeywordOptional?: string;
  additionalInstructionsOptional?: string;
}

export interface BlogExpertData {
  keywordStrategy: string;
  contentOutline: string[];
  contentGapSuggestions: string[];
  internalLinkOpportunities: string[];
  externalReferences: string[];
  faqOpportunities: string[];
  featuredSnippetOpportunity: string;
  contentScore: number;
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogArticle {
  id: string;
  topic: string;
  title: string;
  slug: string;
  status: BlogStatus;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readTimeMinutes: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  settings: BlogSettings;
  seo: BlogSeoData;
  featuredImage: BlogImageItem;
  sectionImages: BlogImageItem[];
  contentHtml: string;
  faqs: BlogFaqItem[];
  expertData: BlogExpertData;
}
