import { CoverLetterData, CoverLetterTemplateMeta } from '../types/coverLetter';

export const COVER_LETTER_TEMPLATES: CoverLetterTemplateMeta[] = [
  {
    id: 'modern',
    name: 'Modern Accent',
    description: 'Clean header bar with vibrant primary accents and responsive structure.',
    badge: 'Popular',
    popular: true,
    primaryColor: '#2563eb', // Indigo / Blue
    accentColor: '#3b82f6',
    font: 'Plus Jakarta Sans',
  },
  {
    id: 'professional',
    name: 'Professional Business',
    description: 'Classic corporate header with subtle rules and formal hierarchy.',
    badge: 'Standard',
    popular: true,
    primaryColor: '#1e293b', // Slate
    accentColor: '#475569',
    font: 'Inter',
  },
  {
    id: 'executive',
    name: 'Executive Leadership',
    description: 'Commanding top banner for senior roles and executive presence.',
    badge: 'Executive',
    primaryColor: '#0f172a', // Navy Midnight
    accentColor: '#0284c7',
    font: 'Playfair Display',
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Generous negative space, light typography, and pure focus on message.',
    primaryColor: '#334155',
    accentColor: '#64748b',
    font: 'Inter',
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    description: 'Distinctive sidebar layout with visual badges and artistic touch.',
    badge: 'Creative',
    primaryColor: '#7c3aed', // Purple / Violet
    accentColor: '#a855f7',
    font: 'Space Grotesk',
  },
  {
    id: 'elegant',
    name: 'Elegant Serif',
    description: 'Warm serif typography with classic centered flourish divider.',
    primaryColor: '#881337', // Deep Rose / Burgundy
    accentColor: '#be123c',
    font: 'Merriweather',
  },
  {
    id: 'corporate',
    name: 'Corporate Enterprise',
    description: 'Structured header box with clear contact layout for enterprise positions.',
    primaryColor: '#0369a1', // Ocean Blue
    accentColor: '#0284c7',
    font: 'Montserrat',
  },
  {
    id: 'ats',
    name: 'ATS Friendly',
    description: '100% scanner readable single-column plain text optimized design.',
    badge: 'ATS 99%',
    popular: true,
    primaryColor: '#18181b', // Dark Charcoal
    accentColor: '#3f3f46',
    font: 'Inter',
  },
  {
    id: 'premium',
    name: 'Premium Gold',
    description: 'Luxury design featuring gold accent rules, floating card style, and script signature.',
    badge: 'Pro Luxury',
    primaryColor: '#b45309', // Gold / Amber
    accentColor: '#d97706',
    font: 'Playfair Display',
  },
];

export const SAMPLE_COVER_LETTERS: Record<string, CoverLetterData> = {
  softwareEngineer: {
    id: 'cl-sample-1',
    title: 'Senior Software Engineer Cover Letter',
    updatedAt: new Date().toISOString().split('T')[0],
    personalInfo: {
      fullName: 'Abdirahman Hassan',
      jobTitle: 'Senior Full-Stack Engineer',
      email: 'abdirahman.hassan@example.com',
      phone: '+1 (555) 234-5678',
      location: 'Seattle, WA',
      linkedin: 'linkedin.com/in/abdirahman-hassan',
      website: 'abdirahman.dev',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      photoShape: 'circle',
      showPhoto: true,
    },
    recipientInfo: {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      hiringManager: 'Sarah Jenkins',
      hiringManagerTitle: 'VP of Engineering',
      companyName: 'CloudTech Solutions Inc.',
      companyAddress: '500 Innovation Way, Suite 400, San Francisco, CA 94105',
    },
    letterContent: {
      subject: 'Application for Senior Full-Stack Engineer Position (Req #8920)',
      salutation: 'Dear Ms. Jenkins,',
      body: `I am writing to express my enthusiastic interest in the Senior Full-Stack Engineer position at CloudTech Solutions Inc. With over 6 years of experience architecting high-scalability cloud applications, optimizing REST/GraphQL microservices, and leading distributed engineering teams, I am confident in my ability to significantly contribute to CloudTech's mission of building next-generation SaaS tools.

In my current role as Senior Lead Engineer at Apex Digital, I spearheaded the architectural redesign of our enterprise file processing engine, reducing latency by 42% and driving a 30% increase in daily active user engagements. My technical foundation spans React, TypeScript, Node.js, Express, PostgreSQL, and Cloud Native Container engines, coupled with a deep passion for continuous deployment and unit test coverage.

What draws me specifically to CloudTech Solutions is your recent release of AI-powered workflow automation. Having successfully integrated Gemini AI LLM pipelines into real-time web applications, I am eager to apply my experience in generative AI integration, serverless optimization, and user-centric architecture to your product ecosystem.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical expertise and leadership background align with your engineering goals.`,
      signOff: 'Sincerely,',
      signatureName: 'Abdirahman Hassan',
      signatureTitle: 'Senior Full-Stack Engineer',
      signatureType: 'script',
    },
    customization: {
      templateId: 'modern',
      font: 'Plus Jakarta Sans',
      fontSize: 'medium',
      spacing: 'normal',
      primaryColor: '#2563eb',
      accentColor: '#3b82f6',
      layoutStyle: 'top-header',
      margins: 'normal',
    },
  },

  marketingDirector: {
    id: 'cl-sample-2',
    title: 'Marketing Director Cover Letter',
    updatedAt: new Date().toISOString().split('T')[0],
    personalInfo: {
      fullName: 'Elena Rostova',
      jobTitle: 'Head of Growth Marketing',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/elena-rostova',
      website: 'elenarostova.com',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      photoShape: 'circle',
      showPhoto: true,
    },
    recipientInfo: {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      hiringManager: 'David Sterling',
      hiringManagerTitle: 'Chief Commercial Officer',
      companyName: 'Global Nexus Brands',
      companyAddress: '100 Madison Avenue, 18th Floor, New York, NY 10016',
    },
    letterContent: {
      subject: 'Re: Application for Head of Growth Marketing Role',
      salutation: 'Dear Mr. Sterling,',
      body: `I am thrilled to apply for the Head of Growth Marketing position at Global Nexus Brands. Having monitored your impressive international expansion and brand repositioning over the past year, I am excited by the prospect of driving scalable customer acquisition strategies for your portfolio.

Over the past 8 years, I have spearheaded performance marketing, SEO strategy, and brand campaigns that collectively generated over $14M in ARR. At Vantage Media, I scaled organic user acquisition by 215% within 18 months through data-driven content engines and omnichannel lifecycle campaigns.

Your team’s focus on leveraging brand narrative with algorithmic user acquisition matches my core operating philosophy. I bring deep experience managing $2M+ annual ad budgets, leading high-performance creative teams, and optimizing conversion funnels across global markets.

I look forward to discussing how my track record in growth strategy can propel Global Nexus Brands to its next revenue milestone. Thank you for your time and thoughtful consideration.`,
      signOff: 'Best regards,',
      signatureName: 'Elena Rostova',
      signatureTitle: 'Head of Growth Marketing',
      signatureType: 'script',
    },
    customization: {
      templateId: 'executive',
      font: 'Playfair Display',
      fontSize: 'medium',
      spacing: 'normal',
      primaryColor: '#0f172a',
      accentColor: '#0284c7',
      layoutStyle: 'centered',
      margins: 'normal',
    },
  },
};

export function getSampleCoverLetterData(key = 'softwareEngineer'): CoverLetterData {
  return SAMPLE_COVER_LETTERS[key] || SAMPLE_COVER_LETTERS['softwareEngineer'];
}
