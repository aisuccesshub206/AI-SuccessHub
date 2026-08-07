export type ResumeCategory =
  | 'Graphic Designer'
  | 'UI/UX Designer'
  | 'Software Engineer'
  | 'Web Developer'
  | 'Mobile App Developer'
  | 'AI Prompt Engineer'
  | 'Digital Marketing'
  | 'Social Media Manager'
  | 'Video Editor'
  | 'Content Creator'
  | 'Accountant'
  | 'Teacher'
  | 'Doctor'
  | 'Nurse'
  | 'Civil Engineer'
  | 'Mechanical Engineer'
  | 'Electrician'
  | 'Sales Representative'
  | 'Customer Service'
  | 'Receptionist'
  | 'Hotel Manager'
  | 'Chef'
  | 'Driver'
  | 'Security Guard'
  | 'Freelancer'
  | 'Student'
  | 'Graduate'
  | 'Internship'
  | 'ATS Resume'
  | 'Executive Resume'
  | 'Creative Resume'
  | 'Remote Job Resume';

export type ResumeTemplateId =
  | 'professional'
  | 'creative'
  | 'ats'
  | 'corporate'
  | 'minimal'
  | 'modern'
  | 'elegant'
  | 'academic';

export type LayoutType = 'single' | 'double' | 'sidebar';

export type FontChoice =
  | 'Inter'
  | 'Roboto'
  | 'Playfair Display'
  | 'Plus Jakarta Sans'
  | 'Merriweather'
  | 'Space Grotesk'
  | 'Montserrat'
  | 'Fira Code';

export type FontSizeChoice = 'small' | 'medium' | 'large';

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  postalCode: string;
  nationality: string;
  dateOfBirth?: string;
  photoUrl?: string;
  photoShape: 'circle' | 'square';
  linkedin?: string;
  portfolio?: string;
  github?: string;
  behance?: string;
  dribbble?: string;
  website?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  jobTitle: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Freelance' | 'Internship';
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
  achievements: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Technical Skills' | 'Soft Skills' | 'Language Skills' | 'Computer Skills';
  level: number; // 1 to 5 or percentage
}

export interface CertificateItem {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologiesUsed: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Professional' | 'Native';
}

export interface ReferenceItem {
  id: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
}

export interface ResumeDesignConfig {
  template: ResumeTemplateId;
  primaryColor: string; // hex code
  fontFamily: FontChoice;
  fontSize: FontSizeChoice;
  layout: LayoutType;
  showReferences: boolean;
  showSkillBars: boolean;
  showPhoto: boolean;
}

export interface ResumeData {
  category: ResumeCategory;
  personalInfo: PersonalInfo;
  summary: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certificates: CertificateItem[];
  projects: ProjectItem[];
  languages: LanguageItem[];
  references: ReferenceItem[];
  design: ResumeDesignConfig;
}
