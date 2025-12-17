"use client";

import { useState, useEffect, useCallback } from "react";

interface ModelUsageData {
  modelId: string;
  usageCount: number;
  monthlyLimit: number | null;
  remaining: number | null;
}

interface UseModelUsageReturn {
  usage: ModelUsageData[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch current month model usage for an organization/user
 * Returns usage counts and limits for all models
 */
export function useModelUsage(
  organizationId?: string,
  userId?: string
): UseModelUsageReturn {
  const [usage, setUsage] = useState<ModelUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!organizationId || !userId) {
      setUsage([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/organizations/${organizationId}/subscription/usage?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch model usage");
      }

      const data = await response.json();
      setUsage(data.usage || []);
    } catch (err) {
      console.error("Error fetching model usage:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setUsage([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, userId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    usage,
    loading,
    error,
    refetch: fetchUsage,
  };
}

