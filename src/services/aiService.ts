import { UserProfile } from '../types';
import { getApiUrl } from './mobileService';

export type GlobalAiStatus = 'operational' | 'quota_exceeded' | 'key_missing' | 'offline' | 'checking';

export interface AiConnectivityStatus {
  status: GlobalAiStatus;
  configured: boolean;
  message: string;
  lastChecked?: string;
  nonAiToolsOperational: boolean;
  consecutiveFailures?: number;
}

export function broadcastAiStatus(status: GlobalAiStatus, message?: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ai-service-status-change', {
        detail: { status, message, timestamp: Date.now() },
      })
    );
  }
}

export async function checkAiConnectivity(probe = false): Promise<AiConnectivityStatus> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      status: 'offline',
      configured: true,
      message: 'Network offline. Offline tools and PDF utilities remain fully operational.',
      nonAiToolsOperational: true,
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    const url = getApiUrl(`/api/ai/status${probe ? '?probe=true' : ''}`);
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      if (res.status === 429) {
        return {
          status: 'quota_exceeded',
          configured: true,
          message: 'AI API quota is currently exceeded. Non-AI tools are operational.',
          nonAiToolsOperational: true,
          lastChecked: new Date().toISOString(),
        };
      }
      // Try fallback to /api/health
      const healthRes = await fetch(getApiUrl('/api/health'));
      if (healthRes.ok) {
        const hData = await healthRes.json();
        return {
          status: hData.geminiConfigured ? 'operational' : 'key_missing',
          configured: !!hData.geminiConfigured,
          message: hData.geminiConfigured ? 'AI Service is operational.' : 'Gemini API key is not configured.',
          nonAiToolsOperational: true,
          lastChecked: new Date().toISOString(),
        };
      }
      return {
        status: 'offline',
        configured: false,
        message: 'Could not reach server status.',
        nonAiToolsOperational: true,
      };
    }

    const data = await res.json();
    return {
      status: (data.status as GlobalAiStatus) || 'operational',
      configured: !!data.configured,
      message: data.message || 'AI service operational.',
      lastChecked: data.lastChecked || new Date().toISOString(),
      nonAiToolsOperational: true,
      consecutiveFailures: data.consecutiveFailures || 0,
    };
  } catch (err: any) {
    return {
      status: 'offline',
      configured: false,
      message: 'Server unreachable or offline. Local features and PDF tools are working.',
      nonAiToolsOperational: true,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Retrieves the Gemini API Key safely from environment variables.
 * In server contexts, process.env.GEMINI_API_KEY is preferred.
 * In client/bundler contexts, import.meta.env checks for fallback configuration.
 */
export function getGeminiApiKey(): string | null {
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  const meta = import.meta as any;
  if (meta && meta.env) {
    return (
      (meta.env.VITE_GEMINI_API_KEY as string) ||
      (meta.env.GEMINI_API_KEY as string) ||
      null
    );
  }
  
  return null;
}

export interface PlanCheckResult {
  allowed: boolean;
  reason?: 'ai_daily' | 'ai_monthly' | 'plan_inactive' | 'server_error' | 'invalid_key';
  message?: string;
  dailyRemaining?: number;
  monthlyRemaining?: number;
}

/**
 * Enforces request count checks against the user's current subscription plan.
 */
export function checkUserAiPlanLimits(user?: UserProfile | null): PlanCheckResult {
  if (!user) {
    // Default guest check (10 requests daily limit)
    return { allowed: true, dailyRemaining: 10, monthlyRemaining: 300 };
  }

  const planName = (user.plan || 'Free').toLowerCase();
  const usage = user.usage || {
    aiRequestsToday: 0,
    aiRequestsLimitDaily: planName.includes('pro') ? 500 : planName.includes('enterprise') || planName.includes('lifetime') ? -1 : 10,
    aiRequestsThisMonth: 0,
    aiRequestsLimitMonthly: planName.includes('pro') ? 10000 : planName.includes('enterprise') || planName.includes('lifetime') ? -1 : 300,
  };

  const dailyUsed = usage.aiRequestsToday || 0;
  const dailyLimit = usage.aiRequestsLimitDaily;
  
  const monthlyUsed = usage.aiRequestsThisMonth || 0;
  const monthlyLimit = usage.aiRequestsLimitMonthly;

  // Check daily limits (-1 means unlimited)
  if (dailyLimit !== -1 && dailyLimit > 0 && dailyUsed >= dailyLimit) {
    return {
      allowed: false,
      reason: 'ai_daily',
      message: `Daily AI limit of ${dailyLimit} requests reached for your ${user.plan} plan (${dailyUsed}/${dailyLimit}). Upgrade your subscription for higher limits!`,
      dailyRemaining: 0,
      monthlyRemaining: monthlyLimit === -1 ? 999999 : Math.max(0, monthlyLimit - monthlyUsed),
    };
  }

  // Check monthly limits (-1 means unlimited)
  if (monthlyLimit !== -1 && monthlyLimit > 0 && monthlyUsed >= monthlyLimit) {
    return {
      allowed: false,
      reason: 'ai_monthly',
      message: `Monthly AI limit of ${monthlyLimit} requests reached for your ${user.plan} plan (${monthlyUsed}/${monthlyLimit}). Upgrade your subscription for unlimited access!`,
      dailyRemaining: dailyLimit === -1 ? 999999 : Math.max(0, dailyLimit - dailyUsed),
      monthlyRemaining: 0,
    };
  }

  return {
    allowed: true,
    dailyRemaining: dailyLimit === -1 ? 999999 : Math.max(0, dailyLimit - dailyUsed),
    monthlyRemaining: monthlyLimit === -1 ? 999999 : Math.max(0, monthlyLimit - monthlyUsed),
  };
}

export interface ChatRequestOptions {
  user?: UserProfile;
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
}

export interface TextGenerationOptions {
  user?: UserProfile;
  toolType: string;
  prompt: string;
  contextText?: string;
  tone?: string;
  targetLanguage?: string;
  length?: string;
}

export interface ImageGenerationOptions {
  user?: UserProfile;
  prompt: string;
  tool?: 'image-generator' | 'thumbnail-generator';
  isThumbnail?: boolean;
  imageType?: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
  colorMood?: string;
  customColor?: string;
  cameraAngle?: string;
  cameraShot?: string;
  lens?: string;
  lighting?: string;
  depthOfField?: string;
  composition?: string;
  background?: string;
  negativePrompt?: string;
  refImage?: string | null;
  refMode?: string;
  // YouTube Thumbnail specific options:
  hookText?: string;
  subjectPlacement?: string;
  facialExpression?: string;
  contrastStyle?: string;
}

export interface AiServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  reason?: 'ai_daily' | 'ai_monthly' | 'plan_inactive' | 'server_error' | 'invalid_key' | 'gemini_quota';
}

/**
 * AI Service API Wrapper
 * Routes requests to backend Google Gemini endpoints with pre-flight plan limits enforcement.
 */
export const aiService = {
  getApiKey: getGeminiApiKey,
  checkLimits: checkUserAiPlanLimits,

  async sendChatMessage(options: ChatRequestOptions): Promise<AiServiceResponse<{ result: string }>> {
    // 1. Enforce Plan Limits
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          messages: options.messages,
          systemInstruction: options.systemInstruction,
        }),
      });

      const data = await response.json();

      if (data.error === 'QUOTA_EXCEEDED' || data.reason === 'gemini_quota') {
        broadcastAiStatus('quota_exceeded', data.message);
        return {
          success: false,
          error: data.message || 'AI service quota temporarily exceeded.',
          reason: 'gemini_quota',
        };
      }

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Daily usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        if (data.error === 'API_KEY_MISSING' || data.reason === 'missing_key') {
          broadcastAiStatus('key_missing', data.message);
        }
        return {
          success: false,
          error: data.error || 'Failed to generate response from Gemini API.',
          reason: 'server_error',
        };
      }

      broadcastAiStatus('operational');
      return {
        success: true,
        data: { result: data.result },
      };
    } catch (err: any) {
      console.error('aiService.sendChatMessage error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        broadcastAiStatus('offline', 'Network connection offline.');
      }
      return {
        success: false,
        error: err.message || 'Network error communicating with AI server.',
        reason: 'server_error',
      };
    }
  },

  async generateText(options: TextGenerationOptions): Promise<AiServiceResponse<{ result: string }>> {
    // 1. Enforce Plan Limits
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/generate-text'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          toolType: options.toolType,
          prompt: options.prompt,
          contextText: options.contextText,
          tone: options.tone,
          targetLanguage: options.targetLanguage,
          length: options.length,
        }),
      });

      const data = await response.json();

      if (data.error === 'QUOTA_EXCEEDED' || data.reason === 'gemini_quota') {
        broadcastAiStatus('quota_exceeded', data.message);
        return {
          success: false,
          error: data.message || 'AI service quota temporarily exceeded.',
          reason: 'gemini_quota',
        };
      }

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        if (data.error === 'API_KEY_MISSING' || data.reason === 'missing_key') {
          broadcastAiStatus('key_missing', data.message);
        }
        return {
          success: false,
          error: data.error || 'Failed to process AI text operation.',
          reason: 'server_error',
        };
      }

      broadcastAiStatus('operational');
      return {
        success: true,
        data: { result: data.result },
      };
    } catch (err: any) {
      console.error('aiService.generateText error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        broadcastAiStatus('offline', 'Network connection offline.');
      }
      return {
        success: false,
        error: err.message || 'Network error communicating with AI server.',
        reason: 'server_error',
      };
    }
  },

  async generateImage(options: ImageGenerationOptions): Promise<AiServiceResponse<{ imageUrl: string; caption?: string }>> {
    // 1. Enforce Plan Limits
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/generate-image'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          prompt: options.prompt,
          tool: options.tool,
          isThumbnail: options.isThumbnail,
          imageType: options.imageType,
          style: options.style,
          aspectRatio: options.aspectRatio,
          quality: options.quality,
          colorMood: options.colorMood,
          customColor: options.customColor,
          cameraAngle: options.cameraAngle,
          cameraShot: options.cameraShot,
          lens: options.lens,
          lighting: options.lighting,
          depthOfField: options.depthOfField,
          composition: options.composition,
          background: options.background,
          negativePrompt: options.negativePrompt,
          refImage: options.refImage,
          refMode: options.refMode,
          hookText: options.hookText,
          subjectPlacement: options.subjectPlacement,
          facialExpression: options.facialExpression,
          contrastStyle: options.contrastStyle,
        }),
      });

      const data = await response.json();

      if (data.error === 'QUOTA_EXCEEDED' || data.reason === 'gemini_quota') {
        broadcastAiStatus('quota_exceeded', data.message);
        return {
          success: false,
          error: data.message || 'AI service quota temporarily exceeded.',
          reason: 'gemini_quota',
        };
      }

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        if (data.error === 'API_KEY_MISSING' || data.reason === 'missing_key') {
          broadcastAiStatus('key_missing', data.message);
        }
        return {
          success: false,
          error: data.error || 'Failed to generate image.',
          reason: 'server_error',
        };
      }

      broadcastAiStatus('operational');
      return {
        success: true,
        data: {
          imageUrl: data.imageUrl,
          caption: data.caption,
        },
      };
    } catch (err: any) {
      console.error('aiService.generateImage error:', err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        broadcastAiStatus('offline', 'Network connection offline.');
      }
      return {
        success: false,
        error: err.message || 'Network error communicating with AI image generator.',
        reason: 'server_error',
      };
    }
  },

  async summarizeDocument(options: {
    user?: UserProfile;
    documentText: string;
    fileName: string;
    fileType: string;
    summaryLength?: string;
    summaryStyle?: string;
    summaryLanguage?: string;
    selectedRange?: string;
    actionType?: string;
    customInstructions?: string;
  }): Promise<AiServiceResponse<any>> {
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/summarize-document'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          documentText: options.documentText,
          fileName: options.fileName,
          fileType: options.fileType,
          summaryLength: options.summaryLength,
          summaryStyle: options.summaryStyle,
          summaryLanguage: options.summaryLanguage,
          selectedRange: options.selectedRange,
          actionType: options.actionType,
          customInstructions: options.customInstructions,
        }),
      });

      const data = await response.json();

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to analyze document.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (err: any) {
      console.error('aiService.summarizeDocument error:', err);
      return {
        success: false,
        error: err.message || 'Network error communicating with AI document analyzer.',
        reason: 'server_error',
      };
    }
  },

  async askDocumentQuestion(options: {
    user?: UserProfile;
    documentText: string;
    fileName: string;
    question: string;
    language?: string;
  }): Promise<AiServiceResponse<{ answer: string }>> {
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/document-qa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          documentText: options.documentText,
          fileName: options.fileName,
          question: options.question,
          language: options.language,
        }),
      });

      const data = await response.json();

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to answer document question.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: { answer: data.answer },
      };
    } catch (err: any) {
      console.error('aiService.askDocumentQuestion error:', err);
      return {
        success: false,
        error: err.message || 'Network error communicating with AI Document Q&A.',
        reason: 'server_error',
      };
    }
  },

  async executeWritingAction(options: {
    user?: UserProfile;
    actionType?: string;
    actionName?: string;
    writingType?: string;
    editorContent?: string;
    selectedText?: string;
    ideaInput?: string;
    commandText?: string;
    tone?: string;
    length?: string;
    creativity?: string;
    language?: string;
  }): Promise<AiServiceResponse<{ resultText: string; explanation?: string; suggestions?: string[] }>> {
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/write'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          actionType: options.actionType || 'write',
          actionName: options.actionName,
          writingType: options.writingType || 'General Writing',
          editorContent: options.editorContent || '',
          selectedText: options.selectedText || '',
          ideaInput: options.ideaInput || '',
          commandText: options.commandText || '',
          tone: options.tone || 'Professional',
          length: options.length || 'Standard',
          creativity: options.creativity || 'Balanced',
          language: options.language || 'Auto Detect',
        }),
      });

      const data = await response.json();

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to process AI writing action.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: data.data || { resultText: data.result || '' },
      };
    } catch (err: any) {
      console.error('aiService.executeWritingAction error:', err);
      return {
        success: false,
        error: err.message || 'Network error communicating with AI Writing Workspace.',
        reason: 'server_error',
      };
    }
  },

  async translateText(options: {
    user?: UserProfile;
    sourceLang?: string;
    targetLang?: string;
    text?: string;
    style?: string;
    context?: string;
    glossary?: Array<{ term: string; translation: string }>;
    action?: string;
    imageBase64?: string;
    imageMimeType?: string;
  }): Promise<AiServiceResponse<{
    translatedText: string;
    detectedSourceLanguage?: string;
    notes?: string;
    confidence?: string;
  }>> {
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          sourceLang: options.sourceLang || 'Auto Detect',
          targetLang: options.targetLang || 'English',
          text: options.text || '',
          style: options.style || 'Natural',
          context: options.context || '',
          glossary: options.glossary || [],
          action: options.action,
          imageBase64: options.imageBase64,
          imageMimeType: options.imageMimeType,
        }),
      });

      const data = await response.json();

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to process AI translation.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: data.data || { translatedText: '' },
      };
    } catch (err: any) {
      console.error('aiService.translateText error:', err);
      return {
        success: false,
        error: err.message || 'Network error communicating with AI Translation Workspace.',
        reason: 'server_error',
      };
    }
  },

  async generateEmail(options: {
    user?: UserProfile;
    mode?: 'create' | 'improve' | 'reply';
    scenario?: string;
    emailType?: string;
    recipientName?: string;
    relationship?: string;
    purpose?: string;
    tone?: string;
    length?: string;
    language?: string;
    additionalContext?: string;
    existingEmail?: string;
    action?: string;
    replyIntent?: string;
  }): Promise<AiServiceResponse<{
    primarySubject: string;
    alternativeSubjects: string[];
    greeting: string;
    body: string;
    closing: string;
    fullEmailText: string;
    qualityCheck?: {
      clarity?: string;
      professionalism?: string;
      tone?: string;
      conciseness?: string;
      callToAction?: string;
      suggestions?: string[];
    };
  }>> {
    const limitCheck = checkUserAiPlanLimits(options.user);
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.message,
        reason: limitCheck.reason,
      };
    }

    try {
      const response = await fetch(getApiUrl('/api/ai/email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          mode: options.mode || 'create',
          scenario: options.scenario || '',
          emailType: options.emailType || 'Business Email',
          recipientName: options.recipientName || '',
          relationship: options.relationship || 'Client',
          purpose: options.purpose || 'Inform',
          tone: options.tone || 'Professional',
          length: options.length || 'Standard',
          language: options.language || 'English',
          additionalContext: options.additionalContext || '',
          existingEmail: options.existingEmail || '',
          action: options.action || '',
          replyIntent: options.replyIntent || 'Agree',
        }),
      });

      const data = await response.json();

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to generate email.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (err: any) {
      console.error('aiService.generateEmail error:', err);
      return {
        success: false,
        error: err.message || 'Network error communicating with AI Email Workspace.',
        reason: 'server_error',
      };
    }
  },
};
