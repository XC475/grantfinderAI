import { AVAILABLE_MODELS, findModelById, type AIModel } from "@/lib/ai/models";
import type { SubscriptionTier } from "@/types/subscriptions";
import prisma from "@/lib/prisma";

export interface ModelAccessResult {
  hasAccess: boolean;
  reason?: "subscription_required" | "usage_limit_exceeded" | "model_unavailable";
  requiredTier?: SubscriptionTier;
  currentTier?: SubscriptionTier;
  usageCount?: number;
  monthlyLimit?: number;
}

/**
 * Check if user/organization has access to a specific model
 * Validates subscription tier and usage limits
 */
export async function checkModelAccess(
  organizationId: string,
  userId: string,
  modelId: string
): Promise<ModelAccessResult> {
  // Get organization subscription (defaults to FREE if none exists)
  const subscription = await prisma.organizationSubscription.findUnique({
    where: { organizationId },
  });

  // Convert Prisma enum (uppercase) to our type (lowercase)
  const tierMap: Record<string, SubscriptionTier> = {
    FREE: "free",
    STARTER: "starter",
    PROFESSIONAL: "professional",
    ENTERPRISE: "enterprise",
  };

  const userTier: SubscriptionTier =
    (subscription?.tier ? tierMap[subscription.tier] : undefined) || "free";

  // Find the model configuration
  const model = findModelById(modelId);

  if (!model || !model.available) {
    return {
      hasAccess: false,
      reason: "model_unavailable",
    };
  }

  // Check subscription tier access
  if (model.requiredTier) {
    const tierOrder: Record<SubscriptionTier, number> = {
      free: 0,
      starter: 1,
      professional: 2,
      enterprise: 3,
    };

    if (tierOrder[userTier] < tierOrder[model.requiredTier]) {
      return {
        hasAccess: false,
        reason: "subscription_required",
        requiredTier: model.requiredTier,
        currentTier: userTier,
      };
    }
  }

  // Check monthly usage limit (if model has a limit)
  if (model.monthlyLimit !== null && model.monthlyLimit !== undefined) {
    const now = new Date();
    const usage = await prisma.modelUsage.findUnique({
      where: {
        organizationId_userId_modelId_month_year: {
          organizationId,
          userId,
          modelId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
    });

    const currentUsage = usage?.requestCount || 0;
    if (currentUsage >= model.monthlyLimit) {
      return {
        hasAccess: false,
        reason: "usage_limit_exceeded",
        usageCount: currentUsage,
        monthlyLimit: model.monthlyLimit,
      };
    }
  }

  return { hasAccess: true };
}

/**
 * Increment usage counter after successful model request
 */
export async function incrementModelUsage(
  organizationId: string,
  userId: string,
  modelId: string
): Promise<void> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  await prisma.modelUsage.upsert({
    where: {
      organizationId_userId_modelId_month_year: {
        organizationId,
        userId,
        modelId,
        month,
        year,
      },
    },
    update: {
      requestCount: { increment: 1 },
      updatedAt: new Date(),
    },
    create: {
      organizationId,
      userId,
      modelId,
      month,
      year,
      requestCount: 1,
    },
  });
}

/**
 * Get current month usage for a specific model
 */
export async function getModelUsage(
  organizationId: string,
  userId: string,
  modelId: string
): Promise<{ usageCount: number; monthlyLimit: number | null }> {
  const model = findModelById(modelId);
  const monthlyLimit = model?.monthlyLimit ?? null;

  const now = new Date();
  const usage = await prisma.modelUsage.findUnique({
    where: {
      organizationId_userId_modelId_month_year: {
        organizationId,
        userId,
        modelId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    },
  });

  return {
    usageCount: usage?.requestCount || 0,
    monthlyLimit,
  };
}

