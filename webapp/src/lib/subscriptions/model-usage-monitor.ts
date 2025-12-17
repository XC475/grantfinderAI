/**
 * Model Usage Monitoring Utilities
 * 
 * Provides functions to monitor and analyze model usage patterns
 * Useful for analytics, billing, and usage limit enforcement
 */

import prisma from "@/lib/prisma";
import { findModelById } from "@/lib/ai/models";

export interface ModelUsageStats {
  modelId: string;
  modelName: string;
  totalRequests: number;
  uniqueUsers: number;
  uniqueOrganizations: number;
  requestsThisMonth: number;
  requestsLastMonth: number;
  averageRequestsPerUser: number;
}

export interface OrganizationUsageStats {
  organizationId: string;
  organizationName: string;
  totalRequests: number;
  requestsByModel: Record<string, number>;
  requestsThisMonth: number;
  requestsLastMonth: number;
}

/**
 * Get usage statistics for a specific model
 */
export async function getModelUsageStats(
  modelId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ModelUsageStats | null> {
  const model = findModelById(modelId);
  if (!model) return null;

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const dateFilter = startDate && endDate
    ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    : {};

  // Get all usage records for this model
  const allUsage = await prisma.modelUsage.findMany({
    where: {
      modelId,
      ...dateFilter,
    },
  });

  // Get this month's usage
  const thisMonthUsage = await prisma.modelUsage.findMany({
    where: {
      modelId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  // Get last month's usage
  const lastMonthUsage = await prisma.modelUsage.findMany({
    where: {
      modelId,
      month: startOfLastMonth.getMonth() + 1,
      year: startOfLastMonth.getFullYear(),
    },
  });

  const totalRequests = allUsage.reduce((sum, u) => sum + u.requestCount, 0);
  const requestsThisMonth = thisMonthUsage.reduce((sum, u) => sum + u.requestCount, 0);
  const requestsLastMonth = lastMonthUsage.reduce((sum, u) => sum + u.requestCount, 0);

  const uniqueUsers = new Set(allUsage.map((u) => u.userId)).size;
  const uniqueOrganizations = new Set(allUsage.map((u) => u.organizationId)).size;

  return {
    modelId,
    modelName: model.name,
    totalRequests,
    uniqueUsers,
    uniqueOrganizations,
    requestsThisMonth,
    requestsLastMonth,
    averageRequestsPerUser: uniqueUsers > 0 ? totalRequests / uniqueUsers : 0,
  };
}

/**
 * Get usage statistics for a specific organization
 */
export async function getOrganizationUsageStats(
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<OrganizationUsageStats | null> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true },
  });

  if (!organization) return null;

  const now = new Date();
  const dateFilter = startDate && endDate
    ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    : {};

  // Get all usage for this organization
  const allUsage = await prisma.modelUsage.findMany({
    where: {
      organizationId,
      ...dateFilter,
    },
  });

  // Get this month's usage
  const thisMonthUsage = await prisma.modelUsage.findMany({
    where: {
      organizationId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  // Get last month's usage
  const lastMonthUsage = await prisma.modelUsage.findMany({
    where: {
      organizationId,
      month: now.getMonth(), // Last month
      year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    },
  });

  const totalRequests = allUsage.reduce((sum, u) => sum + u.requestCount, 0);
  const requestsThisMonth = thisMonthUsage.reduce((sum, u) => sum + u.requestCount, 0);
  const requestsLastMonth = lastMonthUsage.reduce((sum, u) => sum + u.requestCount, 0);

  // Group by model
  const requestsByModel: Record<string, number> = {};
  allUsage.forEach((usage) => {
    requestsByModel[usage.modelId] =
      (requestsByModel[usage.modelId] || 0) + usage.requestCount;
  });

  return {
    organizationId,
    organizationName: organization.name,
    totalRequests,
    requestsByModel,
    requestsThisMonth,
    requestsLastMonth,
  };
}

/**
 * Get top models by usage
 */
export async function getTopModelsByUsage(
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<Array<{ modelId: string; modelName: string; totalRequests: number }>> {
  const dateFilter = startDate && endDate
    ? {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }
    : {};

  const usage = await prisma.modelUsage.findMany({
    where: dateFilter,
  });

  // Aggregate by model
  const modelTotals: Record<string, number> = {};
  usage.forEach((u) => {
    modelTotals[u.modelId] = (modelTotals[u.modelId] || 0) + u.requestCount;
  });

  // Sort and get top models
  const topModels = Object.entries(modelTotals)
    .map(([modelId, totalRequests]) => {
      const model = findModelById(modelId);
      return {
        modelId,
        modelName: model?.name || modelId,
        totalRequests,
      };
    })
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, limit);

  return topModels;
}

/**
 * Check if organization is approaching usage limits
 */
export async function checkUsageLimitWarnings(
  organizationId: string
): Promise<Array<{ modelId: string; modelName: string; usage: number; limit: number; percentage: number }>> {
  const now = new Date();
  const usage = await prisma.modelUsage.findMany({
    where: {
      organizationId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  const warnings: Array<{
    modelId: string;
    modelName: string;
    usage: number;
    limit: number;
    percentage: number;
  }> = [];

  for (const u of usage) {
    const model = findModelById(u.modelId);
    if (!model || model.monthlyLimit === null || model.monthlyLimit === undefined) continue;

    const limit = model.monthlyLimit;
    const percentage = (u.requestCount / limit) * 100;

    // Warn if over 80% of limit
    if (percentage >= 80) {
      warnings.push({
        modelId: u.modelId,
        modelName: model.name,
        usage: u.requestCount,
        limit: limit,
        percentage: Math.round(percentage),
      });
    }
  }

  return warnings;
}

