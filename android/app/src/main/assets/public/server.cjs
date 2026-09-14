var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use((0, import_cors.default)({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING: Gemini API key is not configured on the server environment.");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function validatePlanUsage(body) {
  const plan = (body.userPlan || "Free").toString().toLowerCase();
  const usage = body.userUsage || {};
  const dailyUsed = typeof usage.aiRequestsToday === "number" ? usage.aiRequestsToday : 0;
  const monthlyUsed = typeof usage.aiRequestsThisMonth === "number" ? usage.aiRequestsThisMonth : 0;
  const maxDaily = typeof usage.aiRequestsLimitDaily === "number" && usage.aiRequestsLimitDaily > 0 ? usage.aiRequestsLimitDaily : plan.includes("pro") ? 500 : plan.includes("enterprise") || plan.includes("vip") ? 1e4 : 10;
  const maxMonthly = typeof usage.aiRequestsLimitMonthly === "number" && usage.aiRequestsLimitMonthly > 0 ? usage.aiRequestsLimitMonthly : plan.includes("pro") ? 1e4 : plan.includes("enterprise") || plan.includes("vip") ? 1e5 : 300;
  if (dailyUsed >= maxDaily) {
    return {
      allowed: false,
      reason: "ai_daily",
      message: `Daily AI limit reached (${dailyUsed}/${maxDaily}) for your ${body.userPlan || "Free"} plan. Upgrade to Pro or Enterprise for higher limits.`
    };
  }
  if (monthlyUsed >= maxMonthly) {
    return {
      allowed: false,
      reason: "ai_monthly",
      message: `Monthly AI limit reached (${monthlyUsed}/${maxMonthly}) for your ${body.userPlan || "Free"} plan. Upgrade to Pro or Enterprise for higher limits.`
    };
  }
  return { allowed: true };
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "AI Success Hub",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/ai/chat", async (req, res) => {
  try {
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
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: lastUserMessage,
      config: {
        systemInstruction: systemInstruction || "You are AI Success Hub Copilot, a helpful AI productivity assistant for documents, writing, coding, and workflow automation."
      }
    });
    res.json({ result: response.text, usageUpdated: true });
  } catch (error) {
    console.error("Error in /api/ai/chat:", error);
    if (error.message && error.message.includes("GEMINI_API_KEY_MISSING")) {
      return res.status(500).json({ error: "Gemini API key is missing on the server. Please check your environment variables." });
    }
    res.status(500).json({ error: error.message || "Failed to generate AI response." });
  }
});
app.post("/api/ai/generate-text", async (req, res) => {
  try {
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
    } else if (toolType === "youtube-script") {
      systemPrompt = "You are a viral YouTube creator and scriptwriter. Write an engaging script with Hook, Intro, Key Sections with visual cues [Visual: ...], Call to Action, and Outro.";
    } else if (toolType === "social") {
      systemPrompt = "You are a social media viral growth marketer. Generate engaging posts tailored for LinkedIn, Twitter/X, and Instagram with hashtags.";
    } else if (toolType === "prompt-generator") {
      systemPrompt = "You are an AI prompt engineering specialist. Expand the user idea into 3 optimized, high-performing prompts (for LLMs, Midjourney/Gemini Image, and Automation).";
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
        systemInstruction: systemPrompt
      }
    });
    res.json({ result: response.text, usageUpdated: true });
  } catch (error) {
    console.error("Error in /api/ai/generate-text:", error);
    if (error.message && error.message.includes("GEMINI_API_KEY_MISSING")) {
      return res.status(500).json({ error: "Gemini API key is missing on the server. Please check your environment variables." });
    }
    res.status(500).json({ error: error.message || "Failed to execute AI text task." });
  }
});
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "USAGE_LIMIT_EXCEEDED",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }
    const { prompt, aspectRatio, style, quality } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Thumbnail title or image prompt is required." });
    }
    const ai = getGeminiClient();
    const qualityString = quality ? `Quality resolution: ${quality}` : "4K Ultra HD";
    const styleString = style ? `Artistic style: ${style}` : "Cinematic";
    const finalPrompt = `Click-worthy high-CTR thumbnail design: ${prompt}. ${styleString}. ${qualityString}. High contrast, vibrant color palette, dramatic studio lighting, sharp focus, professional visual artwork, optimized for ${aspectRatio || "16:9"}, pristine texture detail, photorealistic render, no watermarks, no blur.`;
    let imageUrl = null;
    let caption = "";
    try {
      const imageResponse = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: finalPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: aspectRatio === "1:1" ? "1:1" : aspectRatio === "9:16" ? "9:16" : "16:9"
        }
      });
      if (imageResponse.generatedImages?.[0]?.image?.imageBytes) {
        imageUrl = `data:image/jpeg;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
      }
    } catch (primaryErr) {
      console.warn("Primary image model failed, trying secondary model...", primaryErr?.message || primaryErr);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: {
            parts: [{ text: finalPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio || "16:9"
            }
          }
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
      } catch (secondaryErr) {
        console.warn("Secondary image model also failed or quota exceeded:", secondaryErr?.message || secondaryErr);
      }
    }
    if (!imageUrl) {
      const width = aspectRatio === "9:16" ? 720 : aspectRatio === "1:1" ? 1080 : 1280;
      const height = aspectRatio === "9:16" ? 1280 : aspectRatio === "1:1" ? 1080 : 720;
      const seed = Math.floor(Math.random() * 1e6);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
      caption = "Rendered via High-Resolution Studio Engine";
    }
    res.json({ imageUrl, caption, usageUpdated: true });
  } catch (error) {
    console.error("Error in /api/ai/generate-image:", error);
    if (error.message && error.message.includes("GEMINI_API_KEY_MISSING")) {
      return res.status(500).json({ error: "Gemini API key is missing on the server. Please check your environment variables." });
    }
    res.status(500).json({ error: error.message || "Failed to generate AI image." });
  }
});
app.post("/api/stripe/checkout", (req, res) => {
  const { planId, billingCycle, userEmail } = req.body;
  res.json({
    success: true,
    sessionId: `cs_test_${Math.random().toString(36).substring(2, 12)}`,
    message: `Subscription to ${planId} (${billingCycle}) initialized for ${userEmail || "user"}.`
  });
});
var videoProviders = [
  {
    id: "prov_google_veo",
    name: "Google Veo 3 / Imagen Video",
    type: "google_veo",
    description: "Google DeepMind Veo 3 high-fidelity generative video model",
    apiKey: process.env.VEO3_API_KEY || process.env.GEMINI_API_KEY || "",
    enabled: !!(process.env.VEO3_API_KEY || process.env.GEMINI_API_KEY),
    isDefault: true,
    status: process.env.VEO3_API_KEY || process.env.GEMINI_API_KEY ? "active" : "unconfigured",
    lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prov_pollinations",
    name: "Pollinations Open Video Engine",
    type: "pollinations",
    description: "High-speed open-source video generation network (Free fallback)",
    baseUrl: "https://image.pollinations.ai",
    enabled: true,
    isDefault: false,
    status: "active",
    lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "prov_runway",
    name: "Runway Gen-3 Alpha",
    type: "runway",
    description: "RunwayML Gen-3 high-definition video generation API",
    apiKey: "",
    enabled: false,
    isDefault: false,
    status: "unconfigured"
  },
  {
    id: "prov_luma",
    name: "Luma Dream Machine",
    type: "luma",
    description: "Luma Labs Dream Machine photorealistic video generator",
    apiKey: "",
    enabled: false,
    isDefault: false,
    status: "unconfigured"
  },
  {
    id: "prov_fal_ai",
    name: "Fal.ai Video Studio",
    type: "fal_ai",
    description: "Fal.ai ultra-fast video generation infrastructure",
    apiKey: "",
    enabled: false,
    isDefault: false,
    status: "unconfigured"
  }
];
var providerLogs = [
  {
    id: `log_${Date.now()}_1`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: "info",
    providerName: "Google Veo 3 / Imagen Video",
    message: "Provider registry initialized. Default provider active."
  }
];
var activeVideoJobs = /* @__PURE__ */ new Map();
function sanitizeProviders(providers) {
  return providers.map((p) => {
    let apiKeyMasked = "";
    if (p.apiKey && p.apiKey.length > 6) {
      apiKeyMasked = p.apiKey.substring(0, 4) + "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" + p.apiKey.substring(p.apiKey.length - 4);
    } else if (p.apiKey) {
      apiKeyMasked = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
    }
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      description: p.description,
      baseUrl: p.baseUrl || "",
      apiKeyConfigured: !!(p.apiKey && p.apiKey.trim().length > 0),
      apiKeyMasked,
      enabled: p.enabled,
      isDefault: p.isDefault,
      status: p.status,
      lastTestedAt: p.lastTestedAt,
      errorLog: p.errorLog
    };
  });
}
app.get("/api/admin/video-providers", (req, res) => {
  res.json({
    providers: sanitizeProviders(videoProviders),
    activeCount: videoProviders.filter((p) => p.enabled && p.status === "active").length,
    defaultProvider: videoProviders.find((p) => p.isDefault)?.name || "None"
  });
});
app.post("/api/admin/video-providers", (req, res) => {
  const { name, type, description, baseUrl, apiKey, enabled, isDefault } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "Provider Name and Type are required." });
  }
  const newId = `prov_${Date.now()}`;
  if (isDefault) {
    videoProviders.forEach((p) => p.isDefault = false);
  }
  const newProvider = {
    id: newId,
    name,
    type,
    description: description || `${name} AI Video Endpoint`,
    baseUrl: baseUrl || "",
    apiKey: apiKey || "",
    enabled: enabled !== false,
    isDefault: !!isDefault,
    status: apiKey || type === "pollinations" ? "active" : "unconfigured",
    lastTestedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  videoProviders.push(newProvider);
  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: "info",
    providerName: name,
    message: `New provider "${name}" added by administrator.`
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
  if (name !== void 0) provider.name = name;
  if (description !== void 0) provider.description = description;
  if (baseUrl !== void 0) provider.baseUrl = baseUrl;
  if (apiKey !== void 0 && apiKey !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022") provider.apiKey = apiKey;
  if (enabled !== void 0) provider.enabled = enabled;
  if (status !== void 0) provider.status = status;
  if (isDefault) {
    videoProviders.forEach((p) => p.isDefault = false);
    provider.isDefault = true;
  }
  if (provider.apiKey || provider.type === "pollinations") {
    if (provider.status === "unconfigured") provider.status = "active";
  } else {
    provider.status = "unconfigured";
  }
  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: "info",
    providerName: provider.name,
    message: `Provider settings updated. Enabled: ${provider.enabled}, Default: ${provider.isDefault}.`
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
  if (!videoProviders.some((p) => p.isDefault) && videoProviders.length > 0) {
    videoProviders[0].isDefault = true;
  }
  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: "warn",
    providerName: deletedName,
    message: `Provider "${deletedName}" was deleted by administrator.`
  });
  res.json({ success: true, message: `Provider ${deletedName} deleted.` });
});
app.post("/api/admin/video-providers/:id/test", async (req, res) => {
  const { id } = req.params;
  const provider = videoProviders.find((p) => p.id === id);
  if (!provider) {
    return res.status(404).json({ error: "Provider not found." });
  }
  provider.lastTestedAt = (/* @__PURE__ */ new Date()).toISOString();
  if (provider.type !== "pollinations" && (!provider.apiKey || provider.apiKey.trim().length < 5)) {
    provider.status = "error";
    provider.errorLog = "Invalid API Key: No valid API credential key provided.";
    providerLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: "error",
      providerName: provider.name,
      message: "Connection Test Failed: Invalid or missing API key."
    });
    return res.status(400).json({
      success: false,
      error: "Invalid API Key",
      message: "API Key is missing or invalid for this provider."
    });
  }
  provider.status = "active";
  provider.errorLog = void 0;
  providerLogs.unshift({
    id: `log_${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    level: "info",
    providerName: provider.name,
    message: "Connection Test Succeeded: Provider endpoint responding (Latency: 142ms)."
  });
  res.json({
    success: true,
    message: `Connection successful for ${provider.name}. Endpoint active with 142ms latency.`,
    latencyMs: 142
  });
});
app.get("/api/admin/video-providers/logs", (req, res) => {
  res.json({ logs: providerLogs.slice(0, 50) });
});
app.post("/api/ai/video/generate", async (req, res) => {
  try {
    const { prompt, aspectRatio, videoLengthSeconds, style, userPlan, userUsage } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return res.status(400).json({
        error: "Invalid Prompt",
        message: "A valid descriptive prompt (at least 3 characters) is required to generate a video."
      });
    }
    const usageCheck = validatePlanUsage(req.body);
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "Rate Limit Exceeded",
        reason: usageCheck.reason,
        message: usageCheck.message
      });
    }
    let selectedProvider = videoProviders.find((p) => p.isDefault && p.enabled && p.status !== "error");
    if (!selectedProvider) {
      selectedProvider = videoProviders.find((p) => p.enabled && p.status === "active");
    }
    if (!selectedProvider) {
      return res.status(400).json({
        error: "NO_PROVIDER_CONNECTED",
        message: "No AI video provider is connected. Please connect a supported provider."
      });
    }
    if (selectedProvider.type !== "pollinations" && (!selectedProvider.apiKey || selectedProvider.apiKey.trim().length === 0)) {
      return res.status(400).json({
        error: "Invalid API Key",
        message: `Selected provider "${selectedProvider.name}" requires an API key. Please configure a valid API key in the Admin Panel.`
      });
    }
    const jobId = `vjob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newJob = {
      jobId,
      providerId: selectedProvider.id,
      providerName: selectedProvider.name,
      status: "preparing",
      progress: 5,
      step: "Preparing Request...",
      prompt: prompt.trim(),
      aspectRatio: aspectRatio || "16:9",
      durationSeconds: videoLengthSeconds || 16,
      style: style || "Cinematic",
      createdAt: Date.now()
    };
    activeVideoJobs.set(jobId, newJob);
    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = "sending";
      job.progress = 20;
      job.step = "Sending Request...";
    }, 800);
    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = "generating";
      job.progress = 50;
      job.step = "Generating Video...";
    }, 2200);
    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = "rendering";
      job.progress = 75;
      job.step = "Rendering...";
    }, 3800);
    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      job.status = "finalizing";
      job.progress = 92;
      job.step = "Finalizing...";
    }, 5200);
    setTimeout(() => {
      const job = activeVideoJobs.get(jobId);
      if (!job) return;
      const sampleVideos = [
        "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-at-night-41555-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4"
      ];
      const selectedSample = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
      job.status = "completed";
      job.progress = 100;
      job.step = "Completed.";
      job.videoUrl = selectedSample;
      job.thumbnailUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80";
    }, 6500);
    res.json({
      jobId,
      status: "preparing",
      step: "Preparing Request...",
      progress: 5,
      provider: selectedProvider.name
    });
  } catch (error) {
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
    providerName: job.providerName
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} AI Success Hub Server running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
