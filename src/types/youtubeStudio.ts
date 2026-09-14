export type VoiceGender = 'male' | 'female' | 'unspecified';
export type VoiceTone = 'young' | 'mature' | 'deep' | 'energetic' | 'calm' | 'documentary' | 'storytelling' | 'authoritative' | 'friendly';

export interface VoiceConfig {
  gender: VoiceGender;
  tone: VoiceTone;
  language: string;
  accent: string;
  speed: string; // e.g. "1.0x Normal", "1.1x Fast"
}

export interface CharacterProfile {
  id: string;
  name: string;
  age: string;
  gender: string;
  appearance: string;
  hairstyle: string;
  clothing: string;
  personality: string;
  voice: string;
  role: string; // e.g., "Main Presenter", "Customer", "Expert", "Narrator"
}

export interface ScenePlan {
  sceneNumber: string; // e.g., "Scene 01"
  timestamp: string; // e.g., "00:00–00:08"
  durationSeconds: number;
  narration: string;
  visualDescription: string;
  cameraShot: string; // e.g. "Slow cinematic push-in"
  cameraMovement: string; // e.g. "Tracking shot"
  characterAction?: string;
  environment: string;
  onScreenText?: string;
  soundEffects?: string;
  musicDirection?: string;
  imagePrompt: string;
  videoPromptImageToVideo: string;
  videoPromptTextToVideo: string;
  isFaceless?: boolean;
  generatedImageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface BRollSection {
  sectionId: string;
  sceneNumber: string;
  description: string;
  searchKeywords: string[];
  aiImagePrompt: string;
  aiVideoPrompt: string;
  recommendedDurationSeconds: number;
}

export interface ChapterTimestamp {
  timestamp: string;
  title: string;
}

export interface SeoData {
  mainTitle: string;
  alternativeTitles: string[];
  description: string;
  keywords: string[];
  tags: string[];
  hashtags: string[];
  chapters: ChapterTimestamp[];
  pinnedComment: string;
  callToAction: string;
  seoScore: number;
  seoFeedback: string[];
}

export interface ThumbnailConcept {
  conceptNumber: number;
  title: string;
  textOverlay: string;
  visualComposition: string;
  characterPositioning: string;
  facialExpression: string;
  backgroundDescription: string;
  colorDirection: string;
  aiPrompt: string;
  generatedImageUrl?: string;
  isGenerating?: boolean;
}

export interface RetentionMetrics {
  overallScore: number;
  hookStrengthScore: number;
  hookAnalysis: string;
  weakSections: string[];
  potentialDropOffPoints: string[];
  patternInterrupts: string[];
  curiosityLoops: string[];
  openLoops: string[];
  ctaPlacementAdvice: string;
}

export interface ExpertStrategy {
  contentStrategy: string;
  audiencePersona: string;
  searchIntent: string;
  competitorAngle: string;
  uniqueAngle: string;
  keywordStrategy: string;
  retentionStrategy: string;
  scenePacing: string;
  visualStrategy: string;
  monetizationCTA: string;
  sponsorshipPlacement: string;
}

export interface ScriptSection {
  title: string;
  content: string;
  visualCue?: string;
}

export interface ScriptMainSection {
  heading: string;
  spokenText: string;
}

export interface YouTubeScriptSeo {
  youtubeTitle: string;
  alternativeTitles: string[];
  description: string;
  keywords: string[];
  tags: string[];
  hashtags: string[];
  chapters: { timestamp: string; title: string }[];
  pinnedComment: string;
}

export interface ScriptOnlyProject {
  id: string;
  topic: string;
  niche: string;
  customNiche?: string;
  videoType: string;
  duration: string;
  tone: string;
  speaker: string;
  inputLanguage: string;
  outputLanguage: string;
  
  // Generated Script Content
  videoTitle: string;
  hook: string;
  intro: string;
  mainSections: ScriptMainSection[];
  examples: string[];
  transitions: string[];
  callToAction: string;
  ending: string;
  fullScriptText: string;
  
  // Optional SEO Metadata
  seo: YouTubeScriptSeo;
  
  createdAt: string;
  updatedAt: string;
}

export interface ScriptOnlyInput {
  topic: string;
  niche: string;
  customNiche?: string;
  videoType: string;
  duration: string;
  customDuration?: string;
  tone: string;
  speaker: string;
  inputLanguage: string;
  outputLanguage: string;
}


export interface CompleteScript {
  hook: string;
  intro: string;
  mainSections: ScriptSection[];
  examples: string[];
  transitions: string[];
  emotionalBeats: string[];
  callToAction: string;
  ending: string;
  fullFormattedText: string;
}

export interface YouTubeProject {
  id: string;
  title: string;
  topic: string;
  niche: string;
  videoType: string;
  durationLabel: string;
  targetWordCount: number;
  styleTone: string;
  hookStyle: string;
  isFacelessMode: boolean;
  isCharacterMode: boolean;
  voiceConfig: VoiceConfig;
  characters: CharacterProfile[];
  hook: {
    text: string;
    style: string;
    retentionHookReason: string;
  };
  completeScript: CompleteScript;
  scenes: ScenePlan[];
  bRollSections: BRollSection[];
  seo: SeoData;
  thumbnails: ThumbnailConcept[];
  retention: RetentionMetrics;
  expertStrategy?: ExpertStrategy;
  createdAt: string;
  updatedAt: string;
}

export interface YouTubeGeneratorInput {
  topic: string;
  niche: string;
  customNiche?: string;
  videoType: string;
  durationLabel: string; // e.g. "5 minutes" or "60 seconds"
  customDurationSeconds?: number;
  styleTone: string;
  hookStyle?: string;
  isFacelessMode: boolean;
  isCharacterMode: boolean;
  voiceConfig: VoiceConfig;
  characters: CharacterProfile[];
  enableExpertMode?: boolean;
  expertInputs?: Partial<ExpertStrategy>;
}
