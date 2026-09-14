import { aiService } from './aiService';
import {
  YouTubeGeneratorInput,
  YouTubeProject,
  ScenePlan,
  BRollSection,
  CharacterProfile,
  ThumbnailConcept,
  ScriptOnlyInput,
  ScriptOnlyProject,
  YouTubeScriptSeo,
} from '../types/youtubeStudio';

const LOCAL_STORAGE_KEY = 'ai_youtube_studio_projects_v1';
const SCRIPT_ONLY_STORAGE_KEY = 'ai_youtube_script_projects_v2';

/**
 * Builds system prompt specifically for Script-Only YouTube Generation
 */
function buildScriptOnlyPrompt(input: ScriptOnlyInput): string {
  const nicheName = input.niche === 'Custom Niche' ? input.customNiche || 'General YouTube' : input.niche;
  const durationText = input.duration === 'Custom' ? input.customDuration || '5 minutes' : input.duration;

  const nicheAdaptations: Record<string, string> = {
    Finance: 'Trustworthy, analytical, grounded, wealth-oriented, transparent.',
    Gaming: 'High-energy, entertaining, fast-paced, engaging gamer terminology.',
    Documentary: 'Cinematic, narrative-driven, informative, suspenseful research-backed storytelling.',
    Education: 'Clear, structured, easy to digest, using analogies and practical examples.',
    Comedy: 'Humorous, fast-paced, witty, clever observations, punchy setup and punchlines.',
    Motivation: 'Emotional, inspiring, powerful, highly energetic driving personal accountability.',
    'AI & Technology': 'Practical, cutting-edge, forward-thinking, informative with real-world applications.',
    News: 'Fast-paced, objective, high-stakes breaking coverage.',
    'True Crime': 'Mysterious, respectful, atmospheric, intense investigative narrative.',
  };

  const toneStyle = nicheAdaptations[nicheName] || `Matches tone "${input.tone}" with high retention and clear conversational flow.`;

  const speakerInstruction = (input.speaker === 'Two Speakers' || input.speaker === 'Multiple Characters')
    ? `IMPORTANT MULTIPLE SPEAKERS FORMAT: You MUST label every single spoken line with speaker names in UPPERCASE (e.g., ALEX: [dialogue...], SARAH: [dialogue...], NARRATOR: [narration...]). Create natural back-and-forth dialogue, questions, and reactions.`
    : `SINGLE SPEAKER / NARRATOR FORMAT: Write a continuous, spoken voiceover or presenter script directly addressing the viewer.`;

  return `You are a world-class YouTube Viral Scriptwriter & Content Strategist.
Generate a COMPLETE, READY-TO-RECORD YOUTUBE SCRIPT and separate SEO METADATA.

CRITICAL DIRECTIVES:
1. SCRIPT ONLY. Do NOT generate videos, images, image prompts, video prompts, thumbnails, B-roll, video files, or image-to-video content.
2. WRITE THE EXACT SPOKEN WORDS the presenter/narrator will say from beginning to end.
3. DO NOT write an outline, summary, bulleted notes, or placeholder text. Write the complete, finished, ready-to-record script.
4. Input Language: ${input.inputLanguage || 'English'}. Output Language: ${input.outputLanguage || 'English'}.
5. If the user writes in Somali (or any other language), understand the topic naturally and create the full script in ${input.outputLanguage || 'English'}.

USER SPECIFICATIONS:
- Topic / Video Idea: "${input.topic}"
- Niche: "${nicheName}"
- Video Type: "${input.videoType}"
- Duration: "${durationText}"
- Tone: "${input.tone}"
- Speaker Structure: "${input.speaker}"
- Style Adaptation: ${toneStyle}

${speakerInstruction}

REQUIRED SCRIPT SECTIONS:
1. Video Title: Catchy main title
2. Strong Hook: First 5-15 seconds hook to grab attention immediately
3. Introduction: Introduce topic and set viewer expectations
4. Main Content: Comprehensive, step-by-step spoken script divided into logical sub-sections
5. Natural Transitions: Smooth spoken bridge phrases connecting points
6. Examples / Stories: Concrete real-world examples or short story arcs embedded in dialogue
7. Call to Action: Engaging subscribe, like, and comment prompt
8. Ending: Strong sign-off and conclusion

OPTIONAL SEO METADATA (Generated separately):
- YouTube Title
- 5 Alternative Titles
- Description (with chapter timestamps)
- Keywords & Tags
- Hashtags
- Chapters / Timestamps
- Pinned Comment

Respond strictly in valid JSON format matching this schema:
{
  "videoTitle": "Main Video Title",
  "hook": "Spoken hook text...",
  "intro": "Spoken introduction text...",
  "mainSections": [
    {
      "heading": "Section Heading",
      "spokenText": "Full spoken narration/dialogue for this section..."
    }
  ],
  "examples": ["Example or story 1..."],
  "transitions": ["Transition phrase 1..."],
  "callToAction": "Spoken Call to Action...",
  "ending": "Spoken ending sign-off...",
  "fullScriptText": "Full formatted complete script combining hook, intro, main sections, CTA, and ending with speaker tags if multiple speakers",
  "seo": {
    "youtubeTitle": "Main YouTube Title",
    "alternativeTitles": ["Alt Title 1", "Alt Title 2", "Alt Title 3", "Alt Title 4", "Alt Title 5"],
    "description": "Full YouTube description with chapters...",
    "keywords": ["keyword1", "keyword2"],
    "tags": ["tag1", "tag2"],
    "hashtags": ["#hashtag1", "#hashtag2"],
    "chapters": [
      { "timestamp": "00:00", "title": "Hook & Intro" }
    ],
    "pinnedComment": "Pinned comment text..."
  }
}`;
}

/**
 * Main AI Script Generator for YouTube Scripts ONLY
 */
export async function generateYouTubeScriptOnly(
  input: ScriptOnlyInput,
  user?: any
): Promise<ScriptOnlyProject> {
  const prompt = buildScriptOnlyPrompt(input);

  try {
    const res = await aiService.generateText({
      user,
      prompt,
      toolType: 'ai-youtube-script',
      targetLanguage: input.outputLanguage,
    });

    if (res.success && res.data?.result) {
      let rawText = res.data.result.trim();
      // Clean markdown code blocks if wrapped
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
      }

      try {
        const parsed = JSON.parse(rawText);
        const scriptProject: ScriptOnlyProject = {
          id: 'script-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          topic: input.topic,
          niche: input.niche,
          customNiche: input.customNiche,
          videoType: input.videoType,
          duration: input.duration === 'Custom' ? input.customDuration || 'Custom' : input.duration,
          tone: input.tone,
          speaker: input.speaker,
          inputLanguage: input.inputLanguage,
          outputLanguage: input.outputLanguage,

          videoTitle: parsed.videoTitle || input.topic,
          hook: parsed.hook || '',
          intro: parsed.intro || '',
          mainSections: parsed.mainSections || [],
          examples: parsed.examples || [],
          transitions: parsed.transitions || [],
          callToAction: parsed.callToAction || '',
          ending: parsed.ending || '',
          fullScriptText: parsed.fullScriptText || buildFullFormattedScript(parsed),
          seo: {
            youtubeTitle: parsed.seo?.youtubeTitle || parsed.videoTitle || input.topic,
            alternativeTitles: parsed.seo?.alternativeTitles || [],
            description: parsed.seo?.description || '',
            keywords: parsed.seo?.keywords || [],
            tags: parsed.seo?.tags || [],
            hashtags: parsed.seo?.hashtags || [],
            chapters: parsed.seo?.chapters || [],
            pinnedComment: parsed.seo?.pinnedComment || '',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveScriptOnlyProjectHistory(scriptProject);
        return scriptProject;
      } catch (jsonErr) {
        console.warn('Failed to parse JSON script output, fallback formatting:', jsonErr);
        // Fallback cleanly using rawText as complete script text
        const fallbackProject = createFallbackScriptProject(input, rawText);
        saveScriptOnlyProjectHistory(fallbackProject);
        return fallbackProject;
      }
    }
  } catch (err) {
    console.error('generateYouTubeScriptOnly error:', err);
  }

  // Final fallback
  const fallbackProject = createFallbackScriptProject(input);
  saveScriptOnlyProjectHistory(fallbackProject);
  return fallbackProject;
}

function buildFullFormattedScript(parsed: any): string {
  let text = '';
  if (parsed.videoTitle) text += `TITLE: ${parsed.videoTitle}\n\n`;
  if (parsed.hook) text += `[HOOK]\n${parsed.hook}\n\n`;
  if (parsed.intro) text += `[INTRO]\n${parsed.intro}\n\n`;
  if (Array.isArray(parsed.mainSections)) {
    parsed.mainSections.forEach((sec: any) => {
      text += `[${sec.heading || 'SECTION'}]\n${sec.spokenText}\n\n`;
    });
  }
  if (parsed.callToAction) text += `[CALL TO ACTION]\n${parsed.callToAction}\n\n`;
  if (parsed.ending) text += `[ENDING]\n${parsed.ending}\n\n`;
  return text.trim();
}

function createFallbackScriptProject(input: ScriptOnlyInput, rawText?: string): ScriptOnlyProject {
  const isMultiSpeaker = input.speaker === 'Two Speakers' || input.speaker === 'Multiple Characters';
  const nicheName = input.niche === 'Custom Niche' ? input.customNiche || 'YouTube' : input.niche;

  const defaultHook = `Have you ever wondered why 90% of people struggle with ${input.topic || 'achieving their goals'}, while a tiny 1% seem to succeed effortlessly? Today, we are breaking down the exact strategy.`;

  const defaultIntro = `Welcome back to the channel! In this video, we're taking a deep dive into ${input.topic || 'this exact topic'}, giving you actionable steps you can use right away.`;

  const defaultMain = [
    {
      heading: '1. The Core Secret',
      spokenText: isMultiSpeaker
        ? `ALEX: The biggest mistake most people make when starting with ${input.topic} is overcomplicating step one.\nSARAH: Exactly! They spend weeks planning instead of executing. Here is what you should do instead...`
        : `Let's start with the fundamental breakdown of ${input.topic}. Most people think it requires years of experience, but the truth is far simpler if you focus on these key principles.`
    },
    {
      heading: '2. The Practical Blueprint',
      spokenText: isMultiSpeaker
        ? `ALEX: Once you understand the foundation, the second phase is pure implementation.\nNARRATOR: Here is the step-by-step process you need to follow...`
        : `Next, let's look at how to put this into practice immediately. Step one is organizing your workflow. Step two is maintaining consistency day after day.`
    }
  ];

  const defaultCTA = `If you're finding this breakdown valuable so far, hit that subscribe button and drop a comment down below with your thoughts!`;
  const defaultEnding = `Thanks for watching, and I'll see you in the very next video!`;

  const fullScript = rawText || `TITLE: ${input.topic}\n\n[HOOK]\n${defaultHook}\n\n[INTRO]\n${defaultIntro}\n\n[MAIN CONTENT]\n${defaultMain.map(m => `--- ${m.heading} ---\n${m.spokenText}`).join('\n\n')}\n\n[CALL TO ACTION]\n${defaultCTA}\n\n[ENDING]\n${defaultEnding}`;

  return {
    id: 'script-' + Date.now(),
    topic: input.topic,
    niche: nicheName,
    customNiche: input.customNiche,
    videoType: input.videoType,
    duration: input.duration,
    tone: input.tone,
    speaker: input.speaker,
    inputLanguage: input.inputLanguage,
    outputLanguage: input.outputLanguage,

    videoTitle: input.topic,
    hook: defaultHook,
    intro: defaultIntro,
    mainSections: defaultMain,
    examples: [`Real-world case study applying ${input.topic} in ${nicheName}`],
    transitions: ['Now moving on to the next critical point...'],
    callToAction: defaultCTA,
    ending: defaultEnding,
    fullScriptText: fullScript,

    seo: {
      youtubeTitle: input.topic,
      alternativeTitles: [
        `The Ultimate Guide to ${input.topic}`,
        `Why Everyone Is Talking About ${input.topic}`,
        `How to Master ${input.topic} (Step by Step)`,
        `5 Mistakes to Avoid with ${input.topic}`,
        `The Secret Blueprint for ${input.topic}`,
      ],
      description: `In this video, we explore ${input.topic} in depth.\n\n00:00 - Introduction & Hook\n01:15 - Main Strategy\n04:30 - Key Takeaways\n\nDon't forget to like and subscribe for more ${nicheName} content!`,
      keywords: [input.topic, nicheName, 'YouTube script', 'tutorial', 'guide'],
      tags: [input.topic.toLowerCase(), nicheName.toLowerCase(), 'tutorial', '2026'],
      hashtags: [`#${nicheName.replace(/\s+/g, '')}`, '#YouTube', '#Script'],
      chapters: [
        { timestamp: '00:00', title: 'Hook & Introduction' },
        { timestamp: '01:00', title: 'Core Strategy' },
        { timestamp: '03:30', title: 'Implementation & Summary' },
      ],
      pinnedComment: `What was your biggest takeaway from today's video? Let us know in the comments!`,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Script Only History Storage
 */
export function getScriptOnlyHistory(): ScriptOnlyProject[] {
  try {
    const data = localStorage.getItem(SCRIPT_ONLY_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading script history:', err);
  }
  return [];
}

export function saveScriptOnlyProjectHistory(project: ScriptOnlyProject): void {
  try {
    const existing = getScriptOnlyHistory();
    const index = existing.findIndex((p) => p.id === project.id);
    let updated: ScriptOnlyProject[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [project, ...existing];
    }
    localStorage.setItem(SCRIPT_ONLY_STORAGE_KEY, JSON.stringify(updated.slice(0, 30)));
  } catch (err) {
    console.error('Error saving script history:', err);
  }
}

export function deleteScriptOnlyHistory(id: string): void {
  try {
    const existing = getScriptOnlyHistory();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(SCRIPT_ONLY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting script history:', err);
  }
}


/**
 * Calculates estimated word count based on duration input
 */
export function calculateTargetWordCount(durationLabel: string, customSeconds?: number): number {
  if (customSeconds && customSeconds > 0) {
    return Math.round((customSeconds / 60) * 150);
  }

  const label = durationLabel.toLowerCase();
  if (label.includes('30s') || label.includes('30 sec')) return 75;
  if (label.includes('60s') || label.includes('60 sec') || label.includes('1 min')) return 150;
  if (label.includes('2 min')) return 300;
  if (label.includes('5 min')) return 750;
  if (label.includes('8 min')) return 1200;
  if (label.includes('10 min')) return 1500;
  if (label.includes('15 min')) return 2250;
  if (label.includes('20 min')) return 3000;

  // Extract number from string
  const numMatch = label.match(/(\d+)/);
  if (numMatch) {
    const mins = parseInt(numMatch[1], 10);
    return mins * 150;
  }

  return 750; // Default 5 mins
}

/**
 * Builds system prompt instructing Gemini to output strict JSON
 */
function buildGeminiPrompt(input: YouTubeGeneratorInput, wordCount: number): string {
  const nicheName = input.niche === 'Other / Custom Niche' ? input.customNiche || 'General YouTube' : input.niche;
  const isFaceless = input.isFacelessMode;
  const isCharacter = input.isCharacterMode;

  const charactersInfo = input.characters.length > 0
    ? input.characters.map((c, i) => `Character ${i + 1}: Name="${c.name}", Age="${c.age}", Role="${c.role}", Appearance="${c.appearance}", Clothing="${c.clothing}", Voice="${c.voice}"`).join('; ')
    : 'No pre-created characters. (If character mode is enabled, auto-generate 1-2 consistent characters)';

  return `You are a world-class YouTube Video Production Director & Viral Scriptwriter.
You must generate a complete, professional, production-ready YouTube Content & Video Production Package in valid JSON format.

USER INPUT SPECIFICATIONS:
- Topic / Video Idea: "${input.topic}"
- Niche: "${nicheName}"
- Video Type: "${input.videoType}"
- Duration: "${input.durationLabel}" (Target Word Count: ~${wordCount} words)
- Script Style/Tone: "${input.styleTone}"
- Hook Style: "${input.hookStyle || 'Curiosity'}"
- Faceless Mode: ${isFaceless ? 'ENABLED (Focus on stock visuals, screen recordings, B-roll, motion graphics, text animations, voiceover)' : 'DISABLED'}
- Character Mode: ${isCharacter ? 'ENABLED (Prioritize character dialogue, interactions, facial expressions, visual consistency)' : 'DISABLED'}
- Voice Direction: Gender=${input.voiceConfig.gender}, Tone=${input.voiceConfig.tone}, Language=${input.voiceConfig.language}, Accent=${input.voiceConfig.accent}, Speed=${input.voiceConfig.speed}
- Pre-defined Characters: ${charactersInfo}
${input.enableExpertMode ? '- Expert Strategy requested: Provide deep audience persona, competitor angle, unique angle, keyword strategy, and monetization advice.' : ''}

CRITICAL RULES FOR GENERATION:
1. No false facts or fabricated statistics presented as real.
2. Script must use natural spoken language suitable for voice actors or AI voice synthesis.
3. Every scene MUST contain BOTH an IMAGE PROMPT (for text-to-image) and a VIDEO PROMPT (for image-to-video and text-to-video).
4. Maintain consistent character appearance and visual continuity across all scene prompts.
5. Provide B-Roll recommendations with search keywords and prompts.
6. Provide YouTube SEO metadata (Title, 5 alternatives, description with chapters/timestamps, tags, hashtags, pinned comment, CTA, score).
7. Provide 3 distinct high-CTR thumbnail concepts with AI image prompts.
8. Output ONLY a valid JSON object matching the required schema structure below. Do NOT wrap in markdown backticks or text outside JSON.

JSON SCHEMA TO RETURN:
{
  "title": "Main Project Title",
  "hook": {
    "text": "The exact high-retention opening spoken hook",
    "style": "Hook Style Name",
    "retentionHookReason": "Why this hook retains viewers"
  },
  "completeScript": {
    "hook": "Spoken hook text",
    "intro": "Spoken introduction text",
    "mainSections": [
      {
        "title": "Section 1 Title",
        "content": "Full spoken narration for section 1...",
        "visualCue": "Visual direction cue"
      }
    ],
    "examples": ["Concrete example 1", "Concrete example 2"],
    "transitions": ["Smooth transition phrasing 1"],
    "emotionalBeats": ["Tone shift cue at minute 2:00"],
    "callToAction": "Spoken call to action",
    "ending": "Spoken outro closing",
    "fullFormattedText": "The complete combined spoken voiceover script text with timing markers"
  },
  "characters": [
    {
      "id": "char-1",
      "name": "Presenter Alex",
      "age": "28",
      "gender": "Male",
      "appearance": "Short dark hair, athletic build, friendly warm smile",
      "hairstyle": "Neat modern crop",
      "clothing": "Navy blue linen shirt, minimal silver watch",
      "personality": "Energetic, articulate, trustworthy tech guide",
      "voice": "Confident, energetic American male",
      "role": "Main Presenter"
    }
  ],
  "scenes": [
    {
      "sceneNumber": "Scene 01",
      "timestamp": "00:00–00:08",
      "durationSeconds": 8,
      "narration": "Spoken narration for scene 01...",
      "visualDescription": "Detailed scene visual description...",
      "cameraShot": "Medium Close-Up",
      "cameraMovement": "Slow cinematic push-in",
      "characterAction": "Alex looks directly into camera with intense focus, gesturing towards a glowing holographic screen",
      "environment": "Modern minimalist studio with ambient neon accent lighting",
      "onScreenText": "7 AI TOOLS THAT CHANGE EVERYTHING",
      "soundEffects": "Whoosh transit audio effect, digital chime",
      "musicDirection": "Suspenseful synth opening beat transitioning into rhythmic lo-fi tech groove",
      "imagePrompt": "A detailed 8k cinematic photo of a 28yo tech presenter in navy blue shirt standing in a high-tech illuminated studio, glowing holographic AI interface in foreground, shallow depth of field, 35mm lens, 16:9 aspect ratio, hyper-realistic, volumetric lighting",
      "videoPromptImageToVideo": "Cinematic slow camera push-in towards male tech presenter in navy shirt as ambient holographic nodes drift softly around him, subtle facial expression change from serious to enthusiastic, smooth motion, 24fps",
      "videoPromptTextToVideo": "Hyper-realistic 4K video of male tech presenter in dark studio speaking directly to camera, dynamic neon backlighting, glowing AI graphics floating in air, smooth slow dolly-in motion, 8 seconds duration"
    }
  ],
  "bRollSections": [
    {
      "sectionId": "broll-1",
      "sceneNumber": "Scene 02",
      "description": "Quick montage of small business owner working late at laptop",
      "searchKeywords": ["entrepreneur late night laptop", "small business stress", "workspace night"],
      "aiImagePrompt": "Cinematic photo of tired entrepreneur working at desk at night, coffee cup beside laptop, soft desk lamp glow, 8k",
      "aiVideoPrompt": "Time-lapse of entrepreneur working on laptop late at night with clock moving fast on wall, subtle camera movement, 4 seconds",
      "recommendedDurationSeconds": 4
    }
  ],
  "seo": {
    "mainTitle": "Primary SEO Optimized YouTube Title",
    "alternativeTitles": [
      "Alt Title 1",
      "Alt Title 2",
      "Alt Title 3",
      "Alt Title 4",
      "Alt Title 5"
    ],
    "description": "Full YouTube Video Description including intro paragraph, chapter timestamps, key links, and disclaimer.",
    "keywords": ["keyword 1", "keyword 2", "keyword 3"],
    "tags": ["tag1", "tag2", "tag3"],
    "hashtags": ["#AI", "#YouTube", "#Productivity"],
    "chapters": [
      { "timestamp": "00:00", "title": "The Shocking Reality" },
      { "timestamp": "00:45", "title": "Tool #1: Automatic Workflows" }
    ],
    "pinnedComment": "Engaging question or prompt for subscribers to leave in the comments.",
    "callToAction": "Subscribe and drop your favorite tool in comments below!",
    "seoScore": 96,
    "seoFeedback": [
      "Strong keyword presence in first 60 characters of title",
      "Comprehensive chapter breakdown enhances search indexability"
    ]
  },
  "thumbnails": [
    {
      "conceptNumber": 1,
      "title": "High Impact Shocked Expression",
      "textOverlay": "STOP WASTING TIME!",
      "visualComposition": "Split screen layout with presenter pointing at glowing red AI clock on right",
      "characterPositioning": "Presenter on left side, 1/3 grid alignment, expressive face",
      "facialExpression": "Shocked eyes wide, hand pointing at screen",
      "backgroundDescription": "Dark studio canvas with explosive neon orange accent light glow",
      "colorDirection": "High-contrast Yellow, Orange, and Dark Slate Blue",
      "aiPrompt": "YouTube thumbnail graphic: 28yo tech presenter on left side with shocked expression pointing finger at a glowing holographic clock displaying '10 HOURS SAVED', vibrant high contrast colors, yellow text overlay 'STOP WASTING TIME!', 4K resolution, 16:9 aspect ratio"
    }
  ],
  "retention": {
    "overallScore": 94,
    "hookStrengthScore": 98,
    "hookAnalysis": "Hook opens with an immediate pain point and high stakes question.",
    "weakSections": ["Section 3 transitions slightly slow - added pattern interrupt visual cue"],
    "potentialDropOffPoints": ["Minute 03:15 when introducing technical explanation - overcome with on-screen graphic"],
    "patternInterrupts": ["Scene 03 zoom punch-in", "Scene 05 sound effect trigger"],
    "curiosityLoops": ["Open loop created at 00:30 regarding the #1 secret tool saved for the end"],
    "openLoops": ["Will the workflow scale to 100+ tasks?"],
    "ctaPlacementAdvice": "Primary CTA positioned at 75% mark before wrap-up to capture maximum viewers."
  },
  "expertStrategy": {
    "contentStrategy": "Target high-intent search traffic with problem-solving angle",
    "audiencePersona": "Busy small business owners and freelancers seeking leverage",
    "searchIntent": "Transactional & Informational query for productivity tools",
    "competitorAngle": "Differentiate from generic lists by giving exact step-by-step implementation workflows",
    "uniqueAngle": "Focus on ROI (10 hours saved) rather than technical feature lists",
    "keywordStrategy": "Target low-competition long-tail keywords in primary description paragraph",
    "retentionStrategy": "Implement pattern interrupts every 12 seconds with text overlays and b-roll cuts",
    "scenePacing": "Fast-paced first 60 seconds (6s average cut length), steady mid-roll pacing (10s average)",
    "visualStrategy": "Use contrasting blue/orange color grade with high-tech UI graphic callouts",
    "monetizationCTA": "Promote affiliate software link in top 2 lines of video description",
    "sponsorshipPlacement": "Ideal sponsor integration spot at 03:45 between Tool 3 and Tool 4"
  }
}`;
}

/**
 * Fallback generator in case Gemini text call fails or returns malformed text
 */
function createFallbackProject(input: YouTubeGeneratorInput, wordCount: number): YouTubeProject {
  const niche = input.niche === 'Other / Custom Niche' ? input.customNiche || 'General Niche' : input.niche;
  const topic = input.topic || '7 AI Tools to Save 10 Hours Every Week';
  const isFaceless = input.isFacelessMode;
  const isShorts = input.videoType.toLowerCase().includes('shorts') || input.durationLabel.includes('30') || input.durationLabel.includes('60');
  const durationSec = isShorts ? 60 : 300;

  const charList: CharacterProfile[] = input.characters.length > 0 ? input.characters : [
    {
      id: 'char-1',
      name: 'Host Alex',
      age: '28',
      gender: input.voiceConfig.gender === 'female' ? 'Female' : 'Male',
      appearance: 'Modern professional creator, confident smile, clean aesthetic',
      hairstyle: 'Neat styled hair',
      clothing: 'Smart casual jacket over dark crewneck tshirt',
      personality: 'Enthusiastic, clear, relatable guide',
      voice: `${input.voiceConfig.tone} ${input.voiceConfig.accent} voice`,
      role: 'Main Presenter',
    },
  ];

  const scenes: ScenePlan[] = [
    {
      sceneNumber: 'Scene 01',
      timestamp: '00:00–00:08',
      durationSeconds: 8,
      narration: `What if you could automate the most exhausting part of your week in under 5 minutes? ${topic.slice(0, 80)}... Most people have no idea this exists.`,
      visualDescription: `Cinematic opening scene highlighting ${topic}. High energy visuals with dynamic light glow and floating holographic interface elements.`,
      cameraShot: 'Medium Close-up',
      cameraMovement: 'Slow cinematic push-in',
      characterAction: isFaceless ? undefined : 'Presenter looks directly at camera, gesturing with open hands in excitement',
      environment: 'Sleek modern video studio with ambient blue and amber lighting',
      onScreenText: topic.toUpperCase().slice(0, 35),
      soundEffects: 'Cinematic risers and whoosh transit effect',
      musicDirection: 'Upbeat driving electronic background track starting low and swelling',
      imagePrompt: `Cinematic 8k portrait of a content creator in a dark studio with glowing floating holographic dashboard UI displaying data graphics, 35mm lens, volumetric lighting, high contrast, 16:9 aspect ratio`,
      videoPromptImageToVideo: `Slow dolly push-in on presenter in studio as neon light particles float gently in the foreground, smooth motion, high detail 24fps`,
      videoPromptTextToVideo: `Hyper-realistic video of a creative professional working at a desk with glowing digital holographic graphs around them, smooth camera movement, cinematic lighting, 8s duration`,
    },
    {
      sceneNumber: 'Scene 02',
      timestamp: '00:08–00:20',
      durationSeconds: 12,
      narration: `Let's break down step number one. When you apply this simple framework, you immediately eliminate repetitive manual tasks and boost your productivity by 3x.`,
      visualDescription: `Step 1 breakdown displaying side-by-side workflow comparison with clear callouts and animated graphics.`,
      cameraShot: 'Wide Shot',
      cameraMovement: 'Smooth lateral tracking shot',
      characterAction: isFaceless ? undefined : 'Presenter points to floating animated graphic on the screen',
      environment: 'Clean minimalist office workspace with warm sunlight streaming through large windows',
      onScreenText: 'STEP 1: THE 3X AUTOMATION FRAMEWORK',
      soundEffects: 'Subtle digital click and interface chime',
      musicDirection: 'Steady rhythmic productivity beat',
      imagePrompt: `Professional side-by-side comparison screen showing a messy desktop vs an organized AI workflow dashboard, high resolution graphics, clean UI design, 16:9`,
      videoPromptImageToVideo: `Pan across modern sunlit office space while holographic graphics draw themselves onto the screen, 12s duration`,
      videoPromptTextToVideo: `Cinematic footage of high-speed digital data processing into structured calendar schedules, smooth camera movement, 12s duration`,
    },
    {
      sceneNumber: 'Scene 03',
      timestamp: '00:20–00:35',
      durationSeconds: 15,
      narration: `Here is a real-world example of how this transformed a project in under 48 hours. Notice how seamless the transition is when AI handles the groundwork.`,
      visualDescription: `Case study showcase with B-roll cutaways showing rapid task completion and graph going upward.`,
      cameraShot: 'Close-up',
      cameraMovement: 'Dynamic zoom punch-in',
      characterAction: isFaceless ? undefined : 'Presenter nods thoughtfully, demonstrating laptop screen',
      environment: 'Modern glass conference room',
      onScreenText: 'REAL WORLD CASE STUDY: +300% EFFICIENCY',
      soundEffects: 'Data ticker sound effect',
      musicDirection: 'Building motivational melody',
      imagePrompt: `Detailed macro shot of hands typing smoothly on a backlit keyboard with holographic success metric chart floating above screen, 8k, bokeh background`,
      videoPromptImageToVideo: `Close up on fingers typing on keyboard as glowing light bar sweeps across screen revealing clean project output, 15s`,
      videoPromptTextToVideo: `Cinematic B-roll of modern team celebrating project success in glass office, camera panning slowly, 15s duration`,
    },
    {
      sceneNumber: 'Scene 04',
      timestamp: '00:35–00:50',
      durationSeconds: 15,
      narration: `If you found value in this breakdown, hit that subscribe button right now and check out the links in the description below for free resources!`,
      visualDescription: `Clear call-to-action screen with subscriber counter graphic and animated bell icon.`,
      cameraShot: 'Medium Shot',
      cameraMovement: 'Static centered shot',
      characterAction: isFaceless ? undefined : 'Presenter smiles, gestures toward Subscribe graphic on lower third',
      environment: 'Studio main set',
      onScreenText: 'SUBSCRIBE FOR DAILY AI & PRODUCTIVITY HACKS',
      soundEffects: 'Bell notification ding',
      musicDirection: 'Upbeat energetic outro finish',
      imagePrompt: `High CTR end screen visual template with glowing YouTube subscribe button, bell icon notification, high contrast studio background, 16:9`,
      videoPromptImageToVideo: `Presenter smiling in studio as animated Subscribe bell pops up in lower third with sparkle effect, 15s`,
      videoPromptTextToVideo: `3D animated YouTube Subscribe button popping out with neon particle effects on dark backdrop, 15s duration`,
    },
  ];

  const bRollSections: BRollSection[] = [
    {
      sectionId: 'broll-1',
      sceneNumber: 'Scene 02',
      description: 'Quick cut of professional working at clean laptop setup',
      searchKeywords: ['entrepreneur laptop', 'workspace productivity', 'ai workflow'],
      aiImagePrompt: 'Cinematic photo of modern desk setup with dual monitors, glowing warm ambient lamp, 8k',
      aiVideoPrompt: 'Time-lapse of laptop screen displaying automated tasks, smooth motion 5s',
      recommendedDurationSeconds: 5,
    },
    {
      sectionId: 'broll-2',
      sceneNumber: 'Scene 03',
      description: 'Upward trend line chart on digital screen',
      searchKeywords: ['growth chart', 'analytics graph', 'success metrics'],
      aiImagePrompt: 'Glowing green upward trend line graph on dark tech background, 4k detail',
      aiVideoPrompt: 'Animation of glowing financial line graph rising steeply with particle effects, 6s',
      recommendedDurationSeconds: 6,
    },
  ];

  const thumbnails: ThumbnailConcept[] = [
    {
      conceptNumber: 1,
      title: 'High Contrast Shocked Expression',
      textOverlay: 'SAVE 10 HOURS!',
      visualComposition: 'Presenter on left pointing with dramatic expression at glowing neon icon on right',
      characterPositioning: 'Left third position with intense eye contact',
      facialExpression: 'Surprised / excited face with mouth open',
      backgroundDescription: 'Vibrant dark navy background with orange neon lighting pulse',
      colorDirection: 'Electric Yellow text, Orange accent lights, Dark Navy canvas',
      aiPrompt: `High-CTR YouTube thumbnail featuring a 28yo creator looking shocked and pointing at a glowing holographic 10 HOURS SAVED badge, bold electric yellow text 'SAVE 10 HOURS!', 4K resolution, studio lighting, 16:9`,
    },
    {
      conceptNumber: 2,
      title: 'Split Screen Before vs After',
      textOverlay: 'AI vs MANUAL',
      visualComposition: 'Red glowing stress side on left, bright blue effortless side on right',
      characterPositioning: 'Centered split line',
      facialExpression: 'Exhausted on left, relaxed smile on right',
      backgroundDescription: 'Split screen high contrast gradient',
      colorDirection: 'Red vs Bright Cyan Blue',
      aiPrompt: `YouTube thumbnail split screen: left side stressed person with messy papers in red glow, right side relaxed person with glowing AI assistant on blue studio backdrop, text overlay 'AI vs MANUAL', 4k render, 16:9`,
    },
    {
      conceptNumber: 3,
      title: '3-Step Formula Graphic',
      textOverlay: 'DO THIS FIRST',
      visualComposition: 'Numbered steps 1, 2, 3 glowing brightly with arrow pointing to step 3',
      characterPositioning: 'Bottom corner inset',
      facialExpression: 'Confident knowing smirk',
      backgroundDescription: 'Minimalist tech texture with glowing arrows',
      colorDirection: 'Bright Lime Green & Gold',
      aiPrompt: `YouTube thumbnail graphic with glowing numbers 1, 2, 3 and big green arrow pointing to step 3, creator in bottom right corner with confident smile, bold text 'DO THIS FIRST', high contrast 4k, 16:9`,
    },
  ];

  return {
    id: `yt-proj-${Date.now()}`,
    title: topic,
    topic: topic,
    niche: niche,
    videoType: input.videoType,
    durationLabel: input.durationLabel,
    targetWordCount: wordCount,
    styleTone: input.styleTone,
    hookStyle: input.hookStyle || 'Curiosity',
    isFacelessMode: isFaceless,
    isCharacterMode: input.isCharacterMode,
    voiceConfig: input.voiceConfig,
    characters: charList,
    hook: {
      text: `What if you could automate your entire ${niche} workflow in under 5 minutes? Most creators have no idea this simple strategy exists...`,
      style: input.hookStyle || 'Curiosity',
      retentionHookReason: 'Engages viewers immediately with a high-stakes promise and open loop curiosity gap.',
    },
    completeScript: {
      hook: `What if you could automate your entire ${niche} workflow in under 5 minutes? Most creators have no idea this simple strategy exists...`,
      intro: `Welcome back to the channel! Today we are diving deep into ${topic}. Make sure to stick around until the end because step number 3 changes everything.`,
      mainSections: [
        {
          title: 'Section 1: The Core Foundation',
          content: `To kick things off, let's understand why traditional methods fall short. When you streamline this initial step, you eliminate 80% of friction right away.`,
          visualCue: '[Visual: Cut to dynamic workflow diagram with glowing nodes]',
        },
        {
          title: 'Section 2: Step-by-Step Implementation',
          content: `Here is the exact action plan you need to follow. First, set up your primary template. Next, connect your automated triggers.`,
          visualCue: '[Visual: Screen recording showing step-by-step clicks]',
        },
        {
          title: 'Section 3: Pro Tips & Secret Hacks',
          content: `Here is a secret tip that most tutorials completely skip. When you toggle this hidden option, your output quality doubles instantly.`,
          visualCue: '[Visual: Close-up punch-in on secret feature toggle]',
        },
      ],
      examples: ['Small business saving $2,000/mo', 'Content creator scaling from 1 to 5 videos per week'],
      transitions: ['Now that we have covered the foundation, let us move to the game changer...', 'Here is where things get really interesting...'],
      emotionalBeats: ['00:00 High Curiosity', '01:30 Lightbulb Moment', '03:45 Empowering Call to Action'],
      callToAction: `If this video brought you value, hit the Subscribe button right now and drop a comment below with your thoughts!`,
      ending: `Thanks for watching, and I will see you in the very next video!`,
      fullFormattedText: `[00:00 - HOOK]\n"What if you could automate your entire ${niche} workflow in under 5 minutes? Most creators have no idea this simple strategy exists..."\n\n[00:10 - INTRO]\n"Welcome back to the channel! Today we are diving deep into ${topic}. Stick around until the end because step number 3 changes everything."\n\n[00:30 - SECTION 1: FOUNDATION]\n"To kick things off, let's understand why traditional methods fall short. When you streamline this initial step, you eliminate 80% of friction right away."\n\n[01:45 - SECTION 2: IMPLEMENTATION]\n"Here is the exact action plan you need to follow. First, set up your primary template. Next, connect your automated triggers."\n\n[03:30 - SECTION 3: PRO HACKS]\n"Here is a secret tip that most tutorials completely skip. When you toggle this hidden option, your output quality doubles instantly."\n\n[04:45 - OUTRO & CTA]\n"If this video brought you value, hit the Subscribe button right now and drop a comment below! Thanks for watching!"`,
    },
    scenes: scenes,
    bRollSections: bRollSections,
    seo: {
      mainTitle: `${topic} (The Ultimate 2026 Guide)`,
      alternativeTitles: [
        `How to Master ${niche} with This 1 Simple Trick`,
        `Don't Touch ${niche} Until You Watch This!`,
        `7 AI Secrets Every ${niche} Creator Needs in 2026`,
        `${topic}: Full Step-by-Step Tutorial`,
        `The Hidden ${niche} Framework Nobody Tells You`,
      ],
      description: `In this video, we reveal ${topic}.\n\n⏱️ TIMESTAMPS:\n00:00 - The Untold Secret\n00:30 - Core Foundation\n01:45 - Step-by-Step Guide\n03:30 - Pro Tips & Hacks\n04:45 - Outro & Final Thoughts\n\n📌 Subscribe for more high-value ${niche} insights!\n\n#${niche.replace(/\s+/g, '')} #AI #YouTubeStudio #Productivity`,
      keywords: [niche.toLowerCase(), 'ai tools', 'youtube automation', topic.toLowerCase(), 'productivity hacks', 'step by step guide'],
      tags: [niche, 'AI', 'Tutorial', 'YouTube Studio', 'Viral Script', 'Productivity'],
      hashtags: [`#${niche.replace(/\s+/g, '')}`, '#AITools', '#Productivity'],
      chapters: [
        { timestamp: '00:00', title: 'The Untold Secret' },
        { timestamp: '00:30', title: 'Core Foundation' },
        { timestamp: '01:45', title: 'Step-by-Step Guide' },
        { timestamp: '03:30', title: 'Pro Tips & Hacks' },
        { timestamp: '04:45', title: 'Outro & Final Thoughts' },
      ],
      pinnedComment: `Which of these tools are you going to test first? Let me know in the comments below! 👇`,
      callToAction: `Subscribe to the channel for weekly breakdowns!`,
      seoScore: 95,
      seoFeedback: [
        'Main title includes high-search volume keyword in primary 50 characters.',
        'Description formatted with timestamps for automatic Google Video Chapter indexing.',
      ],
    },
    thumbnails: thumbnails,
    retention: {
      overallScore: 94,
      hookStrengthScore: 96,
      hookAnalysis: 'Engages viewers with curiosity and high reward potential.',
      weakSections: ['Mid-section transition - added dynamic B-roll cue to prevent drop-off'],
      potentialDropOffPoints: ['Minute 02:10 during technical explanation - mitigated with on-screen animated text'],
      patternInterrupts: ['Scene 02 zoom punch-in', 'Scene 03 sound effect riser'],
      curiosityLoops: ['Open loop created at 00:30 regarding secret tip saved for step 3'],
      openLoops: ['How much time can actually be saved?'],
      ctaPlacementAdvice: 'Primary CTA placed at 80% mark to maximize subscriber conversion without interrupting content flow.',
    },
    expertStrategy: {
      contentStrategy: `High-value search & recommendation hybrid strategy targeting ${niche} audience`,
      audiencePersona: `Motivated creators and professionals seeking actionable ${niche} efficiency`,
      searchIntent: 'Informational & practical step-by-step guidance',
      competitorAngle: 'Differentiate with clean production quality and zero fluff pacing',
      uniqueAngle: 'Actionable workflows over generic tool lists',
      keywordStrategy: 'Target long-tail secondary phrases in description and chapters',
      retentionStrategy: 'Pattern interrupt cuts every 8-12 seconds',
      scenePacing: 'Fast 8-second scenes in hook, steady 12-second pacing in main tutorial',
      visualStrategy: 'High-contrast studio lighting with neon interface callouts',
      monetizationCTA: 'Promote top recommended tool link in top 2 lines of video description',
      sponsorshipPlacement: 'Ideal sponsor slot at minute 03:00 transition',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Main Service Method: Generates a YouTube Production Package via Gemini
 */
export async function generateYouTubeProductionPackage(
  input: YouTubeGeneratorInput,
  user?: any
): Promise<YouTubeProject> {
  const targetWordCount = calculateTargetWordCount(input.durationLabel, input.customDurationSeconds);
  const prompt = buildGeminiPrompt(input, targetWordCount);

  try {
    const res = await aiService.generateText({
      user,
      toolType: 'youtube-script',
      prompt,
      tone: input.styleTone,
      length: input.durationLabel,
    });

    if (res.success && res.data?.result) {
      const rawText = res.data.result.trim();
      
      // Try extracting JSON from response text
      let jsonString = rawText;
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonString = rawText.substring(jsonStart, jsonEnd + 1);
      }

      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.title && parsed.scenes && Array.isArray(parsed.scenes)) {
          const project: YouTubeProject = {
            id: `yt-proj-${Date.now()}`,
            title: parsed.title || input.topic,
            topic: input.topic,
            niche: input.niche === 'Other / Custom Niche' ? input.customNiche || 'Custom' : input.niche,
            videoType: input.videoType,
            durationLabel: input.durationLabel,
            targetWordCount,
            styleTone: input.styleTone,
            hookStyle: input.hookStyle || 'Curiosity',
            isFacelessMode: input.isFacelessMode,
            isCharacterMode: input.isCharacterMode,
            voiceConfig: input.voiceConfig,
            characters: parsed.characters && parsed.characters.length > 0 ? parsed.characters : input.characters,
            hook: parsed.hook || { text: input.topic, style: input.hookStyle || 'Curiosity', retentionHookReason: 'Attracts target audience' },
            completeScript: parsed.completeScript || {
              hook: input.topic,
              intro: 'Welcome to this video!',
              mainSections: [],
              examples: [],
              transitions: [],
              emotionalBeats: [],
              callToAction: 'Subscribe for more!',
              ending: 'Thanks for watching!',
              fullFormattedText: input.topic,
            },
            scenes: parsed.scenes.map((s: any, idx: number) => ({
              sceneNumber: s.sceneNumber || `Scene ${String(idx + 1).padStart(2, '0')}`,
              timestamp: s.timestamp || `00:${String(idx * 8).padStart(2, '0')}–00:${String((idx + 1) * 8).padStart(2, '0')}`,
              durationSeconds: s.durationSeconds || 8,
              narration: s.narration || '',
              visualDescription: s.visualDescription || '',
              cameraShot: s.cameraShot || 'Medium Shot',
              cameraMovement: s.cameraMovement || 'Cinematic Push-in',
              characterAction: s.characterAction || '',
              environment: s.environment || 'Studio set',
              onScreenText: s.onScreenText || '',
              soundEffects: s.soundEffects || '',
              musicDirection: s.musicDirection || '',
              imagePrompt: s.imagePrompt || `Cinematic YouTube video scene for ${input.topic}, 8k, photorealistic, 16:9`,
              videoPromptImageToVideo: s.videoPromptImageToVideo || `Cinematic camera push-in on ${s.visualDescription || input.topic}, smooth motion 24fps`,
              videoPromptTextToVideo: s.videoPromptTextToVideo || `Hyper-realistic 4K video showing ${s.visualDescription || input.topic}, smooth camera pan, 8s duration`,
            })),
            bRollSections: parsed.bRollSections || [],
            seo: parsed.seo || {
              mainTitle: parsed.title || input.topic,
              alternativeTitles: [`How to ${input.topic}`, `Mastering ${input.topic}`],
              description: `${input.topic}\n\n#YouTube #AI`,
              keywords: [input.niche, 'AI', 'Tutorial'],
              tags: [input.niche, 'AI'],
              hashtags: [`#${input.niche.replace(/\s+/g, '')}`],
              chapters: [{ timestamp: '00:00', title: 'Intro' }],
              pinnedComment: 'What do you think? Let us know in comments!',
              callToAction: 'Subscribe!',
              seoScore: 92,
              seoFeedback: ['Good keywords included'],
            },
            thumbnails: parsed.thumbnails || [
              {
                conceptNumber: 1,
                title: 'High Impact Concept',
                textOverlay: input.topic.toUpperCase().slice(0, 20),
                visualComposition: 'Centered composition with bold contrast',
                characterPositioning: 'Left aligned',
                facialExpression: 'Engaging expression',
                backgroundDescription: 'Studio backdrop with neon lighting',
                colorDirection: 'High contrast Yellow & Dark Blue',
                aiPrompt: `High CTR YouTube thumbnail for ${input.topic}, vibrant text overlay, 4K resolution, 16:9`,
              },
            ],
            retention: parsed.retention || {
              overallScore: 92,
              hookStrengthScore: 95,
              hookAnalysis: 'Strong opening hook',
              weakSections: [],
              potentialDropOffPoints: [],
              patternInterrupts: ['Scene cuts'],
              curiosityLoops: ['Open loop in hook'],
              openLoops: [],
              ctaPlacementAdvice: 'Place CTA near end',
            },
            expertStrategy: parsed.expertStrategy || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          saveProjectToHistory(project);
          return project;
        }
      } catch (jsonErr) {
        console.warn('Failed to parse Gemini JSON response, generating high quality fallback:', jsonErr);
      }
    }
  } catch (err) {
    console.warn('aiService call error in YouTube Studio, generating fallback project:', err);
  }

  // Fallback return
  const fallback = createFallbackProject(input, targetWordCount);
  saveProjectToHistory(fallback);
  return fallback;
}

/**
 * Image Generation helper for a scene or thumbnail prompt
 */
export async function generateStudioImage(
  prompt: string,
  aspectRatio: string = '16:9',
  user?: any
): Promise<string | null> {
  try {
    const res = await aiService.generateImage({
      user,
      prompt,
      aspectRatio,
      style: 'Cinematic',
      quality: '4K',
    });

    if (res.success && res.data?.imageUrl) {
      return res.data.imageUrl;
    }
  } catch (err) {
    console.error('generateStudioImage error:', err);
  }
  return null;
}

/**
 * Saved Projects History LocalStorage Management
 */
export function getProjectsHistory(): YouTubeProject[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading YouTube projects history:', err);
  }
  return [];
}

export function saveProjectToHistory(project: YouTubeProject): void {
  try {
    const existing = getProjectsHistory();
    const index = existing.findIndex((p) => p.id === project.id);
    let updated: YouTubeProject[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [project, ...existing];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 30))); // Keep max 30
  } catch (err) {
    console.error('Error saving YouTube project history:', err);
  }
}

export function deleteProjectFromHistory(id: string): void {
  try {
    const existing = getProjectsHistory();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting YouTube project history:', err);
  }
}
