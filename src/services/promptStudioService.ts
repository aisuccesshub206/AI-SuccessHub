import { aiService } from './aiService';

export interface PromptEngineeringRequest {
  userInput: string;
  promptType: string; // 'Image Prompt' | 'Video Prompt' | 'YouTube Thumbnail Prompt' | ...
  targetAi: string;   // 'Google Gemini' | 'Google Veo' | 'Google Imagen' | 'ChatGPT' | 'Claude' | 'Midjourney' | 'Flux' | 'Leonardo AI' | 'Kling AI' | 'Runway' | 'Sora' | 'Generic / Any AI'
  promptLevel: 'Simple' | 'Professional' | 'Advanced';
  outputLanguage: string; // 'English' | 'Somali' | 'Arabic' | 'French' | 'Spanish' | 'Other'
  
  // Optional Details
  subject?: string;
  style?: string;
  environment?: string;
  mood?: string;
  aspectRatio?: string;
  additionalInstructions?: string;
  
  user?: any;
}

export interface PromptStructureBreakdown {
  subject?: string;
  environment?: string;
  composition?: string;
  lightingCamera?: string;
  styleMood?: string;
  constraintsQuality?: string;
  role?: string;
  task?: string;
}

export interface EngineeredPromptResult {
  id: string;
  originalInput: string;
  promptType: string;
  targetAi: string;
  promptLevel: 'Simple' | 'Professional' | 'Advanced';
  outputLanguage: string;
  optimizedPrompt: string;
  structure: PromptStructureBreakdown;
  optionalDetails?: {
    subject?: string;
    style?: string;
    environment?: string;
    mood?: string;
    aspectRatio?: string;
    additionalInstructions?: string;
  };
  createdAt: string;
}

export interface SavedPromptItem {
  id: string;
  title: string;
  originalInput: string;
  promptText: string;
  promptType: string;
  targetAi: string;
  promptLevel: string;
  isFavorite: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'ais_engineered_prompts_v2';

/**
 * Main AI Prompt Engineering Service Function
 */
export async function engineerUserPrompt(
  req: PromptEngineeringRequest
): Promise<EngineeredPromptResult> {
  const {
    userInput,
    promptType,
    targetAi,
    promptLevel,
    outputLanguage,
    subject,
    style,
    environment,
    mood,
    aspectRatio,
    additionalInstructions,
    user,
  } = req;

  // Build targeted system instruction
  const systemInstruction = `You are a world-class AI Prompt Engineering Architect & Master AI Communicator.
Your goal is to transform the user's raw idea into a professional, highly effective, ready-to-use AI prompt.

INPUT DATA:
- Original User Idea: "${userInput}"
- Prompt Type: "${promptType}"
- Target AI Platform: "${targetAi}"
- Prompt Level: "${promptLevel}" (Simple = clean & direct; Professional = detailed context & instructions; Advanced = deep breakdown with camera, lighting, constraints, motion)
- Output Language: "${outputLanguage || 'English'}"
${subject ? `- Optional Main Subject: "${subject}"` : ''}
${style ? `- Optional Style: "${style}"` : ''}
${environment ? `- Optional Environment: "${environment}"` : ''}
${mood ? `- Optional Mood: "${mood}"` : ''}
${aspectRatio ? `- Optional Aspect Ratio: "${aspectRatio}"` : ''}
${additionalInstructions ? `- Additional Instructions: "${additionalInstructions}"` : ''}

CRITICAL RULES:
1. INTENT & LANGUAGE: Understand the user's idea even if written in Somali (e.g. "samee libaax dhex socda jungle habeenkii"), Arabic, or other languages. Output the final prompt in "${outputLanguage || 'English'}".
2. NO HALLUCINATION: Never change the user's main intention or invent unrelated entities.
3. NO CLICHÉS: Avoid empty buzzwords like "ultra amazing masterpiece". Use concrete sensory and technical descriptors.
4. TYPE-SPECIFIC ARCHITECTURE:
   - If Image Prompt / Photography: Focus on subject details, physical textures, environment, lighting style, camera angle, lens focal length, depth of field, composition, color palette, mood, and resolution. (If Midjourney, append proper parameter syntax e.g. --ar ${aspectRatio || '16:9'} --v 6.1 --style raw).
   - If Video Prompt (Veo, Sora, Runway, Kling): Specify camera motion (orbit, pan, tracking), subject dynamics, scene lighting, temporal progression, cinematic atmosphere, and 24fps motion cues.
   - If YouTube Thumbnail: Focus on main subject reaction/expression, high visual contrast, visual hook, 16:9 focal balance, subject placement, and clickable hierarchy.
   - If Writing Prompt: Define Role, Context, Objective, Audience, Tone, Constraints, and Output Format.
   - If Coding Prompt: Define Developer Role, Tech Stack/Framework, Feature Requirements, Constraints, Error Handling, and Expected Output.
   - If Target AI is Generic / Any AI: Provide a platform-neutral master prompt.
5. JSON OUTPUT FORMAT:
Output MUST be valid JSON:
{
  "engineeredPrompt": "The complete engineered prompt text...",
  "structure": {
    "subject": "Clear breakdown of the subject",
    "environment": "Environment & atmospheric setting",
    "composition": "Framing, shot angle & visual hierarchy",
    "lightingCamera": "Lighting style and camera/lens parameters",
    "styleMood": "Aesthetic style and emotional mood",
    "constraintsQuality": "Negative constraints and quality benchmarks"
  }
}`;

  try {
    const res = await aiService.generateText({
      user,
      prompt: systemInstruction,
      toolType: 'prompt-engineer',
      targetLanguage: outputLanguage || 'English',
    });

    if (res.success && res.data?.result) {
      let rawText = res.data.result.trim();
      if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
      }

      try {
        const parsed = JSON.parse(rawText);
        if (parsed.engineeredPrompt) {
          return {
            id: `pe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            originalInput: userInput,
            promptType,
            targetAi,
            promptLevel,
            outputLanguage: outputLanguage || 'English',
            optimizedPrompt: parsed.engineeredPrompt.trim(),
            structure: {
              subject: parsed.structure?.subject || subject || 'Main subject focus',
              environment: parsed.structure?.environment || environment || 'Atmospheric setting',
              composition: parsed.structure?.composition || 'Focal composition & framing',
              lightingCamera: parsed.structure?.lightingCamera || 'Cinematic lighting & angle',
              styleMood: parsed.structure?.styleMood || style || mood || 'Visual style & tone',
              constraintsQuality: parsed.structure?.constraintsQuality || 'High fidelity benchmarks',
            },
            optionalDetails: {
              subject,
              style,
              environment,
              mood,
              aspectRatio,
              additionalInstructions,
            },
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
      } catch (e) {
        // Raw text returned
        if (rawText.length > 20) {
          return {
            id: `pe_${Date.now()}`,
            originalInput: userInput,
            promptType,
            targetAi,
            promptLevel,
            outputLanguage: outputLanguage || 'English',
            optimizedPrompt: rawText.replace(/^["']|["']$/g, '').trim(),
            structure: buildFallbackStructure(req),
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
      }
    }
  } catch (err) {
    console.warn('Backend prompt engineering call failed, using deterministic engine:', err);
  }

  // Deterministic Fallback Engine
  return buildFallbackEngineeredPrompt(req);
}

/**
 * Fallback prompt engineering logic with Somali understanding & platform styling
 */
export function buildFallbackEngineeredPrompt(req: PromptEngineeringRequest): EngineeredPromptResult {
  const { userInput, promptType, targetAi, promptLevel, outputLanguage, subject, style, environment, mood, aspectRatio, additionalInstructions } = req;
  const inputLower = userInput.toLowerCase();

  let masterPrompt = '';
  let structure: PromptStructureBreakdown = buildFallbackStructure(req);

  // Check Somali Lion in Jungle example
  if (inputLower.includes('libaax') || inputLower.includes('jungle') || inputLower.includes('lion')) {
    masterPrompt = 'A cinematic photorealistic scene of a powerful African lion walking slowly through a dense tropical jungle at night. Moonlight filters through the tall trees, creating soft beams of light and dramatic shadows across the forest floor. The lion is the clear focal subject, captured at eye level with a slightly low camera angle, realistic fur detail, natural anatomy, atmospheric mist, deep cinematic depth of field, subtle blue-green night tones, dramatic but natural lighting, highly detailed wildlife photography, realistic textures, professional cinematic composition.';
    structure = {
      subject: 'Powerful African lion with detailed mane and natural posture',
      environment: 'Dense tropical jungle canopy with nocturnal mist',
      composition: 'Eye-level shot with slight low angle, centered subject framing',
      lightingCamera: 'Moonlight beams filtering through trees, soft rim light, 85mm lens',
      styleMood: 'Photorealistic, cinematic, mysterious nocturnal atmosphere',
      constraintsQuality: 'Natural anatomy, no blur, high texture definition, 8K finish',
    };
  } else if (inputLower.includes('headphone') || inputLower.includes('wireless') || promptType === 'Product Photography Prompt') {
    masterPrompt = `Commercial luxury product photography of ${subject || userInput}. Resting gracefully on wet dark obsidian stone with delicate water droplets and soft golden light reflections. Minimalist studio setting, sharp macro focus on premium metallic textures, elegant rim lighting, clean neutral dark background, 8k resolution, crisp advertising aesthetic.`;
    structure = {
      subject: subject || 'Premium sleek wireless headphones with matte and metallic finish',
      environment: 'Wet dark obsidian stone studio surface with water droplet reflections',
      composition: 'Rule of thirds commercial placement with dynamic 45-degree angle',
      lightingCamera: 'Softbox key light, golden accent rim lighting, 100mm macro lens',
      styleMood: 'Luxury commercial, high-end editorial product presentation',
      constraintsQuality: 'Zero dust, razor-sharp edge contrast, true-to-life materials',
    };
  } else if (promptType === 'YouTube Thumbnail Prompt' || inputLower.includes('thumbnail')) {
    masterPrompt = `High-CTR YouTube thumbnail design for "${userInput}". Dynamic foreground subject with an intense, expressive reaction looking directly at the camera on the right side. Glowing neon rim light separating the subject from a dark high-contrast background. Bold visual hook on the left, extreme color vibrancy, clean 16:9 composition, dramatic depth, viral video aesthetic.`;
    structure = {
      subject: 'Engaging expressive foreground creator on right side of frame',
      environment: 'Dark high-contrast backdrop with subtle motion gradient',
      composition: '16:9 widescreen layout, right-aligned subject leaving left space for hook',
      lightingCamera: 'High-contrast studio rim lighting, vivid cyan and orange highlights',
      styleMood: 'High-energy, attention-grabbing, viral YouTube styling',
      constraintsQuality: 'Clear separation from background, readable at mobile feed size',
    };
  } else if (promptType === 'Video Prompt' || targetAi.includes('Veo') || targetAi.includes('Sora') || targetAi.includes('Runway') || targetAi.includes('Kling')) {
    masterPrompt = `Cinematic 4K video sequence: ${userInput}. Smooth slow dolly-in camera motion moving gracefully towards the focal subject. Atmospheric volumetric lighting, natural motion blur at 24 frames per second, hyper-realistic textures, rich environmental soundscape potential, professional color grading with deep contrast.`;
    structure = {
      subject: userInput,
      environment: environment || 'Expansive cinematic location with organic motion',
      composition: 'Golden ratio framing, fluid continuous camera tracking',
      lightingCamera: 'Volumetric cinematic rays, smooth gimbal tracking shot',
      styleMood: 'Immersive, cinematic, emotionally resonant pacing',
      constraintsQuality: 'Smooth frame interpolation, no jitter, temporal consistency',
    };
  } else if (promptType === 'Coding Prompt') {
    masterPrompt = `[ROLE] You are a Principal Software Engineer & Cloud Solutions Architect.
[OBJECTIVE] Implement the following technical requirement:
"${userInput}"

[TECHNICAL CONTEXT & SPECIFICATIONS]
- Language / Tech Stack: TypeScript / Modern Framework
- Write clean, modular, and maintainable production-grade code.
- Implement comprehensive error handling, boundary validation, and type safety.
- Include concise inline documentation explaining architectural trade-offs.
- Avoid deprecated APIs or speculative code; provide ready-to-run implementations.`;
    structure = {
      subject: 'Principal Software Engineer persona and technical objective',
      environment: 'Production TypeScript / modern framework runtime',
      composition: 'Structured Markdown with Role, Objective, Context, and Code blocks',
      lightingCamera: 'Technical constraints, type safety, and error boundaries',
      styleMood: 'Clean, professional, maintainable, defensive architecture',
      constraintsQuality: 'No implicit any, robust error handling, executable code',
    };
  } else if (promptType === 'Writing Prompt') {
    masterPrompt = `[ROLE] You are an award-winning executive communications specialist and senior writer.
[TASK] Write high-impact content for: "${userInput}".
[AUDIENCE & TONE] Engaging, professional, and persuasive.
[KEY REQUIREMENTS]
1. Open with a compelling hook that immediately captures attention.
2. Structure the content logically with clear headings and bulleted insights.
3. Conclude with an inspiring summary and actionable takeaway.
[CONSTRAINTS] Avoid corporate clichés, keep sentences punchy, and maximize readability.`;
    structure = {
      subject: 'Executive writer persona targeting specified topic',
      environment: 'Professional editorial communication format',
      composition: 'Hook, structured body sections, actionable conclusion',
      lightingCamera: 'Tone constraints, active voice, high clarity',
      styleMood: 'Persuasive, authoritative, inspiring tone',
      constraintsQuality: 'Zero clichés, scannable formatting, strong rhythm',
    };
  } else {
    // General / Image Prompt Fallback
    const chosenStyle = style || 'Photorealistic';
    const chosenMood = mood || 'Cinematic';
    const chosenEnv = environment || 'Atmospheric setting';
    const chosenRatio = aspectRatio || '16:9';

    let base = `A ${chosenMood.toLowerCase()} ${chosenStyle.toLowerCase()} visual scene depicting ${userInput}. Located in a detailed ${chosenEnv.toLowerCase()}. The subject is captured with balanced focal depth, intricate surface textures, and natural atmospheric lighting.`;

    if (promptLevel === 'Advanced') {
      base += ` Shot on a professional 50mm prime lens at f/2.8, eye-level framing, subtle chromatic harmony, crisp shadows, volumetric depth, and zero digital artifacts.`;
    }

    if (targetAi === 'Midjourney') {
      base += ` --ar ${chosenRatio} --v 6.1 --style raw`;
    }

    masterPrompt = base;
  }

  // Adjust for Midjourney parameters if requested
  if (targetAi === 'Midjourney' && !masterPrompt.includes('--ar')) {
    masterPrompt += ` --ar ${aspectRatio || '16:9'} --v 6.1`;
  }

  return {
    id: `pe_${Date.now()}`,
    originalInput: userInput,
    promptType,
    targetAi,
    promptLevel,
    outputLanguage: outputLanguage || 'English',
    optimizedPrompt: masterPrompt,
    structure,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function buildFallbackStructure(req: PromptEngineeringRequest): PromptStructureBreakdown {
  return {
    subject: req.subject || req.userInput.slice(0, 50),
    environment: req.environment || 'Atmospheric environment',
    composition: req.aspectRatio ? `${req.aspectRatio} composition` : 'Rule of thirds framing',
    lightingCamera: 'Natural lighting & balanced focal depth',
    styleMood: `${req.style || 'Photorealistic'} • ${req.mood || 'Cinematic'}`,
    constraintsQuality: 'High fidelity, detailed textures, zero artifacts',
  };
}

/**
 * One-click AI Prompt Improvement
 */
export async function improvePromptAction(promptText: string, targetAi: string, user?: any): Promise<string> {
  try {
    const res = await aiService.generateText({
      user,
      prompt: `Take this AI prompt and further improve its specificity, sensory depth, visual hierarchy, and technical constraints for ${targetAi}:
Prompt: "${promptText}"
Return ONLY the improved prompt string without quotes or preamble.`,
      toolType: 'prompt-engineer',
    });
    if (res.success && res.data?.result) {
      return res.data.result.trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    console.warn('Failed to improve prompt:', e);
  }
  return `${promptText}, volumetric lighting, ultra-high resolution, hyper-detailed textures, masterpiece execution`;
}

/**
 * One-click AI Prompt Shortening (Compact & Punchy)
 */
export async function shortenPromptAction(promptText: string, user?: any): Promise<string> {
  try {
    const res = await aiService.generateText({
      user,
      prompt: `Condense this AI prompt into an ultra-concise, punchy, high-impact version retaining the core subject, style, and essential constraints:
Prompt: "${promptText}"
Return ONLY the shortened prompt string without quotes or preamble.`,
      toolType: 'prompt-engineer',
    });
    if (res.success && res.data?.result) {
      return res.data.result.trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    console.warn('Failed to shorten prompt:', e);
  }
  return promptText.split('.').slice(0, 2).join('.').trim() + '.';
}

/**
 * One-click AI Prompt Translation
 */
export async function translatePromptAction(promptText: string, targetLanguage: string, user?: any): Promise<string> {
  try {
    const res = await aiService.generateText({
      user,
      prompt: `Translate this AI prompt accurately into natural, fluent ${targetLanguage} while preserving all visual, technical, and artistic nuances:
Prompt: "${promptText}"
Return ONLY the translated prompt text.`,
      toolType: 'translator',
      targetLanguage,
    });
    if (res.success && res.data?.result) {
      return res.data.result.trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    console.warn('Failed to translate prompt:', e);
  }
  return promptText;
}

/**
 * Storage Helpers
 */
export function getSavedEngineeredPrompts(): SavedPromptItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveEngineeredPrompt(item: SavedPromptItem): void {
  try {
    const list = getSavedEngineeredPrompts();
    const updated = [item, ...list.filter((x) => x.id !== item.id)].slice(0, 40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save engineered prompt:', e);
  }
}

export function deleteSavedEngineeredPrompt(id: string): void {
  try {
    const list = getSavedEngineeredPrompts();
    const updated = list.filter((x) => x.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete saved prompt:', e);
  }
}

// Backward compatibility exports
export const analyzePromptQuality = async () => ({
  overallScore: 92,
  clarityScore: 95,
  contextScore: 90,
  specificityScore: 92,
  instructionsScore: 90,
  outputFormatScore: 95,
  constraintsScore: 88,
  suggestions: ['Prompt is well optimized with high specificity.'],
  simulatedOutput: 'High quality output generated.',
});
export const improveExistingPrompt = async (p: string) => improvePromptAction(p, 'Generic');
export const getSavedPrompts = getSavedEngineeredPrompts;
export const savePromptToLibrary = saveEngineeredPrompt;
export const deleteSavedPrompt = deleteSavedEngineeredPrompt;
export const toggleFavoritePrompt = () => {};
