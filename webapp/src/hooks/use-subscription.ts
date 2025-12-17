"use client";

import { useState, useEffect, useCallback } from "react";
import type { SubscriptionTier, OrganizationSubscription } from "@/types/subscriptions";

interface UseSubscriptionReturn {
  subscription: OrganizationSubscription | null;
  tier: SubscriptionTier;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch organization subscription information
 * Defaults to FREE tier if no subscription exists
 */
export function useSubscription(organizationId?: string): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!organizationId) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/organizations/${organizationId}/subscription`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No subscription exists, default to FREE
          setSubscription(null);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Determine tier (defaults to FREE if no subscription)
  const tier: SubscriptionTier = subscription?.tier?.toLowerCase() as SubscriptionTier || "free";

  return {
    subscription,
    tier,
    loading,
    error,
    refetch: fetchSubscription,
  };
}

