export interface NicheOption {
  id: string;
  name: string;
  category: string;
  iconName: string;
  description: string;
}

export interface VideoTypeOption {
  id: string;
  name: string;
  description: string;
}

export interface DurationOption {
  id: string;
  label: string;
  seconds: number;
  wordCountEst: number;
}

export const YOUTUBE_NICHES: NicheOption[] = [
  { id: 'ai-tech', name: 'AI & Technology', category: 'Tech & Business', iconName: 'Cpu', description: 'Artificial Intelligence, software tools, gadgets, tech news & tutorials' },
  { id: 'business', name: 'Business', category: 'Tech & Business', iconName: 'Briefcase', description: 'Entrepreneurship, startups, business strategies & case studies' },
  { id: 'finance', name: 'Finance', category: 'Money & Investing', iconName: 'TrendingUp', description: 'Personal finance, budgeting, debt payoff & wealth management' },
  { id: 'crypto', name: 'Crypto', category: 'Money & Investing', iconName: 'Coins', description: 'Bitcoin, Ethereum, DeFi, web3 & crypto market updates' },
  { id: 'make-money-online', name: 'Make Money Online', category: 'Money & Investing', iconName: 'DollarSign', description: 'Side hustles, online income streams, freelancing & passive income' },
  { id: 'affiliate-marketing', name: 'Affiliate Marketing', category: 'Tech & Business', iconName: 'Link', description: 'High-ticket affiliate offers, funnel building & traffic strategies' },
  { id: 'marketing', name: 'Marketing', category: 'Tech & Business', iconName: 'Megaphone', description: 'SEO, social media growth, email marketing & paid ad strategies' },
  { id: 'e-commerce', name: 'E-commerce', category: 'Tech & Business', iconName: 'ShoppingBag', description: 'Online store growth, product sourcing & digital retail' },
  { id: 'shopify', name: 'Shopify', category: 'Tech & Business', iconName: 'Store', description: 'Shopify theme customization, apps, conversion rate optimization' },
  { id: 'dropshipping', name: 'Dropshipping', category: 'Tech & Business', iconName: 'Package', description: 'Product research, winning ad creatives, TikTok organic & supplier lists' },
  { id: 'youtube-automation', name: 'YouTube Automation', category: 'Tech & Business', iconName: 'PlaySquare', description: 'Faceless channel building, outsourcing, niche selection & RPM strategies' },
  { id: 'education', name: 'Education', category: 'Learning & Growth', iconName: 'GraduationCap', description: 'Academic lessons, complex topic breakdowns & skill acquisition' },
  { id: 'motivation', name: 'Motivation', category: 'Learning & Growth', iconName: 'Flame', description: 'Inspirational speeches, discipline drives & high-energy encouragement' },
  { id: 'self-improvement', name: 'Self Improvement', category: 'Learning & Growth', iconName: 'Smile', description: 'Mindset shifts, daily habits, confidence building & personal mastery' },
  { id: 'productivity', name: 'Productivity', category: 'Learning & Growth', iconName: 'CheckCircle2', description: 'Time management, Notion setups, workflow hacks & deep work' },
  { id: 'gaming', name: 'Gaming', category: 'Entertainment', iconName: 'Gamepad2', description: 'Game walk-throughs, lore breakdowns, esports & gaming news' },
  { id: 'sports', name: 'Sports', category: 'Entertainment', iconName: 'Trophy', description: 'Highlights, athlete analysis, tactical breakdowns & sports news' },
  { id: 'food', name: 'Food', category: 'Lifestyle', iconName: 'Utensils', description: 'Recipes, meal prep, restaurant reviews & culinary techniques' },
  { id: 'travel', name: 'Travel', category: 'Lifestyle', iconName: 'Compass', description: 'Travel guides, budget travel, digital nomad life & country top 10s' },
  { id: 'luxury', name: 'Luxury', category: 'Lifestyle', iconName: 'Crown', description: 'Supercars, mansions, billionaire lifestyles & ultra-expensive items' },
  { id: 'cars', name: 'Cars', category: 'Lifestyle', iconName: 'Car', description: 'Automotive reviews, supercar breakdowns, electric vehicles & racing' },
  { id: 'history', name: 'History', category: 'Deep Dive & Stories', iconName: 'Hourglass', description: 'Ancient civilizations, military history, historical figures & timelines' },
  { id: 'science', name: 'Science', category: 'Deep Dive & Stories', iconName: 'Atom', description: 'Physics, biology, discoveries, experiments & scientific mysteries' },
  { id: 'documentary', name: 'Documentary', category: 'Deep Dive & Stories', iconName: 'Film', description: 'Cinematic deep dives, corporate breakdowns, investigative reports' },
  { id: 'true-crime', name: 'True Crime', category: 'Deep Dive & Stories', iconName: 'ShieldAlert', description: 'Investigative stories, unsolved mysteries, court cases & deep dives' },
  { id: 'mystery', name: 'Mystery', category: 'Deep Dive & Stories', iconName: 'Search', description: 'Unexplained phenomena, strange events, urban legends & secrets' },
  { id: 'horror', name: 'Horror', category: 'Deep Dive & Stories', iconName: 'Ghost', description: 'Creepy stories, paranormal encounters, scary folklore & thrillers' },
  { id: 'storytelling', name: 'Storytelling', category: 'Deep Dive & Stories', iconName: 'BookOpen', description: 'Engaging narratives, personal essays, dramatic arcs & fiction' },
  { id: 'animals', name: 'Animals', category: 'Lifestyle', iconName: 'Dog', description: 'Wild species, pet guides, ocean life & animal facts' },
  { id: 'kids', name: 'Kids', category: 'Lifestyle', iconName: 'Users', description: 'Family vlogs, parenting advice, children learning & fun crafts' },
  { id: 'religion', name: 'Religion', category: 'Learning & Growth', iconName: 'Sparkles', description: 'Spiritual lessons, scripture studies & philosophical discussions' },
  { id: 'fashion', name: 'Fashion', category: 'Lifestyle', iconName: 'Sparkle', description: 'Outfit inspiration, skincare routines, makeup tutorials & styling' },
  { id: 'beauty', name: 'Beauty', category: 'Lifestyle', iconName: 'HeartPulse', description: 'Skincare routines, cosmetic reviews & hair styling' },
  { id: 'entertainment', name: 'Entertainment', category: 'Media & Culture', iconName: 'Tv', description: 'Pop culture, viral trends, commentary & internet culture' },
  { id: 'psychology', name: 'Psychology', category: 'Learning & Growth', iconName: 'Brain', description: 'Mind tricks, human behavior, cognitive biases & mental models' },
  { id: 'real-estate', name: 'Real Estate', category: 'Money & Investing', iconName: 'Home', description: 'Property investing, home tours, house flipping & market updates' },
  { id: 'career', name: 'Career', category: 'Learning & Growth', iconName: 'Target', description: 'Resume tips, interview prep, career transitions & salary growth' },
  { id: 'reviews', name: 'Reviews', category: 'Tech & Business', iconName: 'StarHalf', description: 'Honest product comparisons, pros/cons breakdowns & buying guides' },
  { id: 'tutorials', name: 'Tutorials', category: 'Learning & Growth', iconName: 'HelpCircle', description: 'Practical step-by-step solutions for software, tools & skills' },
  { id: 'facts', name: 'Facts', category: 'Deep Dive & Stories', iconName: 'Zap', description: 'Mind-blowing trivia, quick statistics & top facts' },
  { id: 'comedy', name: 'Comedy', category: 'Entertainment', iconName: 'Smile', description: 'Humorous sketches, funny commentary, satirical breakdowns' },
  { id: 'news', name: 'News', category: 'Media & Culture', iconName: 'Newspaper', description: 'Global updates, breaking headlines, trending commentary' },
  { id: 'custom-niche', name: 'Custom Niche', category: 'Custom', iconName: 'PlusCircle', description: 'Specify any custom niche topic or hyper-focused sub-genre' },
];

export const VIDEO_TYPES: VideoTypeOption[] = [
  { id: 'long-form', name: 'Long Form', description: 'Standard horizontal YouTube video with chapters & narrative depth' },
  { id: 'shorts', name: 'Shorts', description: 'Fast-paced vertical short-form script optimized for instant retention' },
  { id: 'educational', name: 'Educational', description: 'Clear structured lessons explaining complex topics with key takeaways' },
  { id: 'tutorial', name: 'Tutorial', description: 'Step-by-step practical guide with exact action items and spoken instructions' },
  { id: 'documentary', name: 'Documentary', description: 'Cinematic deep dive narrative with dramatic narrative beats' },
  { id: 'explainer', name: 'Explainer', description: 'Engaging problem-to-solution breakdown using clear analogies' },
  { id: 'storytelling', name: 'Storytelling', description: 'Character-driven emotional arc with suspense, conflict, and resolution' },
  { id: 'top-10', name: 'Top 10', description: 'Countdown format with numbers, spoken highlights & rankings' },
  { id: 'review', name: 'Review', description: 'In-depth pros/cons, hands-on test analysis & rating' },
  { id: 'news', name: 'News', description: 'Fast-paced, objective breaking news or trend commentary' },
  { id: 'motivation', name: 'Motivation', description: 'High-energy inspirational address that drives emotional impact' },
  { id: 'comedy', name: 'Comedy', description: 'Fast-paced witty humor, funny observations, and relatable setups' },
  { id: 'interview', name: 'Interview', description: 'Host and guest Q&A flow with insightful dialogue' },
  { id: 'podcast', name: 'Podcast', description: 'Conversational deep dive discussion between hosts' },
  { id: 'product-video', name: 'Product Video', description: 'High-converting sales & feature showcase narration' },
  { id: 'character-story', name: 'Character Story', description: 'Roleplay or multi-character dialogic narrative' },
  { id: 'faceless', name: 'Faceless', description: 'Voiceover narration tailored for stock visual / faceless channels' },
];

export const DURATION_OPTIONS: DurationOption[] = [
  { id: '30s', label: '30 sec', seconds: 30, wordCountEst: 75 },
  { id: '60s', label: '60 sec', seconds: 60, wordCountEst: 150 },
  { id: '2m', label: '2 min', seconds: 120, wordCountEst: 300 },
  { id: '5m', label: '5 min', seconds: 300, wordCountEst: 750 },
  { id: '8m', label: '8 min', seconds: 480, wordCountEst: 1200 },
  { id: '10m', label: '10 min', seconds: 600, wordCountEst: 1500 },
  { id: '15m', label: '15 min', seconds: 900, wordCountEst: 2250 },
  { id: '20m', label: '20 min', seconds: 1200, wordCountEst: 3000 },
  { id: 'custom', label: 'Custom', seconds: 0, wordCountEst: 1000 },
];

export const SCRIPT_TONES = [
  'Professional',
  'Educational',
  'Conversational',
  'Funny',
  'Dramatic',
  'Emotional',
  'Cinematic',
  'Storytelling',
  'Energetic',
  'Inspirational',
  'Documentary',
  'Persuasive',
];

export const SCRIPT_SPEAKERS = [
  'Single Presenter',
  'Narrator',
  'Two Speakers',
  'Multiple Characters',
];

export const SAMPLE_TOPICS = [
  'How AI will change programming in the next 5 years',
  '7 passive income ideas that actually work in 2026',
  'The dark psychology behind social media addiction',
  'Why most Shopify stores fail in the first 30 days',
  'Is Bitcoin hitting $150K? Crypto market deep dive',
  'How to build a faceless YouTube automation channel from scratch',
  'Sida aad ugu samayn karto lacag intarneedka sannadkan (Somali)',
  'Cilmiga sayniska ee ka dambeeya seexashada wanaagsan (Somali)',
];

