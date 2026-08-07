export type ToolCategory = 'all' | 'pdf' | 'ai' | 'image' | 'converter';

export type ToolBadge = 'Popular' | 'AI Powered' | 'New' | 'Pro' | 'Fast';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  iconName: string; // Lucide icon identifier
  badge?: ToolBadge;
  popular?: boolean;
  featured?: boolean;
  tags: string[];
}

export type Role = 'admin' | 'moderator' | 'user';

export interface UserUsageLimits {
  aiRequestsToday: number;
  aiRequestsLimitDaily: number; // -1 for unlimited
  aiRequestsThisMonth: number;
  aiRequestsLimitMonthly: number; // -1 for unlimited
  pdfOpsToday: number;
  pdfOpsLimitDaily: number; // -1 for unlimited
  storageUsedMB: number;
  storageLimitMB: number;
  maxFileSizeMB: number;
  apiRequestsThisMonth: number;
  apiRequestsLimitMonthly: number;
  autoDeleteDays?: number | null;
}

export interface UserActivityLog {
  id: string;
  action: string;
  ipAddress?: string;
  device?: string;
  timestamp: string;
  details?: string;
}

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Pro Monthly' | 'Pro Yearly' | 'Lifetime' | 'Enterprise' | string;
  planStatus?: 'active' | 'canceling' | 'canceled' | 'past_due' | 'suspended';
  nextBillingDate?: string;
  storageUsedMB: number;
  storageLimitMB: number;
  filesProcessedCount: number;
  favorites: string[]; // tool IDs
  role: Role;
  accountStatus?: 'active' | 'suspended';
  emailVerified?: boolean;
  joinedDate?: string;
  lastLoginAt?: string;
  usage?: UserUsageLimits;
  activityLogs?: UserActivityLog[];
}

export interface ProcessedFile {
  id: string;
  fileName: string;
  originalSize: number;
  processedSize: number;
  toolUsed: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface PricingPlanLimits {
  aiRequestsDaily: number; // e.g. 10, -1 = unlimited
  aiRequestsMonthly: number; // e.g. 500, -1 = unlimited
  pdfOpsDaily: number; // e.g. 5, -1 = unlimited
  maxFileSizeMB: number; // e.g. 10, 500, 5120
  storageLimitMB: number; // e.g. 500, 51200, 1048576
  apiRequestsMonthly: number; // e.g. 0, 1000, 50000
  autoDeleteDays?: number | null; // e.g. 30 or null
}

export interface PricingPlan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise' | string;
  priceMonthly: number;
  priceYearly: number;
  priceLifetime?: number;
  badge?: string;
  popular?: boolean;
  enabled?: boolean;
  description: string;
  purpose?: string;
  limits: PricingPlanLimits;
  features: string[];
  featureDetails?: {
    account: string[];
    aiTools: string[];
    pdfTools: string[];
    storage: string[];
    support: string[];
    business?: string[];
  };
  ctaText: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  category: string;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  activeProSubscribers: number;
  monthlyRevenueUSD: number;
  totalFilesProcessed: number;
  serverStorageUsedGB: number;
  activeServers: number;
  conversionRatePercent: number;
  customerLtvUSD: number;
  monthlyRecurringRevenueUSD: number;
  apiRequestsTotal: number;
}

// --- V2 ADD-ON TYPES ---

// Automation & AI Workflows
export type AgentType = 
  | 'Research Agent' 
  | 'Task Manager' 
  | 'Content Creator' 
  | 'Report Generator' 
  | 'Data Analysis Assistant' 
  | 'Business Assistant';

export interface WorkflowStep {
  id: string;
  title: string;
  stepType: 'trigger' | 'ai_agent' | 'pdf_action' | 'notification' | 'webhook';
  agentType?: AgentType;
  actionName: string;
  config: Record<string, string>;
  status?: 'idle' | 'running' | 'success' | 'failed';
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  isScheduled: boolean;
  cronExpression?: string;
  lastRun?: string;
  status: 'active' | 'paused' | 'draft';
  author: string;
  runsCount: number;
  isPublic: boolean;
}

// AI Knowledge Base
export interface KnowledgeFile {
  id: string;
  name: string;
  sizeMB: number;
  type: 'pdf' | 'docx' | 'image' | 'cloud';
  source: 'Local Upload' | 'Google Drive' | 'Dropbox' | 'OneDrive';
  uploadedAt: string;
  pagesCount?: number;
  summary?: string;
  extractedTextPreview?: string;
  keyInsights: string[];
  status: 'indexed' | 'processing' | 'failed';
}

// Developer API Platform
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  requestsCount: number;
  status: 'active' | 'revoked';
  rateLimitPerMin: number;
}

export interface ApiEndpointDoc {
  id: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  name: string;
  description: string;
  category: 'PDF' | 'OCR' | 'AI Text' | 'Image' | 'Analysis';
  sampleRequest: string;
  sampleResponse: string;
}

// Marketplace
export type MarketplaceCategory = 
  | 'Business Templates' 
  | 'Marketing Templates' 
  | 'Resume Templates' 
  | 'AI Prompts' 
  | 'Social Media Templates' 
  | 'PDF Templates';

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  priceUSD: number; // 0 for free
  category: MarketplaceCategory;
  authorName: string;
  authorAvatar: string;
  rating: number;
  salesCount: number;
  previewImageUrl: string;
  tags: string[];
  isFeatured?: boolean;
}

// Affiliate System
export interface AffiliateStats {
  referralCode: string;
  referralLink: string;
  totalClicks: number;
  conversions: number;
  conversionRate: number; // %
  pendingCommissionUSD: number;
  paidCommissionUSD: number;
  totalEarnedUSD: number;
}

export interface AffiliateReferral {
  id: string;
  referredUser: string;
  date: string;
  plan: string;
  commissionUSD: number;
  status: 'Paid' | 'Pending' | 'Approved';
}

// Team & Enterprise
export type TeamRole = 'Owner' | 'Admin' | 'Editor' | 'Viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: TeamRole;
  joinedDate: string;
  filesProcessed: number;
  status: 'Active' | 'Pending Invite';
}

export interface TeamWorkspace {
  id: string;
  name: string;
  plan: 'Team Pro' | 'Enterprise';
  membersCount: number;
  maxSeats: number;
  storageLimitGB: number;
  storageUsedGB: number;
  members: TeamMember[];
}

// Notification System
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'file_completed' | 'subscription' | 'payment' | 'feature' | 'security';
  timestamp: string;
  read: boolean;
  linkPage?: string;
}

// Customer Support
export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  lastUpdate: string;
  messages: {
    sender: 'user' | 'agent' | 'bot';
    name: string;
    text: string;
    timestamp: string;
  }[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// --- EVC PLUS & MOBILE MONEY SOMALIA PAYMENT SYSTEM ---
export type PaymentMethodType = 'evc_plus' | 'zaad' | 'sahal' | 'mobile_money' | 'card_stripe';

export interface EvcPaymentRequest {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string; // Somalia mobile number (e.g. +252 61 XXX XXXX)
  paymentMethod: PaymentMethodType;
  planId: 'monthly' | 'yearly' | 'lifetime' | string;
  planName: string;
  amountPaidUSD: number;
  transactionId: string; // EVC Plus Transaction Reference (e.g., TXN-EVC-839210)
  screenshotUrl: string; // Image base64 or URL
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  approvedByAdmin?: string;
  durationMonths: number; // e.g. 1, 12, 999 for Lifetime
  rejectionReason?: string;
  adminNotes?: string;
}

export interface EvcPaymentConfig {
  merchantPhone: string; // e.g. "+252 61 555 1234"
  merchantName: string; // e.g. "AI Success Hub Somalia"
  evcUssdCode: string; // e.g. "*770*615551234*AMOUNT#"
  zaadNumber: string; // e.g. "+252 63 444 1234"
  zaadUssdCode: string; // e.g. "*712*634441234*AMOUNT#"
  sahalNumber: string; // e.g. "+252 62 333 1234"
  sahalUssdCode: string; // e.g. "*880*623331234*AMOUNT#"
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  lifetimePriceUSD: number;
  instructionsText: string;
  requireScreenshot: boolean;
  autoApproveKnownTxns: boolean;
}

export interface PaymentAuditLog {
  id: string;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CONFIG_UPDATED' | 'PRICING_UPDATED';
  adminEmail: string;
  transactionId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// --- VEO 3 VIDEO GENERATOR & WATERMARK REMOVER TYPES ---
export type LanguageCode = 'en' | 'so' | 'ar' | 'fr' | 'es';

export interface Veo3VideoConfig {
  prompt: string;
  negativePrompt?: string;
  scenePrompt?: string;
  characterConsistency?: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  videoLengthSeconds: 8 | 16 | 30;
  quality: 'HD' | '2K' | '4K';
  style: 'Cinematic' | 'Hyper Realistic' | 'Pixar' | 'Anime' | 'ASMR' | 'Product Commercial' | 'Luxury' | 'Documentary';
  cameraMovement: 'Drone' | 'Orbit' | 'Dolly' | 'Crane' | 'Handheld' | 'Static';
  motionControl: number; // 1 to 10
  cinematicLighting: string;
  initialImage?: string; // image to video
}

export interface GeneratedVideoItem {
  id: string;
  title: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  aspectRatio: string;
  style: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface WatermarkRemoveResult {
  id: string;
  originalUrl: string;
  cleanUrl: string;
  type: 'image' | 'video';
  fileName: string;
  fileSizeMB: number;
  processedAt: string;
}



