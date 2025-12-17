export type SubscriptionTier = "free" | "starter" | "professional" | "enterprise";

export type SubscriptionStatus = "active" | "trial" | "cancelled" | "expired";

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelUsage {
  id: string;
  organizationId: string;
  userId: string;
  modelId: string;
  month: number;
  year: number;
  requestCount: number;
  createdAt: Date;
  updatedAt: Date;
}

