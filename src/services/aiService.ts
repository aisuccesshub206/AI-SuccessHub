import { UserProfile } from '../types';

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
  aspectRatio?: string;
  style?: string;
  quality?: string;
}

export interface AiServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  reason?: 'ai_daily' | 'ai_monthly' | 'plan_inactive' | 'server_error' | 'invalid_key';
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
      const response = await fetch('/api/ai/chat', {
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

      if (response.status === 429 || data.error === 'USAGE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: data.message || limitCheck.message || 'Daily usage limit exceeded.',
          reason: data.reason || 'ai_daily',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to generate response from Gemini API.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: { result: data.result },
      };
    } catch (err: any) {
      console.error('aiService.sendChatMessage error:', err);
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
      const response = await fetch('/api/ai/generate-text', {
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
          error: data.error || 'Failed to process AI text operation.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: { result: data.result },
      };
    } catch (err: any) {
      console.error('aiService.generateText error:', err);
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
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPlan: options.user?.plan || 'Free',
          userUsage: options.user?.usage || {},
          prompt: options.prompt,
          aspectRatio: options.aspectRatio,
          style: options.style,
          quality: options.quality,
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
          error: data.error || 'Failed to generate image.',
          reason: 'server_error',
        };
      }

      return {
        success: true,
        data: {
          imageUrl: data.imageUrl,
          caption: data.caption,
        },
      };
    } catch (err: any) {
      console.error('aiService.generateImage error:', err);
      return {
        success: false,
        error: err.message || 'Network error communicating with AI image generator.',
        reason: 'server_error',
      };
    }
  },
};
