import {
  Workflow,
  KnowledgeFile,
  ApiKey,
  ApiEndpointDoc,
  MarketplaceItem,
  AffiliateStats,
  AffiliateReferral,
  TeamWorkspace,
  AppNotification,
  SupportTicket,
  FAQItem,
} from '../types';

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Automatic PDF Summary & Email Dispatch',
    description: 'Watches folder for new PDFs, runs AI Summarizer & Report Generator Agent, sends executive overview to email.',
    category: 'Document Automation',
    steps: [
      { id: 's1', title: 'New File Upload', stepType: 'trigger', actionName: 'Watch Folder / Cloud Drive', config: { source: 'Google Drive / Upload' } },
      { id: 's2', title: 'Extract Key Facts', stepType: 'ai_agent', agentType: 'Research Agent', actionName: 'Deep OCR & Semantic Extraction', config: { detailLevel: 'high' } },
      { id: 's3', title: 'Generate Executive Report', stepType: 'ai_agent', agentType: 'Report Generator', actionName: 'Create Markdown Summary', config: { format: 'Executive Brief' } },
      { id: 's4', title: 'Send Email Notification', stepType: 'notification', actionName: 'Email Delivery to Stakeholders', config: { recipient: 'team@company.com' } },
    ],
    isScheduled: true,
    cronExpression: '0 9 * * 1-5',
    lastRun: '10 mins ago',
    status: 'active',
    author: 'AI Operations Suite',
    runsCount: 142,
    isPublic: true,
  },
  {
    id: 'wf-2',
    name: 'Contract OCR & Risk Analysis Flow',
    description: 'Scans legal contracts with Vision OCR, identifies liability risks, and drafts review summary notes.',
    category: 'Legal & Compliance',
    steps: [
      { id: 's1', title: 'Contract Input', stepType: 'trigger', actionName: 'PDF Upload', config: { type: 'Contract PDF' } },
      { id: 's2', title: 'Legal Clause Analysis', stepType: 'ai_agent', agentType: 'Data Analysis Assistant', actionName: 'Risk & Penalty Audit', config: { focus: 'Liabilities' } },
      { id: 's3', title: 'Draft Response', stepType: 'ai_agent', agentType: 'Business Assistant', actionName: 'Prepare Redline Recommendations', config: { tone: 'Professional' } },
    ],
    isScheduled: false,
    lastRun: '2 hours ago',
    status: 'active',
    author: 'Legal AI Team',
    runsCount: 89,
    isPublic: true,
  },
  {
    id: 'wf-3',
    name: 'Social Media Content & Image Multi-Generator',
    description: 'Takes product specs or document brief, outputs 5 social media posts and accompanying AI hero illustrations.',
    category: 'Marketing',
    steps: [
      { id: 's1', title: 'Topic Input', stepType: 'trigger', actionName: 'Prompt / Brief', config: { format: 'Text' } },
      { id: 's2', title: 'Draft Posts', stepType: 'ai_agent', agentType: 'Content Creator', actionName: 'Multi-Channel Post Generation', config: { platforms: 'LinkedIn, X, Insta' } },
      { id: 's3', title: 'Generate AI Banner', stepType: 'ai_agent', agentType: 'Task Manager', actionName: 'AI Image Generation', config: { style: '3D Render' } },
    ],
    isScheduled: false,
    lastRun: 'Yesterday',
    status: 'paused',
    author: 'Growth Marketing Suite',
    runsCount: 34,
    isPublic: true,
  },
];

export const INITIAL_KNOWLEDGE_FILES: KnowledgeFile[] = [
  {
    id: 'kf-1',
    name: '2026_Q2_Financial_Report.pdf',
    sizeMB: 4.8,
    type: 'pdf',
    source: 'Local Upload',
    uploadedAt: 'Today, 08:30 AM',
    pagesCount: 24,
    status: 'indexed',
    summary: 'Comprehensive Q2 financial analysis showing 34% YoY revenue growth, expansion in Enterprise AI tier, and projected $12.4M ARR.',
    keyInsights: [
      'Gross profit margin increased from 72% to 78% due to cloud API optimizations.',
      'Enterprise accounts grew by 45, led by fintech and healthcare clients.',
      'Customer Acquisition Cost (CAC) decreased by 14% with organic AI tool search traffic.',
    ],
    extractedTextPreview: 'Financial Highlights Q2 2026: Total net revenues reached $10.45 million, representing a 34% increase year-over-year...',
  },
  {
    id: 'kf-2',
    name: 'AI_Platform_Architecture_V2.docx',
    sizeMB: 2.1,
    type: 'docx',
    source: 'Google Drive',
    uploadedAt: 'Yesterday, 04:15 PM',
    pagesCount: 12,
    status: 'indexed',
    summary: 'Technical architecture specification outlining microservice distribution, vector search indexing, and real-time streaming pipelines.',
    keyInsights: [
      'Utilizes Gemini 1.5 Flash for ultra-fast document embedding and semantic chunking.',
      'Supports high-concurrency PDF rendering engine built on Express Node server.',
    ],
    extractedTextPreview: '1. Executive Summary: The AI Success Hub V2 platform implements a hybrid client-server model enabling zero-latency PDF manipulation...',
  },
  {
    id: 'kf-3',
    name: 'Brand_Identity_Guidelines_2026.pdf',
    sizeMB: 8.5,
    type: 'pdf',
    source: 'Dropbox',
    uploadedAt: '3 days ago',
    pagesCount: 18,
    status: 'indexed',
    summary: 'Official corporate brand guide covering typography scales, color tokens, dark mode UI hierarchy, and logo usage.',
    keyInsights: [
      'Primary Indigo accent: #6366F1 with glowing ambient overlays.',
      'Dark mode primary surface background: #020205 with glass panel overlays.',
    ],
    extractedTextPreview: 'Brand Rules: Always maintain contrast ratio > 4.5:1. Preferred typeface family is clean sans-serif with Playfair Display accent headings...',
  },
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production Server Main Key',
    key: 'ash_live_9f82a17c4e09d3b1287e',
    createdAt: '2026-05-12',
    lastUsed: '2 mins ago',
    requestsCount: 48920,
    status: 'active',
    rateLimitPerMin: 1200,
  },
  {
    id: 'key-2',
    name: 'Staging & Dev Testing',
    key: 'ash_test_3b1189ac001ef92a872d',
    createdAt: '2026-07-01',
    lastUsed: '1 hour ago',
    requestsCount: 3200,
    status: 'active',
    rateLimitPerMin: 300,
  },
];

export const API_ENDPOINTS_DOCS: ApiEndpointDoc[] = [
  {
    id: 'ep-1',
    method: 'POST',
    path: '/api/v1/pdf/convert',
    name: 'PDF Universal Converter',
    description: 'Converts documents (DOCX, PPTX, Images) into high-fidelity PDF binaries or vice versa.',
    category: 'PDF',
    sampleRequest: `curl -X POST https://api.aisuccesshub.com/v1/pdf/convert \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@document.docx" \\
  -F "targetFormat=pdf"`,
    sampleResponse: `{
  "status": "success",
  "fileId": "file_9831a2",
  "downloadUrl": "https://cdn.aisuccesshub.com/exports/converted_9831a2.pdf",
  "pagesProcessed": 8,
  "executionTimeMs": 240
}`,
  },
  {
    id: 'ep-2',
    method: 'POST',
    path: '/api/v1/ocr/extract',
    name: 'AI Vision OCR Extractor',
    description: 'Extracts formatted text, tables, and structured JSON from scanned PDFs or images using Gemini Vision AI.',
    category: 'OCR',
    sampleRequest: `curl -X POST https://api.aisuccesshub.com/v1/ocr/extract \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@receipt.jpg" \\
  -F "outputFormat=json"`,
    sampleResponse: `{
  "status": "success",
  "ocrText": "Invoice #1042\\nVendor: Acme Corp\\nTotal: $1,240.00",
  "tables": [
    { "item": "Cloud Compute", "qty": 2, "price": "$620.00" }
  ],
  "confidenceScore": 0.992
}`,
  },
  {
    id: 'ep-3',
    method: 'POST',
    path: '/api/v1/ai/summarize',
    name: 'AI Document Summarizer',
    description: 'Generates concise bullet points, executive summaries, or custom length digests from any text or document.',
    category: 'AI Text',
    sampleRequest: `curl -X POST https://api.aisuccesshub.com/v1/ai/summarize \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "text": "...", "maxLengthWords": 150, "format": "bullets" }'`,
    sampleResponse: `{
  "status": "success",
  "summary": "• Q2 Revenue surged by 34% YoY to $10.45M.\\n• Gross margin improved to 78%.\\n• 45 new Enterprise clients onboarded.",
  "tokensUsed": 412
}`,
  },
  {
    id: 'ep-4',
    method: 'POST',
    path: '/api/v1/image/generate',
    name: 'AI Studio Image Generator',
    description: 'Generates photorealistic illustrations, vector graphics, or hero banners using Imagen 3 models.',
    category: 'Image',
    sampleRequest: `curl -X POST https://api.aisuccesshub.com/v1/image/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "prompt": "Futuristic glassmorphism AI dashboard banner", "aspectRatio": "16:9" }'`,
    sampleResponse: `{
  "status": "success",
  "imageUrl": "https://cdn.aisuccesshub.com/generated/img_48291a.png",
  "aspectRatio": "16:9"
}`,
  },
];

export const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'mp-1',
    title: 'Executive Pitch Deck PDF & AI Prompt Kit',
    description: 'Complete 25-slide corporate presentation template with embedded AI prompts for pitch writing and valuation summary.',
    priceUSD: 19,
    category: 'Business Templates',
    authorName: 'Alex R. (Product Designer)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    salesCount: 1420,
    previewImageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
    tags: ['Pitch Deck', 'Business', 'AI Prompts', 'PDF'],
    isFeatured: true,
  },
  {
    id: 'mp-2',
    title: 'Ultimate Viral Social Media AI Workflow Suite',
    description: 'Plug-and-play workflow that automatically converts long articles into 10 LinkedIn carousel PDFs and X threads.',
    priceUSD: 29,
    category: 'Social Media Templates',
    authorName: 'Elena R. (Growth Specialist)',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    rating: 4.8,
    salesCount: 890,
    previewImageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600',
    tags: ['Social Media', 'Automations', 'Carousel', 'Marketing'],
    isFeatured: true,
  },
  {
    id: 'mp-3',
    title: 'ATS-Optimized Tech Resume & Cover Letter Pack',
    description: 'Proven high-conversion developer resume template with AI prompt generator for instant resume customizer.',
    priceUSD: 0,
    category: 'Resume Templates',
    authorName: 'David C. (Career Coach)',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 5.0,
    salesCount: 3820,
    previewImageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600',
    tags: ['Resume', 'Free', 'ATS', 'Career'],
  },
  {
    id: 'mp-4',
    title: '1,000+ Master AI Prompts Mega Library',
    description: 'Curated prompts for Copywriting, SEO, Legal Summaries, Python Coding, Midjourney Image Prompts, and Financial Modeling.',
    priceUSD: 15,
    category: 'AI Prompts',
    authorName: 'AI Success Hub Official',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    rating: 4.9,
    salesCount: 5210,
    previewImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    tags: ['Prompts', 'ChatGPT', 'AI', 'Productivity'],
    isFeatured: true,
  },
];

export const INITIAL_AFFILIATE_STATS: AffiliateStats = {
  referralCode: 'SARAH2026',
  referralLink: 'https://aisuccesshub.com/?ref=SARAH2026',
  totalClicks: 1420,
  conversions: 84,
  conversionRate: 5.9,
  pendingCommissionUSD: 420.0,
  paidCommissionUSD: 1280.0,
  totalEarnedUSD: 1700.0,
};

export const INITIAL_AFFILIATE_REFERRALS: AffiliateReferral[] = [
  { id: 'ref-1', referredUser: 'Mark S. (TechCorp)', date: '2026-08-02', plan: 'Pro Yearly ($144)', commissionUSD: 43.2, status: 'Approved' },
  { id: 'ref-2', referredUser: 'Design Studio LLC', date: '2026-08-01', plan: 'Enterprise ($399)', commissionUSD: 119.7, status: 'Approved' },
  { id: 'ref-3', referredUser: 'Jessica M.', date: '2026-07-28', plan: 'Pro Monthly ($15)', commissionUSD: 4.5, status: 'Paid' },
  { id: 'ref-4', referredUser: 'DevOps Team Inc.', date: '2026-07-25', plan: 'Lifetime ($299)', commissionUSD: 89.7, status: 'Paid' },
];

export const INITIAL_TEAM_WORKSPACE: TeamWorkspace = {
  id: 'team-ws-1',
  name: 'Apex Digital Workspace',
  plan: 'Enterprise',
  membersCount: 4,
  maxSeats: 10,
  storageLimitGB: 500,
  storageUsedGB: 84.2,
  members: [
    { id: 'tm-1', name: 'Workspace Admin', email: 'admin@aisuccesshub.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', role: 'Owner', joinedDate: '2026-01-10', filesProcessed: 482, status: 'Active' },
    { id: 'tm-2', name: 'Marcus Vance', email: 'marcus.v@apexdigital.io', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'Admin', joinedDate: '2026-02-15', filesProcessed: 210, status: 'Active' },
    { id: 'tm-3', name: 'Chloe Kim', email: 'chloe.k@apexdigital.io', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', role: 'Editor', joinedDate: '2026-04-01', filesProcessed: 145, status: 'Active' },
    { id: 'tm-4', name: 'Liam O\'Connor', email: 'liam.o@apexdigital.io', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', role: 'Viewer', joinedDate: '2026-06-12', filesProcessed: 12, status: 'Active' },
  ],
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'PDF Merge Completed',
    message: 'Your document "Q3_Financial_Summary.pdf" has been processed and compressed.',
    type: 'file_completed',
    timestamp: '5 mins ago',
    read: false,
    linkPage: 'dashboard',
  },
  {
    id: 'notif-2',
    title: 'Affiliate Payout Approved',
    message: '$420.00 commission payout has been approved and scheduled for deposit.',
    type: 'payment',
    timestamp: '1 hour ago',
    read: false,
    linkPage: 'affiliate',
  },
  {
    id: 'notif-3',
    title: 'New AI Workflow Builder Live',
    message: 'V2 Add-On is now active with Drag & Drop Automation and AI Knowledge Base.',
    type: 'feature',
    timestamp: '2 hours ago',
    read: true,
    linkPage: 'automation',
  },
  {
    id: 'notif-4',
    title: 'Security Alert: New API Key',
    message: 'A new production API Key "Production Server Main Key" was generated from IP 192.168.1.1.',
    type: 'security',
    timestamp: 'Yesterday',
    read: true,
    linkPage: 'api-platform',
  },
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does AI Success Hub handle my uploaded PDF privacy?',
    answer: 'All uploaded files are processed in isolated encrypted containers and automatically purged after processing unless saved to your personal AI Knowledge Base.',
    category: 'Security & Privacy',
  },
  {
    id: 'faq-2',
    question: 'What is the file size limit for PDF compression and AI OCR?',
    answer: 'Free users can process files up to 100MB. Pro and Enterprise accounts support files up to 500MB with batch processing.',
    category: 'Limits & Pricing',
  },
  {
    id: 'faq-3',
    question: 'How do I integrate the Developer API into my application?',
    answer: 'Simply generate an API Key in the Developer API Platform dashboard and use our standard REST endpoint formats or official Node/Python SDKs.',
    category: 'Developer API',
  },
  {
    id: 'faq-4',
    question: 'Can I invite my team members to share custom workflows and storage?',
    answer: 'Yes! Navigate to the Team & Enterprise tab to invite team members with specific permission roles (Admin, Editor, Viewer).',
    category: 'Teams & Workspaces',
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-802',
    subject: 'Request for custom OCR language support for Japanese PDFs',
    category: 'Feature Request',
    status: 'In Progress',
    priority: 'Medium',
    createdAt: '2026-08-01',
    lastUpdate: '3 hours ago',
    messages: [
      { sender: 'user', name: 'Member User', text: 'Hi team, can we add Japanese CJK OCR extraction for legal document parsing?', timestamp: '2026-08-01 10:14 AM' },
      { sender: 'agent', name: 'Alex (Support Lead)', text: 'Hello! Our V2 Vision OCR engine now supports Japanese. I have enabled early beta access on your account.', timestamp: '3 hours ago' },
    ],
  },
];
