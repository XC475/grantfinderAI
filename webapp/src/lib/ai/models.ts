import type { SubscriptionTier } from "@/types/subscriptions";

export type AIModelProvider = "openai" | "anthropic" | "google";

export interface AIModel {
  id: string;
  name: string;
  provider: AIModelProvider;
  description: string;
  contextWindow: number;
  supportsStreaming: boolean;
  tier: "standard" | "premium" | "ultra-premium";
  available: boolean;
  comingSoon?: boolean;
  requiredTier?: SubscriptionTier;
  monthlyLimit?: number | null; // null = unlimited
}

export const DEFAULT_MODEL = "gpt-4o-mini";

export const AVAILABLE_MODELS: AIModel[] = [
  // Standard Models (Available to all)
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast and efficient for most tasks",
    contextWindow: 128000,
    supportsStreaming: true,
    tier: "standard",
    available: true,
    comingSoon: false,
    requiredTier: "free",
  },

  // Premium Models (Starter subscription+)
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Higher quality for complex proposals",
    contextWindow: 128000,
    supportsStreaming: true,
    tier: "premium",
    available: false,
    comingSoon: true,
    requiredTier: "starter",
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Excellent for structured, compliance-focused writing",
    contextWindow: 200000,
    supportsStreaming: true,
    tier: "premium",
    available: false,
    comingSoon: true,
    requiredTier: "starter",
  },

  // Ultra-Premium Models (Professional/Enterprise only)
  {
    id: "gpt-5.1",
    name: "GPT-5.1",
    provider: "openai",
    description: "Latest OpenAI model with advanced reasoning",
    contextWindow: 128000,
    supportsStreaming: true,
    tier: "ultra-premium",
    available: false,
    comingSoon: true,
    requiredTier: "professional",
    monthlyLimit: 100,
  },
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    provider: "openai",
    description: "Most advanced OpenAI model for critical proposals",
    contextWindow: 128000,
    supportsStreaming: true,
    tier: "ultra-premium",
    available: false,
    comingSoon: true,
    requiredTier: "enterprise",
    monthlyLimit: null, // Unlimited on Enterprise
  },
  {
    id: "claude-4-5-sonnet",
    name: "Claude 4.5 Sonnet",
    provider: "anthropic",
    description: "Latest Claude model for complex grant writing",
    contextWindow: 200000,
    supportsStreaming: true,
    tier: "ultra-premium",
    available: false,
    comingSoon: true,
    requiredTier: "professional",
    monthlyLimit: 100,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description: "Google's most capable model for large documents",
    contextWindow: 1000000,
    supportsStreaming: true,
    tier: "ultra-premium",
    available: false,
    comingSoon: true,
    requiredTier: "professional",
    monthlyLimit: 50,
  },
];

/**
 * Get models available to a user based on their subscription tier
 */
export function getAvailableModels(userTier: SubscriptionTier = "free"): AIModel[] {
  return AVAILABLE_MODELS.filter(
    (m) =>
      m.available &&
      (!m.requiredTier || hasAccessToTier(userTier, m.requiredTier))
  );
}

/**
 * Get models that are locked due to subscription tier requirements
 */
export function getLockedModels(userTier: SubscriptionTier = "free"): AIModel[] {
  return AVAILABLE_MODELS.filter(
    (m) =>
      m.available &&
      m.requiredTier &&
      !hasAccessToTier(userTier, m.requiredTier)
  );
}

/**
 * Get models marked as coming soon
 */
export function getComingSoonModels(): AIModel[] {
  return AVAILABLE_MODELS.filter((m) => m.comingSoon && !m.available);
}

/**
 * Check if a user's tier has access to a required tier
 */
export function hasAccessToTier(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierOrder: Record<SubscriptionTier, number> = {
    free: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
  };
  return tierOrder[userTier] >= tierOrder[requiredTier];
}

/**
 * Find a model by ID
 */
export function findModelById(modelId: string): AIModel | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

/**
 * Validate if a model ID is valid
 */
export function isValidModelId(modelId: string): boolean {
  return AVAILABLE_MODELS.some((m) => m.id === modelId);
}

/**
 * Get models that should be visible in the selector based on user preferences
 * If enabledModelIds is null or empty, returns all available models for the tier
 */
export function getVisibleModels(
  allModels: AIModel[],
  enabledModelIds: string[] | null,
  userTier: SubscriptionTier
): AIModel[] {
  // If no preferences set, show all available models
  if (!enabledModelIds || enabledModelIds.length === 0) {
    return allModels.filter(
      (m) =>
        m.available &&
        (!m.requiredTier || hasAccessToTier(userTier, m.requiredTier))
    );
  }

  // Filter to only enabled models that user has access to
  return allModels.filter(
    (m) =>
      enabledModelIds.includes(m.id) &&
      m.available &&
      (!m.requiredTier || hasAccessToTier(userTier, m.requiredTier))
  );
}

/**
 * Get default enabled models for a user tier (all available model IDs)
 * Always includes the default free model
 */
export function getDefaultEnabledModels(userTier: SubscriptionTier): string[] {
  const availableModels = getAvailableModels(userTier);
  const modelIds = availableModels.map((m) => m.id);
  
  // Ensure default free model is always included
  if (!modelIds.includes(DEFAULT_MODEL)) {
    modelIds.push(DEFAULT_MODEL);
  }
  
  return modelIds;
}

/**
 * Get all models (available + coming soon) that a user can see based on their tier
 * This includes models they have subscription access to, even if not yet available
 */
export function getAllModelsForTier(userTier: SubscriptionTier): AIModel[] {
  return AVAILABLE_MODELS.filter(
    (m) => !m.requiredTier || hasAccessToTier(userTier, m.requiredTier)
  );
}

/**
 * Check if a model is the default free tier model that cannot be disabled
 */
export function isDefaultFreeModel(modelId: string): boolean {
  return modelId === DEFAULT_MODEL;
}

