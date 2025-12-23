"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

interface Organization {
  id: string;
  name: string;
  missionStatement: string | null;
  strategicPlan: string | null;
  annualOperatingBudget: string | null;
  fiscalYearEnd: string | null;
  organizationLeaderName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  website: string | null;
  slug: string;
  services: string[] | null;
}

export default function OnboardingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<Partial<Organization>>({});

  useEffect(() => {
    loadOrganization();
  }, []);

  // Handle payment callbacks
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");

    if (paymentStatus === "success") {
      toast.success("Payment successful! Completing onboarding...");
    } else if (paymentStatus === "cancelled") {
      toast.info("Payment was cancelled. You can select a plan again.");
    }
  }, [searchParams]);

  const loadOrganization = async () => {
    try {
      const response = await fetch("/api/organizations");
      if (response.ok) {
        const org = await response.json();
        setOrganization(org);
        setFormData({
          name: org.name,
          missionStatement: org.missionStatement || "",
          strategicPlan: org.strategicPlan || "",
          annualOperatingBudget: org.annualOperatingBudget || "",
          fiscalYearEnd: org.fiscalYearEnd || "",
          organizationLeaderName: org.organizationLeaderName || "",
          phone: org.phone || "",
          email: org.email || "",
          address: org.address || "",
          city: org.city || "",
          state: org.state || "",
          zipCode: org.zipCode || "",
          website: org.website || "",
          services: org.services || [],
        });
      }
    } catch (error) {
      console.error("Error loading organization:", error);
      toast.error("Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async (data: Partial<Organization>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/organizations/${organization?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save organization");

      setFormData(data);
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error("Failed to save organization profile");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    try {
      // Save organization changes first (if any)
      if (Object.keys(formData).length > 0) {
        await fetch(`/api/organizations/${organization?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      // Update user's onboarding status
      const response = await fetch(`/api/user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });

      if (!response.ok) throw new Error("Failed to complete onboarding");

      toast.success("Welcome to Grantware AI! 🎉");

      // Wait a bit longer to ensure database update and cache invalidation complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use window.location for a hard redirect to ensure layout re-evaluates
      // This forces a full page reload with fresh data from the server
      window.location.href = `/private/${slug}/dashboard`;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });

      if (!response.ok) throw new Error("Failed to skip onboarding");

      toast.success("You can complete your profile anytime in settings");

      // Wait a bit longer to ensure database update and cache invalidation complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use window.location for a hard redirect to ensure layout re-evaluates
      // This forces a full page reload with fresh data from the server
      window.location.href = `/private/${slug}/dashboard`;
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      toast.error("Failed to skip onboarding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingFlow
      organizationSlug={slug}
      organization={organization}
      loading={loading}
      saving={saving}
      initialFormData={formData}
      onSaveAndContinue={handleSaveAndContinue}
      onComplete={handleCompleteOnboarding}
      onSkip={handleSkip}
    />
  );
}
