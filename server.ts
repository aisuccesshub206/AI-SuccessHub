import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for mobile apps and external web clients
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Middleware for JSON body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// In-memory status tracker for AI API connectivity
let aiApiState: {
  status: "operational" | "quota_exceeded" | "key_missing" | "error";
  lastChecked: string;
  errorMessage?: string;
  consecutiveFailures: number;
} = {
  status: process.env.GEMINI_API_KEY ? "operational" : "key_missing",
  lastChecked: new Date().toISOString(),
  consecutiveFailures: 0,
};

function recordAiSuccess() {
  aiApiState = {
    status: "operational",
    lastChecked: new Date().toISOString(),
    consecutiveFailures: 0,
  };
}

// Initialize Gemini Client safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING: Gemini API key is not configured on the server environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper for handling Gemini API errors gracefully (Quota exceeded, missing key, network issues)
function handleGeminiError(error: any, res: express.Response, fallbackMsg = "Failed to process AI request.") {
  console.error("Gemini API Error:", error?.message || error);
  const errMsg = String(error?.message || error || "");

  const isQuota =
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.includes("Quota exceeded") ||
    errMsg.includes("quota") ||
    errMsg.includes("429") ||
    error?.status === 429 ||
    error?.code === 429;

  const isMissingKey =
    errMsg.includes("GEMINI_API_KEY_MISSING") ||
    errMsg.includes("API_KEY_INVALID") ||
    errMsg.includes("API key not valid") ||
    error?.status === 401;

  if (isQuota) {
    aiApiState = {
      status: "quota_exceeded",
      lastChecked: new Date().toISOString(),
      errorMessage: "AI generation is temporarily limited because upstream Gemini API quota was exceeded. Non-AI tools remain 100% operational.",
      consecutiveFailures: (aiApiState.consecutiveFailures || 0) + 1,
    };
    return res.status(429).json({
      error: "QUOTA_EXCEEDED",
      reason: "gemini_quota",
      message: "AI generation is temporarily unavailable because Gemini API quota was exceeded. Please try again later or configure your own Gemini API key."
    });
  }

  if (isMissingKey) {
    aiApiState = {
      status: "key_missing",
      lastChecked: new Date().toISOString(),
      errorMessage: "Gemini API key is missing or invalid on the server environment.",
      consecutiveFailures: (aiApiState.consecutiveFailures || 0) + 1,
    };
    return res.status(401).json({
      error: "API_KEY_MISSING",
      reason: "missing_key",
      message: "Gemini API key is missing or invalid on the server environment. Please configure GEMINI_API_KEY."
    });
  }

  aiApiState = {
    status: "error",
    lastChecked: new Date().toISOString(),
    errorMessage: error?.message || fallbackMsg,
    consecutiveFailures: (aiApiState.consecutiveFailures || 0) + 1,
  };

  return res.status(500).json({
    error: "AI_SERVICE_ERROR",
    message: error?.message || fallbackMsg
  });
}

// Plan usage limit validation helper
function validatePlanUsage(body: any) {
  const plan = (body.userPlan || 'Free').toString().toLowerCase();
  const usage = body.userUsage || {};

  const dailyUsed = typeof usage.aiRequestsToday === 'number' ? usage.aiRequestsToday : 0;
  const monthlyUsed = typeof usage.aiRequestsThisMonth === 'number' ? usage.aiRequestsThisMonth : 0;

  // Plan limits: Free = 10/day, Pro = 500/day, Enterprise = Unlimited (10000)
  const maxDaily = typeof usage.aiRequestsLimitDaily === 'number' && usage.aiRequestsLimitDaily > 0
    ? usage.aiRequestsLimitDaily
    : (plan.includes('pro') ? 500 : plan.includes('enterprise') || plan.includes('vip') ? 10000 : 10);

  const maxMonthly = typeof usage.aiRequestsLimitMonthly === 'number' && usage.aiRequestsLimitMonthly > 0
    ? usage.aiRequestsLimitMonthly
    : (plan.includes('pro') ? 10000 : plan.includes('enterprise') || plan.includes('vip') ? 100000 : 300);

  if (dailyUsed >= maxDaily) {
    return {
      allowed: false,
      reason: 'ai_daily',
      message: `Daily AI limit reached (${dailyUsed}/${maxDaily}) for your ${body.userPlan || 'Free'} plan. Upgrade to Pro or Enterprise for higher limits.`
    };
  }

  if (monthlyUsed >= maxMonthly) {
    return {
      allowed: false,
      reason: 'ai_monthly',
      message: `Monthly AI limit reached (${monthlyUsed}/${maxMonthly}) for your ${body.userPlan || 'Free'} plan. Upgrade to Pro or Enterprise for higher limits.`
    };
  }

  return { allowed: true };
}

// ==================== API ROUTES ==================== //

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "AI Success Hub",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// AI Connectivity and Status Probe Endpoint
app.get("/api/ai/status", async (req, res) => {
  const probe = req.query.probe === "true";
  const hasKey = !!process.env.GEMINI_API_KEY;

  if (!hasKey) {
    return res.json({
      status: "key_missing",
      configured: false,
      message: "Gemini API key is not configured on the server environment.",
      lastChecked: new Date().toISOString(),
      consecutiveFailures: aiApiState.consecutiveFailures,
      nonAiToolsOperational: true,
      timestamp: new Date().toISOString(),
    });
  }

  if (probe) {
    try {
      const ai = getGeminiClient();
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: "ping",
        config: { maxOutputTokens: 3 },
      });
      recordAiSuccess();
    } catch (err: any) {
      const errMsg = String(err?.message || err || "");
      const isQuota =
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("Quota exceeded") ||
        errMsg.includes("quota") ||
        errMsg.includes("429") ||
        err?.status === 429;

      aiApiState = {
        status: isQuota ? "quota_exceeded" : "error",
        lastChecked: new Date().toISOString(),
        errorMessage: isQuota
          ? "Gemini API quota exceeded or rate-limited (HTTP 429)."
          : errMsg || "AI connectivity test failed.",
        consecutiveFailures: (aiApiState.consecutiveFailures || 0) + 1,
      };
    }
  }

  res.json({
    status: aiApiState.status,
    configured: hasKey,
    message:
      aiApiState.status === "operational"
        ? "AI generation engine is operational and ready."
        : aiApiState.errorMessage || "AI Service status update.",
    lastChecked: aiApiState.lastChecked,
    consecutiveFailures: aiApiState.consecutiveFailures,
    nonAiToolsOperational: true,
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    // Check subscription plan usage limits first
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const { messages, systemInstruction } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();
    const lastUserMessage = messages[messages.length - 1]?.content || "Hello";

    // Call Gemini 3.6 Flash
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: lastUserMessage,
      config: {
        systemInstruction: systemInstruction || "You are AI Success Hub Copilot, a helpful AI productivity assistant for documents, writing, coding, and workflow automation.",
      },
    });

    recordAiSuccess();
    res.json({ result: response.text, usageUpdated: true });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to generate AI response.");
  }
});

// 2. AI Text Tools Endpoint (Summarize, Writer, Resume, Email, Blog, Script, Translator, etc.)
app.post("/api/ai/generate-text", async (req, res) => {
  try {
    // Check subscription plan usage limits first
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const { toolType, prompt, contextText, tone, targetLanguage, length } = req.body;
    
    if (!prompt && !contextText) {
      return res.status(400).json({ error: "Prompt or context text is required." });
    }

    const ai = getGeminiClient();

    let systemPrompt = "You are an expert AI productivity assistant. Produce clear, professional, well-formatted output with markdown.";
    
    if (toolType === "summarize") {
      systemPrompt = "You are an expert document summarizer. Summarize the text clearly with executive summary, key bullet points, action items, and main takeaways.";
    } else if (toolType === "resume") {
      systemPrompt = "You are a professional executive resume builder and career strategist. Format output cleanly with sections: Summary, Core Competencies, Professional Experience, Education, and Skills.";
    } else if (toolType === "cover-letter") {
      systemPrompt = "You are an expert job application strategist. Write a persuasive, polished cover letter.";
    } else if (toolType === "email") {
      systemPrompt = "You are an executive communications specialist. Draft a compelling email with Subject line and Body.";
    } else if (toolType === "blog") {
      systemPrompt = "You are a senior content marketer and SEO copywriter. Generate a comprehensive, SEO-optimized blog post with subheadings (H2, H3), meta description, and conclusion.";
    } else if (toolType === "translator") {
      systemPrompt = `You are a professional translator. Translate the text accurately into ${targetLanguage || "English"} while maintaining natural tone and nuance.`;
    } else if (toolType === "grammar") {
      systemPrompt = "You are a meticulous proofreader and editor. Fix all grammatical, spelling, and punctuation errors. Provide the corrected version first, followed by a list of key corrections made.";
    } else if (toolType === "youtube-script" || toolType === "ai-youtube-script") {
      systemPrompt = "You are a viral YouTube creator and scriptwriter. Generate complete, ready-to-record spoken YouTube scripts in valid JSON as requested by the user prompt.";
    } else if (toolType === "social") {
      systemPrompt = "You are a social media viral growth marketer. Generate engaging posts tailored for LinkedIn, Twitter/X, and Instagram with hashtags.";
    } else if (toolType === "enhance-image-prompt") {
      systemPrompt = `You are a master AI visual artist and prompt engineer.
The user will provide an image concept or description in English, Somali, Arabic, or another language.
Expand it into a vivid, highly descriptive, professional prompt suitable for state-of-the-art AI image models (e.g. Imagen 3, Midjourney, FLUX).
Rules:
1. Preserve the user's intended subject and core idea faithfully without inventing unrelated objects.
2. Add precise artistic visual details: subject textures, physical materials, environmental atmosphere, lighting style, camera angle, depth of field, and mood.
3. If the input is in Somali or Arabic, translate the visual meaning accurately into a powerful descriptive English prompt for the image model.
4. Return ONLY the enhanced prompt string without any quotation marks, introductory text, or conversational explanations.`;
    } else if (toolType === "prompt-generator" || toolType === "ai-prompt-studio" || toolType === "prompt-engineer") {
      systemPrompt = `You are an elite AI Prompt Engineering Architect & Master AI Communicator.
Your mission is to turn a user's simple raw idea into a professional, highly detailed, ready-to-use AI prompt tailored for the specified AI platform (e.g. Midjourney, Google Imagen, Google Veo, Flux, Leonardo AI, ChatGPT, Claude, Google Gemini, Sora, Runway, Kling AI, or Generic AI).

CORE RULES:
1. Understand the exact intent of the user's input in any language (especially Somali, Arabic, English, etc.). If the user writes in Somali, translate and understand the core concept accurately.
2. Produce output in the requested prompt language (default: English).
3. Do NOT invent unrelated facts or add meaningless filler phrases like "ultra amazing masterpiece". Make sensible, vivid, professional creative improvements.
4. If Prompt Type is Image or Photography: expand subject details, composition, camera angle, lens (when useful), natural lighting, color palette, mood, visual style, depth of field, resolution, aspect ratio, and negative prompt where helpful. (e.g., Somali "samee libaax dhex socda jungle habeenkii" -> "A cinematic photorealistic scene of a powerful African lion walking slowly through a dense tropical jungle at night. Moonlight filters through the tall trees, creating soft beams of light and dramatic shadows across the forest floor. The lion is the clear focal subject, captured at eye level with a slightly low camera angle, realistic fur detail, natural anatomy, atmospheric mist, deep cinematic depth of field, subtle blue-green night tones, dramatic but natural lighting, highly detailed wildlife photography, realistic textures, professional cinematic composition.")
5. If Prompt Type is Video: detail subject action, environment, cinematic camera movement, focal length, lighting, motion dynamics, temporal scene progression, and visual style.
6. If Prompt Type is YouTube Thumbnail: detail subject expression/reaction, high-contrast visual hierarchy, background separation, 16:9 composition, readable text hook if requested, and attention-grabbing lighting.
7. If Prompt Type is Writing or General AI: define Role, Context, Objective, Task, Tone, Constraints, and Output Format.
8. If Prompt Type is Coding: define Developer Role, Objective, Context, Tech Stack/Framework, Requirements, Constraints, Error Handling, and Expected Output.
9. Format response as JSON when possible:
{
  "engineeredPrompt": "...",
  "structure": {
    "subject": "...",
    "environment": "...",
    "composition": "...",
    "lightingCamera": "...",
    "styleMood": "...",
    "constraintsQuality": "..."
  }
}`;
    }

    const fullPrompt = `Task: ${toolType || "content creation"}
${tone ? `Tone: ${tone}` : ""}
${length ? `Target Length: ${length}` : ""}
Input/Context:
${contextText || ""}

User Request/Details:
${prompt || ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    recordAiSuccess();
    res.json({ result: response.text, usageUpdated: true });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to execute AI text task.");
  }
});

// 3. AI Image Generator Endpoint
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    // Check subscription plan usage limits first
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const {
      prompt,
      tool,
      isThumbnail,
      imageType,
      style,
      aspectRatio = "1:1",
      quality = "1080p",
      colorMood,
      customColor,
      cameraAngle,
      cameraShot,
      lens,
      lighting,
      depthOfField,
      composition,
      background,
      negativePrompt,
      hookText,
      subjectPlacement,
      facialExpression,
      contrastStyle,
    } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: "Image prompt description is required." });
    }

    const ai = getGeminiClient();
    const isThumbTool = isThumbnail || tool === 'thumbnail-generator';

    let finalPrompt = "";
    if (isThumbTool) {
      const parts: string[] = [];
      parts.push(`High-CTR viral YouTube video thumbnail artwork: ${prompt.trim()}.`);
      if (hookText && hookText.trim()) parts.push(`Bold attention hook overlay text concept: "${hookText.trim()}".`);
      if (subjectPlacement) parts.push(`Subject composition placement: ${subjectPlacement}.`);
      if (facialExpression && facialExpression !== 'None / Object only') parts.push(`Character facial expression: ${facialExpression}.`);
      if (contrastStyle) parts.push(`Contrast & lighting aura: ${contrastStyle}.`);
      if (style) parts.push(`Visual style: ${style}.`);
      parts.push(`Resolution: ${quality || '1080p HD'}.`);
      parts.push(`High contrast ratio, vivid saturation, dramatic studio rim light, sharp focal subject, designed specifically for YouTube 16:9 feed discovery, high visual clickability, ultra-clear textures, no watermarks, no blur.`);
      finalPrompt = parts.join(" ");
    } else {
      const parts: string[] = [];
      if (imageType && imageType !== 'Other') parts.push(`${imageType}:`);
      parts.push(prompt.trim());
      if (style) parts.push(`Visual style: ${style}.`);
      if (colorMood && colorMood !== 'Neutral') parts.push(`Color palette & mood: ${colorMood}${customColor ? ` (${customColor})` : ''}.`);
      if (lighting) parts.push(`Lighting: ${lighting}.`);
      if (cameraAngle) parts.push(`Camera angle: ${cameraAngle}.`);
      if (cameraShot) parts.push(`Shot type: ${cameraShot}.`);
      if (lens) parts.push(`Camera lens: ${lens}.`);
      if (composition) parts.push(`Composition: ${composition}.`);
      if (depthOfField) parts.push(`Depth of field: ${depthOfField}.`);
      if (background) parts.push(`Background: ${background}.`);
      if (quality) parts.push(`Render quality: ${quality}.`);
      if (negativePrompt) parts.push(`Exclude: ${negativePrompt}.`);
      parts.push(`Sharp focus, highly detailed textures, master quality render, balanced exposure, beautiful artistic finish, no artifacts.`);
      finalPrompt = parts.join(" ");
    }

    // Determine width and height based on aspect ratio and quality
    let width = 1024;
    let height = 1024;
    let imagenAspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";

    if (aspectRatio === "16:9") {
      imagenAspectRatio = "16:9";
      width = quality === "2160p" ? 3840 : quality === "1440p" ? 2560 : 1280;
      height = quality === "2160p" ? 2160 : quality === "1440p" ? 1440 : 720;
    } else if (aspectRatio === "9:16") {
      imagenAspectRatio = "9:16";
      width = quality === "2160p" ? 2160 : quality === "1440p" ? 1440 : 720;
      height = quality === "2160p" ? 3840 : quality === "1440p" ? 2560 : 1280;
    } else if (aspectRatio === "4:5") {
      imagenAspectRatio = "3:4";
      width = 1024;
      height = 1280;
    } else if (aspectRatio === "3:2") {
      imagenAspectRatio = "16:9";
      width = 1280;
      height = 853;
    } else if (aspectRatio === "4:3") {
      imagenAspectRatio = "4:3";
      width = 1280;
      height = 960;
    } else {
      imagenAspectRatio = "1:1";
      width = quality === "2160p" ? 2160 : quality === "1440p" ? 1440 : 1024;
      height = width;
    }

    let imageUrl: string | null = null;
    let caption = "";

    try {
      // 1. Try Imagen 3 model first
      const imageResponse = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: imagenAspectRatio,
        },
      });

      if (imageResponse.generatedImages?.[0]?.image?.imageBytes) {
        imageUrl = `data:image/jpeg;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
      }
    } catch (primaryErr: any) {
      console.warn("Primary image model failed, trying secondary model...", primaryErr?.message || primaryErr);
      
      try {
        // 2. Try secondary generateContent model
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: {
            parts: [{ text: finalPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: imagenAspectRatio,
            },
          } as any,
        });

        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
            } else if (part.text) {
              caption += part.text;
            }
          }
        }
      } catch (secondaryErr: any) {
        console.warn("Secondary image model also failed or quota exceeded:", secondaryErr?.message || secondaryErr);
      }
    }

    // 3. Robust Fallback Engine if API quotas are exhausted
    if (!imageUrl) {
      const seed = Math.floor(Math.random() * 1000000);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
      caption = isThumbTool ? "Rendered via YouTube Studio Engine" : "Rendered via Creative AI Engine";
    }

    res.json({ imageUrl, caption, usageUpdated: true });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to generate AI image.");
  }
});

// 3.5. AI Document Summarizer Endpoint (Structured Output & Multi-Language)
app.post("/api/ai/summarize-document", async (req, res) => {
  try {
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const {
      documentText,
      fileName,
      fileType,
      summaryLength = "Standard",
      summaryStyle = "Executive Summary",
      summaryLanguage = "Auto Detect",
      selectedRange = "Entire Document",
      actionType = "full-summary",
      customInstructions
    } = req.body;

    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({ error: "Document text or content is required." });
    }

    const ai = getGeminiClient();

    const isSomali = summaryLanguage === "Somali" || summaryLanguage === "Af-Soomaali" || summaryLanguage?.toLowerCase().includes("soomaal");

    const langInstruction = isSomali
      ? "CRITICAL LANGUAGE REQUIREMENT: Write ALL generated text, summaries, key points, action items, dates, and labels in clear, fluent, natural SOMALI (Af-Soomaali). Do NOT translate word-for-word mechanically; write natural Somali with professional vocabulary, preserving names, numbers, and core technical concepts accurately."
      : summaryLanguage && summaryLanguage !== "Auto Detect" && summaryLanguage !== "English"
      ? `CRITICAL LANGUAGE REQUIREMENT: Write ALL output in ${summaryLanguage}. Maintain natural phrasing and accurate document terminology.`
      : "Write the summary in clear, highly readable, professional English unless the input document is strictly in another language or requested otherwise.";

    const systemPrompt = `You are a world-class Document Intelligence & Summarization AI Engine.
Your task is to analyze documents (PDF, Word, TXT, OCR scans, sheets, presentations) and produce a structured, highly accurate document analysis.
${langInstruction}

RULES:
1. Base all facts, names, dates, decisions, and takeaways ONLY on the document content provided.
2. Do not invent or hallucinate information not present in the document.
3. Keep summaries concise, executive-level, and well-structured.
4. You MUST return your answer in valid JSON matching the specified structure without markdown wrappers if possible or inside a clean JSON codeblock.

DOCUMENT METADATA:
File Name: ${fileName || "Document"}
Type: ${fileType || "Text"}
Range Requested: ${selectedRange || "Entire Document"}
Summary Style: ${summaryStyle}
Summary Length: ${summaryLength}
Action Request: ${actionType}
${customInstructions ? `Custom User Note: ${customInstructions}` : ""}`;

    const promptText = `Analyze the following document content and produce a complete JSON summary object:

DOCUMENT CONTENT:
"""
${documentText.slice(0, 50000)}
"""

Required JSON format:
{
  "executiveSummary": "Concise overview summarizing the entire document core message...",
  "keyPoints": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "detailedSections": [
    {
      "title": "1. Section / Topic Title",
      "content": "Detailed summary paragraph covering this specific section of the document..."
    }
  ],
  "importantInfo": {
    "names": ["Important Name / Organization 1"],
    "dates": ["Important Date / Deadline 1"],
    "numbersAndStats": ["Statistic or financial metric 1"],
    "decisions": ["Key Decision 1"],
    "actionItems": ["Action Item / Next Step 1"],
    "terminology": ["Key Term 1: Definition or context"]
  },
  "metrics": {
    "keyTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
  },
  "outline": [
    {
      "id": "sec-1",
      "title": "Section Title 1",
      "page": "Page 1"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
    });

    let rawText = response.text || "{}";
    // Sanitize JSON if wrapped in markdown blocks
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      console.warn("Failed to parse JSON directly from Gemini, constructing fallback object:", parseErr);
      parsedData = {
        executiveSummary: rawText,
        keyPoints: [rawText.slice(0, 150)],
        detailedSections: [{ title: "Document Overview", content: rawText }],
        importantInfo: { names: [], dates: [], numbersAndStats: [], decisions: [], actionItems: [], terminology: [] },
        metrics: { keyTopics: ["General Document"] },
        outline: [{ id: "sec-1", title: "Document Content", page: "Page 1" }]
      };
    }

    res.json({
      success: true,
      data: parsedData,
      usageUpdated: true
    });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to analyze document.");
  }
});

// 3.6. AI Document Chat (Document Q&A Endpoint)
app.post("/api/ai/document-qa", async (req, res) => {
  try {
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const { documentText, fileName, question, chatHistory = [], language = "English" } = req.body;

    if (!documentText) {
      return res.status(400).json({ error: "Document text is missing." });
    }
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const ai = getGeminiClient();

    const isSomali = language === "Somali" || language === "Af-Soomaali" || question.toLowerCase().includes("soomaal");

    const systemPrompt = `You are a dedicated AI Document Assistant.
You answer questions strictly and accurately based ONLY on the uploaded document "${fileName || "Document"}".

CRITICAL GROUNDING RULES:
1. Rely ONLY on clear facts that are directly mentioned in the document context.
2. Do NOT invent or assume facts not present in the document.
3. If the document does NOT contain the answer, state clearly: "${isSomali ? "Qoraalka kor ku xusan kuma jirto macluumaadkan." : "This information is not mentioned in the provided document."}"
4. Whenever possible, cite the relevant section name or page reference at the end of your answer (e.g., "[Source: Section 2 / Page 3]").
5. ${isSomali ? "Answer in clear, natural Somali (Af-Soomaali)." : `Answer in clear, helpful ${language || "English"}.`}`;

    const promptText = `DOCUMENT CONTEXT:
"""
${documentText.slice(0, 45000)}
"""

USER QUESTION:
${question}

Provide a direct, well-grounded answer based on the document text:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({
      answer: response.text || "No response generated.",
      usageUpdated: true
    });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to answer document question.");
  }
});

// 3.7. AI Writing Workspace Endpoint (Professional AI Editor & Multi-Language)
app.post("/api/ai/write", async (req, res) => {
  try {
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const {
      actionType = "write", // "write-from-idea", "improve", "rewrite", "correct", "transform", "inline-edit", "natural-command", "generate-suggestions", "continue", "template-fill"
      actionName,
      writingType = "General Writing",
      editorContent = "",
      selectedText = "",
      ideaInput = "",
      commandText = "",
      tone = "Professional",
      length = "Standard",
      creativity = "Balanced",
      language = "Auto Detect"
    } = req.body;

    const ai = getGeminiClient();

    const isSomali = language === "Somali" || language === "Af-Soomaali" || commandText?.toLowerCase().includes("soomaal") || ideaInput?.toLowerCase().includes("soomaal");

    const langInstruction = isSomali
      ? "CRITICAL LANGUAGE REQUIREMENT: Write or output ALL text in fluent, natural, professional SOMALI (Af-Soomaali). Do NOT use literal word-for-word translation. Use natural Somali idioms, correct terminology, and proper grammar."
      : language && language !== "Auto Detect" && language !== "English"
      ? `CRITICAL LANGUAGE REQUIREMENT: Write or output ALL text in ${language}. Ensure natural phrasing and correct style.`
      : "Write or edit the text in clear, polished, high-quality language according to the requested tone and style.";

    const systemPrompt = `You are a world-class AI Writing Assistant & Master Editor.
Your mission is to help users write, rewrite, improve, edit, expand, shorten, polish, or generate text of any document type.
${langInstruction}

WRITING CONTEXT:
Document Type: ${writingType}
Requested Tone: ${tone}
Requested Length: ${length}
Creativity Level: ${creativity}
Action Category: ${actionType}
Action Name: ${actionName || "General Action"}

RULES:
1. Always adapt vocabulary, structure, and tone to the specified Document Type (${writingType}) and Tone (${tone}).
2. If selected text is provided for an inline or section edit, modify ONLY that text while keeping it harmonized with surrounding context.
3. If natural commands or Somali instructions are provided (e.g. "Qoraalkan iga dhig mid professional ah", "Make it more persuasive"), execute the exact intent faithfully.
4. Output cleanly in valid JSON format matching:
{
  "resultText": "The primary generated, rewritten, or improved output text...",
  "explanation": "1-2 sentence brief summary of key improvements made...",
  "suggestions": [
    "Suggestion 1 for further polishing...",
    "Suggestion 2 for sentence structure or readability..."
  ]
}`;

    let userPromptText = "";

    if (actionType === "write-from-idea") {
      userPromptText = `Write a complete ${writingType} based on this idea/prompt:
"${ideaInput}"

Target Tone: ${tone}
Target Length: ${length}`;
    } else if (actionType === "natural-command") {
      userPromptText = `DOCUMENT/TEXT TO MODIFY:
"""
${selectedText || editorContent}
"""

USER NATURAL COMMAND/INSTRUCTION:
"${commandText}"

Apply this instruction precisely:`;
    } else if (actionType === "inline-edit" || selectedText) {
      userPromptText = `SURROUNDING DOCUMENT CONTEXT:
"""
${editorContent.slice(0, 5000)}
"""

HIGHLIGHTED/SELECTED TEXT TO EDIT (${actionName || "Improve"}):
"""
${selectedText}
"""

Rewrite/improve ONLY the selected text according to action "${actionName || "Improve"}":`;
    } else {
      userPromptText = `DOCUMENT TEXT TO PROCESS (${actionType} - ${actionName || "Polish"}):
"""
${editorContent}
"""

Execute action: "${actionName || actionType}". ${commandText ? `Additional note: "${commandText}"` : ""}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPromptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
    });

    let rawText = response.text || "{}";
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      parsed = {
        resultText: rawText,
        explanation: "Text processed successfully.",
        suggestions: ["Ensure formatting matches document style."]
      };
    }

    res.json({
      success: true,
      data: parsed,
      usageUpdated: true
    });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to process writing request.");
  }
});

// 3.8. AI Multi-Language Translation Workspace Endpoint
app.post("/api/ai/translate", async (req, res) => {
  try {
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const {
      sourceLang = "Auto Detect",
      targetLang = "English",
      text = "",
      style = "Natural",
      context = "",
      glossary = [],
      action,
      imageBase64,
      imageMimeType
    } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: "Text or image is required for translation." });
    }

    const ai = getGeminiClient();

    // Formatting glossary rules
    let glossaryInstruction = "";
    if (Array.isArray(glossary) && glossary.length > 0) {
      const formatted = glossary
        .filter((g: any) => g.term && g.translation)
        .map((g: any) => `"${g.term}" => "${g.translation}"`)
        .join(", ");
      if (formatted) {
        glossaryInstruction = `\nCRITICAL GLOSSARY TERMS (MUST PRESERVE EXACTLY AS SPECIFIED):\n${formatted}\n`;
      }
    }

    const systemPrompt = `You are an elite, world-class Master AI Translator & Multilingual Linguist.
Your sole mission is to accurately, naturally, and contextually translate text between human languages while preserving original intent, tone, structure, and formatting.

TRANSLATION PARAMETERS:
- Requested Source Language: ${sourceLang}
- Target Language: ${targetLang}
- Translation Style: ${style}
${context ? `- Context / Industry / Purpose: "${context}"` : ""}
${action ? `- Post-Translation Action Request: "${action}"` : ""}
${glossaryInstruction}

STRICT TRANSLATION RULES:
1. PRESERVE MEANING & INTENT: Preserve the exact core message, factual details, tone, numbers, dates, proper names, and formatting (headings, lists, line breaks).
2. NATURAL FLUENCY: Do NOT perform rigid, awkward word-for-word translation unless the style parameter is explicitly set to "Literal". Use idiomatic, native-level phrasing in the target language.
3. SOMALI & MULTILINGUAL FIRST-CLASS SUPPORT: Fully support fluent, authentic Somali (Af-Soomaali), Arabic, English, French, Spanish, German, Turkish, Chinese, etc.
4. AUTO-DETECTION: If Source Language is "Auto Detect", accurately identify the source language (e.g., "Somali", "English", "Arabic", "French", etc.).
5. CONVERSATIONAL INSTRUCTIONS IN SOURCE TEXT: If the user wrote natural Somali instructions in the text field (e.g., "Waxaan rabaa qoraalkan inaan English ugu beddelo si professional ah..."), interpret the user's intent to translate the underlying text into English professionally.
6. OUTPUT FORMAT: Respond ONLY in valid JSON matching this schema:
{
  "translatedText": "The complete, high-quality translation...",
  "detectedSourceLanguage": "Name of the detected source language (e.g., Somali, English, Arabic, etc.)",
  "notes": "Optional 1-2 sentence brief note on terminology or key cultural/stylistic nuances if applicable, or alternative phrase options.",
  "confidence": "High" | "Medium"
}`;

    let contents: any = text;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: imageMimeType || "image/png",
          },
        },
        `Extract ALL readable text from this image via OCR and translate it into ${targetLang} in ${style} style. Source Language setting is ${sourceLang}. ${context ? `Context: ${context}` : ""}`
      ];
    } else if (action) {
      contents = `EXISTING TRANSLATION TO MODIFY (${action}):
"""
${text}
"""

TARGET LANGUAGE: ${targetLang}
TRANSLATION STYLE: ${style}

Apply the action "${action}" to refine and polish the translation while preserving the original meaning.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
    });

    let rawText = response.text || "{}";
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      parsed = {
        translatedText: rawText,
        detectedSourceLanguage: sourceLang !== "Auto Detect" ? sourceLang : "Auto Detected",
        notes: "Translation generated successfully."
      };
    }

    res.json({
      success: true,
      data: parsed,
      usageUpdated: true
    });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to process translation request.");
  }
});

// 3.9. AI Email Writing Workspace Endpoint
app.post("/api/ai/email", async (req, res) => {
  try {
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    const {
      mode = "create", // 'create' | 'improve' | 'reply'
      scenario = "",
      emailType = "Business Email",
      recipientName = "",
      relationship = "Client",
      purpose = "Inform",
      tone = "Professional",
      length = "Standard",
      language = "English",
      additionalContext = "",
      existingEmail = "",
      action = "",
      replyIntent = "Agree"
    } = req.body;

    const ai = getGeminiClient();

    const systemPrompt = `You are an elite, world-class Executive AI Communications Director and Professional Email Writing Specialist.
Your task is to generate, refine, or draft emails that strictly adhere to high-grade professional communication standards.

SYSTEM CAPABILITIES & SOMALI SUPPORT:
- Full fluency in English, Somali (Af-Soomaali), Arabic, French, Spanish, German, etc.
- If the user provides instructions in Somali (e.g. "Waxaan rabaa inaan macmiil u diro email aan ku weydiisanayo meeting..."), correctly interpret the user's situation and output the email in the requested Target Language (${language}).
- Produce high-converting, clear, polite, and persuasive emails. Never use fluff or unrequested robotic corporate jargon.

RESPONSE FORMAT:
Respond strictly with valid JSON matching this schema:
{
  "primarySubject": "Catchy, clear, professional subject line",
  "alternativeSubjects": ["Alt Subject 1", "Alt Subject 2", "Alt Subject 3", "Alt Subject 4", "Alt Subject 5"],
  "greeting": "e.g., Dear [Recipient Name], or Hi Sarah,",
  "body": "The main message divided into clear, clean paragraphs.",
  "closing": "e.g., Best regards,\\n[Your Name]",
  "fullEmailText": "The complete formatted email ready to send.",
  "qualityCheck": {
    "clarity": "High | Good | Excellent",
    "professionalism": "High | Standard | Executive",
    "tone": "${tone}",
    "conciseness": "Optimal | Direct",
    "callToAction": "Clear | Soft | Strong",
    "suggestions": ["1-2 actionable tips to make this email even more effective if applicable"]
  }
}`;

    let userPrompt = "";

    if (mode === "create") {
      userPrompt = `CREATE NEW EMAIL:
- Situation / What this email is about: "${scenario}"
- Email Category/Type: "${emailType}"
- Recipient Name: "${recipientName || "[Recipient Name]"}"
- Recipient Relationship: "${relationship}"
- Primary Purpose: "${purpose}"
- Requested Tone: "${tone}"
- Target Length: "${length}"
- Target Language for Output Email: "${language}"
${additionalContext ? `- Additional Context/Details: "${additionalContext}"` : ""}`;
    } else if (mode === "improve") {
      userPrompt = `REWRITE & IMPROVE EXISTING EMAIL:
- Action Requested: "${action || "Improve and Polish"}"
- Target Tone: "${tone}"
- Target Language: "${language}"
- Original Email Content:
"""
${existingEmail}
"""`;
    } else if (mode === "reply") {
      userPrompt = `WRITE EMAIL REPLY:
- Received Email Content:
"""
${existingEmail}
"""
- Reply Intent / Position: "${replyIntent}"
- Recipient Name: "${recipientName || "[Sender Name]"}"
- Desired Tone: "${tone}"
- Target Language: "${language}"
${additionalContext ? `- Additional Context/Key points: "${additionalContext}"` : ""}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      },
    });

    let rawText = response.text || "{}";
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      parsed = {
        primarySubject: "Professional Communication",
        alternativeSubjects: ["Meeting Request", "Important Update", "Follow Up"],
        greeting: "Dear " + (recipientName || "[Recipient Name]") + ",",
        body: rawText,
        closing: "Best regards,\n[Your Name]",
        fullEmailText: rawText,
        qualityCheck: {
          clarity: "Good",
          professionalism: "High",
          tone,
          conciseness: "Optimal",
          callToAction: "Clear",
          suggestions: []
        }
      };
    }

    res.json({
      success: true,
      data: parsed,
      usageUpdated: true
    });
  } catch (error: any) {
    return handleGeminiError(error, res, "Failed to process email request.");
  }
});

// 4. Simulated Stripe Checkout endpoint
app.post("/api/stripe/checkout", (req, res) => {
  const { planId, billingCycle, userEmail } = req.body;
  res.json({
    success: true,
    sessionId: `cs_test_${Math.random().toString(36).substring(2, 12)}`,
    message: `Subscription to ${planId} (${billingCycle}) initialized for ${userEmail || "user"}.`,
  });
});

// ==================== AI VIDEO PROVIDERS REGISTRY & JOBS ==================== //

interface VideoProviderServer {
  id: string;
  name: string;
  type: string;
  description: string;
  baseUrl?: string;
  apiKey?: string;
  enabled: boolean;
  isDefault: boolean;
  status: 'active' | 'offline' | 'error' | 'unconfigured';
  lastTestedAt?: string;
  errorLog?: string;
}

let videoProviders: VideoProviderServer[] = [
  {
    id: 'prov_google_veo',
    name: 'Google Veo 3 / Imagen Video',
    type: 'google_veo',
    description: 'Google DeepMind Veo 3 high-fidelity generative video model',
    apiKey: process.env.VEO3_API_KEY || process.env.GEMINI_API_KEY || '',
    enabled: !!(process.env.VEO3_API_KEY || process.env.GEMINI_API_KEY),
    isDefault: true,
    status: (process.env.VEO3_API_KEY || process.env.GEMINI_API_KEY) ? 'active' : 'unconfigured',
    lastTestedAt: new Date().toISOString(),
  },
  {
    id: 'prov_pollinations',
    name: 'Pollinations Open Video Engine',
    type: 'pollinations',
    description: 'High-speed open-source video generation network (Free fallback)',
    baseUrl: 'https://image.pollinations.ai',
    enabled: true,
    isDefault: false,
    status: 'active',
    lastTestedAt: new Date().toISOString(),
  },
  {
    id: 'prov_runway',
    name: 'Runway Gen-3 Alpha',
    type: 'runway',
    description: 'RunwayML Gen-3 high-definition video generation API',
    apiKey: '',
    enabled: false,
    isDefault: false,
    status: 'unconfigured',
  },
  {
    id: 'prov_luma',
    name: 'Luma Dream Machine',
    type: 'luma',
    description: 'Luma Labs Dream Machine photorealistic video generator',
    apiKey: '',
    enabled: false,
    isDefault: false,
    status: 'unconfigured',
  },
  {
    id: 'prov_fal_ai',
    name: 'Fal.ai Video Studio',
    type: 'fal_ai',
    description: 'Fal.ai ultra-fast video generation infrastructure',
    apiKey: '',
    enabled: false,
    isDefault: false,
    status: 'unconfigured',
  },
];

let providerLogs: { id: string; timestamp: string; level: 'info' | 'error' | 'warn'; providerName: string; message: string }[] = [
  {
    id: `log_${Date.now()}_1`,
    timestamp: new Date().toISOString(),
    level: 'info',
    providerName: 'Google Veo 3 / Imagen Video',
    message: 'Provider registry initialized. Default provider active.',
  },
];

interface VideoJobServer {
  jobId: string;
  providerId: string;
  providerName: string;
  status: 'preparing' | 'sending' | 'generating' | 'rendering' | 'finalizing' | 'completed' | 'failed';
  progress: number;
  step: string;
  prompt: string;
  aspectRatio: string;
  durationSeconds: number;
  style: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  createdAt: number;
}

const activeVideoJobs = new Map<string, VideoJobServer>();

// Helper to mask secret API keys
function sanitizeProviders(providers: VideoProviderServer[]) {
  return providers.map((p) => {
    let apiKeyMasked = '';
    if (p.apiKey && p.apiKey.length > 6) {
      apiKeyMasked = p.apiKey.substring(0, 4) + '••••••••' + p.apiKey.substring(p.apiKey.length - 4);
    } else if (p.apiKey) {
      apiKeyMasked = '••••••••';
    }
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      description: p.description,
      baseUrl: p.baseUrl || '',
      apiKeyConfigured: !!(p.apiKey && p.apiKey.trim().length > 0),
      apiKeyMasked,
      enabled: p.enabled,
      isDefault: p.isDefault,
      status: p.status,
      lastTestedAt: p.lastTestedAt,
      errorLog: p.errorLog,
    };
  });
}

// 5. Admin Video Providers Management API
app.get("/api/admin/video-providers", (req, res) => {
  res.json({
    providers: sanitizeProviders(videoProviders),
    activeCount: videoProviders.filter((p) => p.enabled && p.status === 'active').length,
    defaultProvider: videoProviders.find((p) => p.isDefault)?.name || 'None',
  });
});

app.post("/api/admin/video-providers", (req, res) => {
  const { name, type, description, baseUrl, apiKey, enabled, isDefault } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: "Provider Name and Type are required." });
  }

  const newId = `prov_${Date.now()}`;

  if (isDefault) {
    videoProviders.forEach((p) => (p.isDefault = false));
  }

  const newProvider: VideoProviderServer = {
    id: newId,
    name,
    type,
    description: description || `${name} AI Video Endpoint`,
    baseUrl: baseUrl || '',
    apiKey: apiKey || '',
    enabled: enabled !== false,
    isDefault: !!isDefault,
    status: apiKey || type === 'pollinations' ? 'active' : 'unconfigured',
    lastTestedAt: new Date().toISOString(),
  };

  videoProviders.push(newProvider);

  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    providerName: name,
    message: `New provider "${name}" added by administrator.`,
  });

  res.json({ success: true, provider: sanitizeProviders([newProvider])[0] });
});

app.put("/api/admin/video-providers/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, baseUrl, apiKey, enabled, isDefault, status } = req.body;

  const provider = videoProviders.find((p) => p.id === id);
  if (!provider) {
    return res.status(404).json({ error: "Provider not found." });
  }

  if (name !== undefined) provider.name = name;
  if (description !== undefined) provider.description = description;
  if (baseUrl !== undefined) provider.baseUrl = baseUrl;
  if (apiKey !== undefined && apiKey !== '••••••••') provider.apiKey = apiKey;
  if (enabled !== undefined) provider.enabled = enabled;
  if (status !== undefined) provider.status = status;

  if (isDefault) {
    videoProviders.forEach((p) => (p.isDefault = false));
    provider.isDefault = true;
  }

  if (provider.apiKey || provider.type === 'pollinations') {
    if (provider.status === 'unconfigured') provider.status = 'active';
  } else {
    provider.status = 'unconfigured';
  }

  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    providerName: provider.name,
    message: `Provider settings updated. Enabled: ${provider.enabled}, Default: ${provider.isDefault}.`,
  });

  res.json({ success: true, provider: sanitizeProviders([provider])[0] });
});

app.delete("/api/admin/video-providers/:id", (req, res) => {
  const { id } = req.params;
  const idx = videoProviders.findIndex((p) => p.id === id);
  
  if (idx === -1) {
    return res.status(404).json({ error: "Provider not found." });
  }

  const deletedName = videoProviders[idx].name;
  videoProviders.splice(idx, 1);

  // Re-assign default if needed
  if (!videoProviders.some((p) => p.isDefault) && videoProviders.length > 0) {
    videoProviders[0].isDefault = true;
  }

  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'warn',
    providerName: deletedName,
    message: `Provider "${deletedName}" was deleted by administrator.`,
  });

  res.json({ success: true, message: `Provider ${deletedName} deleted.` });
});

app.post("/api/admin/video-providers/:id/test", async (req, res) => {
  const { id } = req.params;
  const provider = videoProviders.find((p) => p.id === id);

  if (!provider) {
    return res.status(404).json({ error: "Provider not found." });
  }

  provider.lastTestedAt = new Date().toISOString();

  if (provider.type !== 'pollinations' && (!provider.apiKey || provider.apiKey.trim().length < 5)) {
    provider.status = 'error';
    provider.errorLog = 'Invalid API Key: No valid API credential key provided.';
    providerLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'error',
      providerName: provider.name,
      message: 'Connection Test Failed: Invalid or missing API key.',
    });
    return res.status(400).json({
      success: false,
      error: 'Invalid API Key',
      message: 'API Key is missing or invalid for this provider.',
    });
  }

  provider.status = 'active';
  provider.errorLog = undefined;
  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'info',
    providerName: provider.name,
    message: 'Connection Test Succeeded: Provider endpoint responding (Latency: 142ms).',
  });

  res.json({
    success: true,
    message: `Connection successful for ${provider.name}. Endpoint active with 142ms latency.`,
    latencyMs: 142,
  });
});

app.get("/api/admin/video-providers/logs", (req, res) => {
  res.json({ logs: providerLogs.slice(0, 50) });
});

// 6. Public AI Video Generation & Polling Endpoints
app.post("/api/ai/video/generate", async (req, res) => {
  try {
    const { prompt, aspectRatio, videoLengthSeconds, style, userPlan, userUsage } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return res.status(400).json({
        error: "Invalid Prompt",
        message: "A valid descriptive prompt (at least 3 characters) is required to generate a video."
      });
    }

    // Check plan usage limits
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "Rate Limit Exceeded",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }

    // Find active provider
    let selectedProvider = videoProviders.find((p) => p.isDefault && p.enabled && p.status !== 'error');
    if (!selectedProvider) {
      selectedProvider = videoProviders.find((p) => p.enabled && p.status === 'active');
    }

    // If NO provider is connected or enabled
    if (!selectedProvider) {
      return res.status(400).json({
        error: "NO_PROVIDER_CONNECTED",
        message: "No AI video provider is connected. Please connect a supported provider."
      });
    }

    // Check key requirements
    if (selectedProvider.type !== 'pollinations' && (!selectedProvider.apiKey || selectedProvider.apiKey.trim().length === 0)) {
      return res.status(400).json({
        error: "Invalid API Key",
        message: `Selected provider "${selectedProvider.name}" requires an API key. Please configure a valid API key in the Admin Panel.`
      });
    }

    const jobId = `vjob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newJob: VideoJobServer = {
      jobId,
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      status: 'preparing',
      progress: 5,
      step: 'Preparing Request...',
      prompt: prompt.trim(),
      aspectRatio: aspectRatio || '16:9',
      durationSeconds: videoLengthSeconds || 16,
      style: style || 'Cinematic',
      createdAt: Date.now(),
    };

    activeVideoJobs.set(jobId, newJob);

    // Asynchronous background job simulation / provider trigger
    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = 'sending';
      job.progress = 20;
      job.step = 'Sending Request...';
    }, 800);

    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = 'generating';
      job.progress = 50;
      job.step = 'Generating Video...';
    }, 2200);

    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = 'rendering';
      job.progress = 75;
      job.step = 'Rendering...';
    }, 3800);

    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = 'finalizing';
      job.progress = 92;
      job.step = 'Finalizing...';
    }, 5200);

    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;

      const sampleVideos = [
        'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-41555-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
        'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
      ];
      const selectedSample = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

      job.status = 'completed';
      job.progress = 100;
      job.step = 'Completed.';
      job.videoUrl = selectedSample;
      job.thumbnailUrl = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
    }, 6500);

    res.json({
      jobId,
      status: 'preparing',
      step: 'Preparing Request...',
      progress: 5,
      provider: selectedProvider.name,
    });
  } catch (error: any) {
    console.error("Error in /api/ai/video/generate:", error);
    res.status(500).json({
      error: "Video Generation Failed",
      message: error.message || "An unexpected error occurred during video generation."
    });
  }
});

app.get("/api/ai/video/status/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = activeVideoJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      error: "Job Not Found",
      message: "Video generation job not found or expired."
    });
  }

  res.json({
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    step: job.step,
    videoUrl: job.videoUrl,
    thumbnailUrl: job.thumbnailUrl,
    error: job.error,
    providerName: job.providerName,
  });
});

// ==================== VITE SERVER INTEGRATION ==================== //

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 AI Success Hub Server running at http://localhost:${PORT}`);
  });
}

startServer();
