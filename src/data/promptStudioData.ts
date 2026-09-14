export interface PromptCategoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface PromptCategoryGroup {
  groupName: string;
  iconName: string;
  items: string[];
}

export const PROMPT_CATEGORY_GROUPS: PromptCategoryGroup[] = [
  {
    groupName: 'Writing & Content',
    iconName: 'PenTool',
    items: [
      'Blog Writing',
      'Article Writing',
      'Copywriting',
      'Email Writing',
      'Social Media',
      'YouTube Scripts',
      'Storytelling',
      'Product Descriptions',
      'Ads',
      'Captions',
      'SEO Content',
    ],
  },
  {
    groupName: 'Business',
    iconName: 'Briefcase',
    items: [
      'Business Plans',
      'Marketing Strategy',
      'Branding',
      'Sales',
      'Customer Support',
      'Business Analysis',
      'Market Research',
      'E-commerce',
      'Shopify',
      'Dropshipping',
      'Affiliate Marketing',
    ],
  },
  {
    groupName: 'AI & Creative',
    iconName: 'Sparkles',
    items: [
      'AI Image Generation',
      'AI Video Generation',
      'AI Voice',
      'Character Creation',
      'Story Generation',
      'Creative Ideas',
      'Prompt Engineering',
    ],
  },
  {
    groupName: 'Education',
    iconName: 'GraduationCap',
    items: [
      'Learning',
      'Homework Help',
      'Tutoring',
      'Research',
      'Summaries',
      'Study Plans',
      'Quiz Generation',
      'Lesson Plans',
    ],
  },
  {
    groupName: 'Coding & Technology',
    iconName: 'Code',
    items: [
      'Coding',
      'Debugging',
      'Code Review',
      'App Development',
      'Website Development',
      'Automation',
      'APIs',
      'Database',
      'Technical Documentation',
    ],
  },
  {
    groupName: 'Productivity',
    iconName: 'CheckCircle2',
    items: [
      'Planning',
      'Goal Setting',
      'Time Management',
      'Brainstorming',
      'Decision Making',
      'Research Assistant',
      'Personal Assistant',
    ],
  },
  {
    groupName: 'Professional',
    iconName: 'UserCheck',
    items: [
      'Resume / CV',
      'Cover Letter',
      'Interview Preparation',
      'LinkedIn',
      'Professional Emails',
      'Reports',
      'Presentations',
    ],
  },
  {
    groupName: 'Other',
    iconName: 'MoreHorizontal',
    items: [
      'Finance',
      'Real Estate',
      'Fitness',
      'Travel',
      'Food',
      'Gaming',
      'News',
      'Custom',
    ],
  },
];

export const AI_PLATFORMS = [
  { id: 'ChatGPT', name: 'ChatGPT / GPT-4o', description: 'Best for general reasoning, conversational tasks, and markdown structured output' },
  { id: 'Gemini', name: 'Google Gemini', description: 'Best for multimodal analysis, long-context reasoning, and grounded research' },
  { id: 'Claude', name: 'Anthropic Claude', description: 'Best for long-form nuanced writing, coding, analysis, and artifact generation' },
  { id: 'AI Image Generator', name: 'AI Image (Midjourney, DALL-E, Flux)', description: 'Optimized for visual style, aspect ratio, camera angles, lighting, and prompt weights' },
  { id: 'AI Video Generator', name: 'AI Video (Runway, Sora, Veo, Luma)', description: 'Optimized for camera motion, cinematic lighting, FPS, subject action, and scene duration' },
  { id: 'Coding AI', name: 'Coding AI (Cursor, Copilot, Claude Dev)', description: 'Optimized for technical stack, file architecture, type definitions, and non-hallucinated code' },
  { id: 'General AI', name: 'General / Any AI Model', description: 'Universal prompt structure optimized for any LLM system' },
];

export const GOAL_OPTIONS = [
  'Generate', 'Rewrite', 'Analyze', 'Explain', 'Research',
  'Brainstorm', 'Create', 'Plan', 'Solve', 'Compare', 'Summarize', 'Teach'
];

export const OUTPUT_TYPE_OPTIONS = [
  'Text', 'List', 'Table', 'JSON', 'Step-by-Step',
  'Article', 'Script', 'Code', 'Strategy', 'Report'
];

export const TONE_OPTIONS = [
  'Professional', 'Friendly', 'Expert', 'Simple',
  'Persuasive', 'Creative', 'Conversational', 'Academic'
];

export interface LearnLesson {
  id: number;
  title: string;
  summary: string;
  explanation: string;
  badPrompt: string;
  betterPrompt: string;
  whyBetter: string;
}

export const LEARN_LESSONS: LearnLesson[] = [
  {
    id: 1,
    title: '1. How to Give AI a Clear Goal',
    summary: 'Be direct about what outcome you want instead of being vague.',
    explanation: 'AI performs best when you specify the exact objective rather than asking open-ended or fuzzy questions. State the desired end result right at the start.',
    badPrompt: 'Write something about marketing.',
    betterPrompt: 'Act as a Senior Growth Marketer. Create a 30-day organic content marketing strategy for a new SaaS tool targeting remote software developers.',
    whyBetter: 'The better prompt defines the role, specific target audience (remote devs), timeline (30 days), and exact channel strategy.'
  },
  {
    id: 2,
    title: '2. How to Give Context',
    summary: 'Provide relevant background facts, constraints, and target audience details.',
    explanation: 'Without context, AI assumes average or generic scenarios. Supplying background info reduces assumptions and aligns output with your exact reality.',
    badPrompt: 'Write an email to my client about a delay.',
    betterPrompt: 'I run a web development agency. We are delaying a website launch by 4 days due to server migration testing. Write a polite, reassuring email to our enterprise client explaining the delay while emphasizing quality control.',
    whyBetter: 'It gives the company type, exact reason for delay (4 days, server migration), and desired tone (reassuring, professional).'
  },
  {
    id: 3,
    title: '3. How to Define AI\'s Role',
    summary: 'Assign a persona or specialist role to prime the AI\'s knowledge base.',
    explanation: 'Starting with "Act as a..." forces the LLM to weight vocabulary, tone, and domain expertise associated with that specific role.',
    badPrompt: 'Give me feedback on my code.',
    betterPrompt: 'Act as a Principal Staff Software Engineer specializing in React and TypeScript. Review the following code snippet for performance bottlenecks, accessibility defects, and clean architectural patterns.',
    whyBetter: 'By specifying Principal Staff Engineer level expertise, the AI adopts rigorous, enterprise-grade review criteria.'
  },
  {
    id: 4,
    title: '4. How to Give Specific Instructions',
    summary: 'Break down the task into numbered action steps.',
    explanation: 'Step-by-step instructions ensure AI does not skip vital requirements or combine distinct ideas together into messy paragraphs.',
    badPrompt: 'Help me plan a YouTube video.',
    betterPrompt: 'Plan a 10-minute YouTube video about personal finance: 1. Write 3 high-click hooks. 2. Outline 4 main sections with spoken bullet points. 3. Suggest visual B-roll cues. 4. Write a strong Call to Action for subscribing.',
    whyBetter: 'Clear numbered steps mandate every essential component of a viral YouTube video.'
  },
  {
    id: 5,
    title: '5. How to Set Constraints',
    summary: 'Explicitly state what the AI MUST NOT do or include.',
    explanation: 'Setting negative constraints prevents AI from outputting corporate buzzwords, long intros, irrelevant fluff, or unsupported claims.',
    badPrompt: 'Write a product description.',
    betterPrompt: 'Write a 100-word product description for an ergonomic mechanical keyboard. CONSTRAINTS: Do not use generic buzzwords like "game-changing", "revolutionary", or "unleash". Keep sentences under 15 words.',
    whyBetter: 'Banning specific clichés forces the AI to write crisp, authentic copy.'
  },
  {
    id: 6,
    title: '6. How to Request the Correct Output Format',
    summary: 'Specify exact layout: markdown table, bulleted list, JSON, or step-by-step code.',
    explanation: 'AI can output data in any structure. Asking for markdown tables, bullet points, or JSON makes the output immediately usable.',
    badPrompt: 'Compare iPhone 16 and Samsung S24.',
    betterPrompt: 'Compare iPhone 16 Pro and Samsung S24 Ultra in a Markdown Table with columns: Feature, iPhone 16 Pro, Samsung S24 Ultra, and Winner. Follow the table with a 2-paragraph summary.',
    whyBetter: 'The table format allows quick side-by-side scanning without reading dense paragraphs.'
  },
  {
    id: 7,
    title: '7. How to Give Examples (Few-Shot Prompting)',
    summary: 'Show the AI 1 or 2 examples of desired input -> output pairs.',
    explanation: 'Showing examples is the most reliable way to teach AI a custom formatting style, voice, or classification schema.',
    badPrompt: 'Write headlines in my style.',
    betterPrompt: 'Write 5 blog headlines for productivity tools following this exact pattern: Example 1: "Stop Wasting Time on Email: How Tool X Saved Me 5 Hours/Week" Example 2: "The 10-Minute Morning Routine That Doubled My Deep Work Output".',
    whyBetter: 'Providing exact pattern examples anchors the AI\'s output structure.'
  },
  {
    id: 8,
    title: '8. How to Ask AI to Improve Its Answer',
    summary: 'Iterate by asking the AI to critique and polish its own draft.',
    explanation: 'Prompts don\'t end after the first response. Asking AI "Critique your response above for clarity and rewrite it to be 20% more punchy" yields superior results.',
    badPrompt: 'Make it better.',
    betterPrompt: 'Critique the email draft above: 1. Identify 3 weak phrases. 2. Rewrite the draft to be more assertive and cut word count by 30%.',
    whyBetter: 'Gives explicit evaluation metrics for self-correction.'
  },
  {
    id: 9,
    title: '9. How to Build Multi-Step Prompts',
    summary: 'Chain complex workflows into logical phases.',
    explanation: 'For complex tasks like full ebooks, apps, or business strategies, break the prompt into Phase 1 (Outline/Research), Phase 2 (Drafting), Phase 3 (Refining).',
    badPrompt: 'Write me an entire ebook.',
    betterPrompt: 'We will write a 5-chapter guide on eCommerce branding. PHASE 1: Generate a detailed outline with sub-topics for each chapter. Stop and wait for my approval before drafting chapter 1.',
    whyBetter: 'Prevents token exhaustion and allows human control at each step.'
  },
  {
    id: 10,
    title: '10. Common Prompt Mistakes',
    summary: 'Avoid overloading, vagueness, contradictory instructions, or missing tone.',
    explanation: 'The top 3 prompt mistakes are: 1. Being too broad ("Explain science"). 2. Giving conflicting instructions. 3. Forgetting to specify target audience or tone.',
    badPrompt: 'Explain quantum computing simply but in full academic mathematical detail in 2 sentences.',
    betterPrompt: 'Explain the core concept of quantum computing (qubits & superposition) using a simple coin-spinning analogy for a high school student in under 150 words.',
    whyBetter: 'Removes contradictory constraints and provides a clear analogy framework.'
  }
];

export interface BeforeAfterExample {
  id: number;
  title: string;
  simplePrompt: string;
  engineeredPrompt: string;
  whyBetter: string;
}

export const BEFORE_AFTER_EXAMPLES: BeforeAfterExample[] = [
  {
    id: 1,
    title: 'Social Media Copywriting',
    simplePrompt: 'Write me a post about my clothing business.',
    engineeredPrompt: `ROLE: Senior Social Media Strategist & Fashion Brand Copywriter.
OBJECTIVE: Write a high-converting Instagram caption for the spring launch of an eco-friendly streetwear brand.
TARGET AUDIENCE: Gen Z and Millennials interested in sustainable fashion.
TONE: Stylish, authentic, urgent yet conversational.
STRUCTURE:
1. Hook line grabbing attention about sustainable fashion.
2. Short 2-sentence story about organic cotton sourcing.
3. Clear Call to Action (CTA) pointing to the link in bio for 15% off launch code.
4. 5 relevant trending hashtags (#SustainableStreetwear #EcoFashion...).`,
    whyBetter: 'Transforms a generic request into a targeted caption with hook, narrative, discount CTA, and hashtags.'
  },
  {
    id: 2,
    title: 'Coding & Debugging',
    simplePrompt: 'Fix my React code bug.',
    engineeredPrompt: `ROLE: Principal React/TypeScript Architect.
TASK: Debug the following React component that is causing infinite re-renders inside a useEffect hook.
INSTRUCTIONS:
1. Identify the root cause of the dependency array issue.
2. Provide the corrected component using modern React 18 hooks (useCallback/useMemo where appropriate).
3. Explain in 3 bullet points why the bug happened and how to avoid it in future components.`,
    whyBetter: 'Demands exact root cause analysis, refactored TypeScript code, and preventive learning notes.'
  },
  {
    id: 3,
    title: 'YouTube Video Script',
    simplePrompt: 'Make a YouTube script about making money online.',
    engineeredPrompt: `ROLE: Viral YouTube Content Strategist.
TOPIC: 5 Real Ways to Make $100/Day Online in 2026 (No Experience Needed).
DURATION: 8 minutes.
FORMAT: Full spoken voiceover script.
SECTIONS REQUIRED:
- Hook (0-15s): Pattern interrupt questioning common scam myths.
- Intro (15-45s): Value proposition & channel subscribe prompt.
- Main Body: 5 actionable strategies with real pros/cons and start cost.
- CTA & Outro: End screen recommendation.
CONSTRAINTS: Avoid pushy get-rich-quick claims. Keep tone transparent and grounded.`,
    whyBetter: 'Specifies duration, viral structure, spoken dialogue pacing, and anti-scam quality constraints.'
  }
];

export interface PromptTemplateItem {
  id: string;
  name: string;
  category: string;
  useCase: string;
  platform: string;
  promptText: string;
}

export const PROMPT_TEMPLATES: PromptTemplateItem[] = [
  {
    id: 'tpl-1',
    name: 'SaaS Value Proposition & Tagline Generator',
    category: 'Business',
    useCase: 'Create compelling marketing copy and hero taglines for SaaS tools',
    platform: 'ChatGPT',
    promptText: `Act as a World-Class SaaS Marketing Copywriter.
I am launching a new software product: [INSERT PRODUCT NAME & DESC].
TARGET AUDIENCE: [INSERT AUDIENCE, e.g. Freelancers, Marketers, Devs].
Deliver:
1. 3 Punchy Hero Headlines (Under 10 words).
2. 3 Sub-headlines detailing primary benefit.
3. 5 Bullet points highlighting key features translated into customer outcomes.
4. 2 Call-to-Action button text options.`
  },
  {
    id: 'tpl-2',
    name: 'Viral YouTube Scriptwriter Master Prompt',
    category: 'YouTube Scripts',
    useCase: 'Generate complete retention-focused YouTube voiceover scripts',
    platform: 'Gemini',
    promptText: `You are a YouTube Viral Creator & Script Strategist.
Create a complete spoken YouTube video script for topic: "[INSERT TOPIC]".
DURATION: [INSERT DURATION, e.g. 10 minutes].
TONE: [INSERT TONE, e.g. Energetic, Analytical].
INCLUDE:
- High-retention Hook (First 15 seconds)
- Spoken Intro & Expectations
- 4 Detailed Main Sections with visual B-roll cues tagged as [VISUAL: ...]
- Mid-video engagement trigger
- High-converting Call to Action and Outro.`
  },
  {
    id: 'tpl-3',
    name: 'Midjourney Photorealistic Image Prompt',
    category: 'AI Image Generation',
    useCase: 'Generate cinema-quality photorealistic Midjourney or Flux prompts',
    platform: 'AI Image Generator',
    promptText: `Photorealistic cinematic shot of [INSERT SUBJECT, e.g. an elderly craftsman in a warm wooden studio], golden hour volumetric lighting, shot on 85mm f/1.4 lens, shallow depth of field, hyper-detailed skin texture and fabric weave, atmospheric dust particles, 8k resolution, color graded cinematic --ar 16:9 --style raw --v 6.0`
  },
  {
    id: 'tpl-4',
    name: 'React/Node Code Refactor & Type Safety Auditor',
    category: 'Coding & Technology',
    useCase: 'Refactor messy TypeScript/React code for performance and clean architecture',
    platform: 'Coding AI',
    promptText: `Act as a Senior Principal Frontend Architect.
Review and refactor the following code snippet:
[PASTE CODE HERE]
REQUIREMENTS:
1. Enforce strict TypeScript types and eliminate 'any'.
2. Fix potential memory leaks or unneeded re-renders.
3. Clean up formatting and modularize complex functions.
4. Return the complete refactored code followed by a bulleted changelog.`
  },
  {
    id: 'tpl-5',
    name: 'Cold Outreach Email That Converts',
    category: 'Email Writing',
    useCase: 'Draft high-reply cold B2B sales emails',
    platform: 'Claude',
    promptText: `Act as a Top 1% B2B Sales Specialist.
Write a 3-sentence cold email to [INSERT TARGET TITLE, e.g. Head of Marketing] offering [INSERT SERVICE/TOOL].
RULES:
- Word count MUST be under 80 words.
- Sentence 1: Relevant, non-creepy personalized opener.
- Sentence 2: Specific problem solved + social proof metric.
- Sentence 3: Low-friction call to interest (e.g., "Open to taking a look at a 2-min video?").
- Subject line: 3 words or fewer, all lowercase.`
  },
  {
    id: 'tpl-6',
    name: 'SEO Blog Post Article Generator',
    category: 'SEO Content',
    useCase: 'Generate long-form SEO optimized blog posts with subheadings',
    platform: 'ChatGPT',
    promptText: `Act as a Senior SEO Content Specialist.
Write a comprehensive, search-optimized blog post for primary keyword: "[INSERT KEYWORD]".
SECONDARY KEYWORDS: [INSERT KEYWORDS].
STRUCTURE:
- Catchy H1 Title containing primary keyword
- Engaging Hook Intro with a bold promise
- Table of Contents
- H2 and H3 Subheadings covering key questions
- FAQ section answering top search queries
- Conclusion with key takeaway summary.`
  },
  {
    id: 'tpl-7',
    name: 'Cinematic AI Video Scene Prompt (Runway/Sora/Veo)',
    category: 'AI Video Generation',
    useCase: 'Prompt AI Video models for smooth motion and dramatic cinematic scenes',
    platform: 'AI Video Generator',
    promptText: `Cinematic slow-motion camera pan right across [INSERT SCENE, e.g. a futuristic neon-lit city street in heavy rain], wet reflections on asphalt, anamorphic lens flare, 4k ultra-detailed, 24fps motion, dramatic moody lighting, photorealistic cinematic render`
  },
  {
    id: 'tpl-8',
    name: 'E-commerce Product Description That Sells',
    category: 'E-commerce',
    useCase: 'Create compelling Shopify/Amazon product copy highlighting benefits',
    platform: 'ChatGPT',
    promptText: `Act as an E-commerce Conversion Copywriter.
Product: [INSERT PRODUCT NAME].
Features: [LIST FEATURES].
Target Customer: [INSERT CUSTOMER TYPE].
Output:
1. Attention-grabbing Product Title.
2. 2-sentence emotional hook describing the problem solved.
3. 5 bullet points framing features as tangible benefits.
4. Care/specs table.
5. Guarantee / risk-reversal statement.`
  }
];
