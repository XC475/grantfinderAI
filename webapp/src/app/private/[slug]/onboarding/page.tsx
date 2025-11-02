"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

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
}

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<Partial<Organization>>({});

  useEffect(() => {
    loadOrganization();
  }, []);

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
        });
      }
    } catch (error) {
      console.error("Error loading organization:", error);
      toast.error("Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof Organization,
    value: string | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/organizations/${organization?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save organization");

      toast.success("Profile saved successfully!");
      handleNext();
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error("Failed to save organization profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setSaving(true);
    try {
      // Save any remaining changes
      const response = await fetch(`/api/organizations/${organization?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, onboarding_completed: true }),
      });

      if (!response.ok) throw new Error("Failed to complete onboarding");

      toast.success("Welcome to Grantware AI! 🎉");
      router.push(`/private/${slug}/dashboard`);
      router.refresh();
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
      const response = await fetch(`/api/organizations/${organization?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_completed: true }),
      });

      if (!response.ok) throw new Error("Failed to skip onboarding");

      toast.success("You can complete your profile anytime in settings");
      router.push(`/private/${slug}/dashboard`);
      router.refresh();
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      toast.error("Failed to skip onboarding");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Organization not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-3xl">
        {/* Step 1: Introduction */}
        {currentStep === 1 && (
          <>
            <CardHeader className="text-center space-y-4 pb-2 mt-4">
              <div>
                <CardTitle className="text-3xl mb-2 ">
                  Welcome to Grantware AI
                </CardTitle>
                <CardDescription className="text-base">
                  Your intelligent assistant for finding and managing grant
                  opportunities
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Smart Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered search finds the most relevant grants for your
                    organization
                  </p>
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">
                    Personalized Recommendations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get grant suggestions tailored to your district&apos;s
                    profile and needs
                  </p>
                </div>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with AI to get help with applications, research, and
                    more
                  </p>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Let&apos;s set up your organization profile
                </h4>
                <p className="text-sm text-muted-foreground">
                  To provide the most relevant grant recommendations, we need to
                  know a bit more about your organization. This will only take a
                  few minutes.
                </p>
              </div>

              <div className="flex justify-between gap-4">
                <Button variant="ghost" onClick={handleSkip} disabled={saving}>
                  Skip for now
                </Button>
                <Button onClick={handleNext} disabled={saving}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            {/* Progress Bar */}
            <div className="w-full bg-muted h-2">
              <div
                className="bg-primary h-2 transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </>
        )}

        {/* Step 2: Profile Setup */}
        {currentStep === 2 && (
          <div className="max-h-[85vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Complete Your Organization Profile</CardTitle>
              <CardDescription>
                Tell us about your organization to get personalized
                recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Your organization name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website || ""}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://yourorganization.org"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="missionStatement">Mission Statement</Label>
                    <Textarea
                      id="missionStatement"
                      value={formData.missionStatement || ""}
                      onChange={(e) =>
                        handleInputChange("missionStatement", e.target.value)
                      }
                      rows={3}
                      placeholder="Describe your organization's mission..."
                    />
                    <p className="text-xs text-muted-foreground">
                      This helps us match you with aligned grant opportunities
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="strategicPlan">
                      Strategic Plan or Key Priorities
                    </Label>
                    <Textarea
                      id="strategicPlan"
                      value={formData.strategicPlan || ""}
                      onChange={(e) =>
                        handleInputChange("strategicPlan", e.target.value)
                      }
                      rows={4}
                      placeholder="Share your strategic priorities, goals, or current initiatives..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Help us understand your organization&apos;s focus areas
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">
                  Financial Information (Optional)
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="annualOperatingBudget">
                      Annual Operating Budget
                    </Label>
                    <Input
                      id="annualOperatingBudget"
                      type="number"
                      value={formData.annualOperatingBudget || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "annualOperatingBudget",
                          e.target.value
                        )
                      }
                      placeholder="1000000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                    <Input
                      id="fiscalYearEnd"
                      value={formData.fiscalYearEnd || ""}
                      onChange={(e) =>
                        handleInputChange("fiscalYearEnd", e.target.value)
                      }
                      placeholder="June 30 or 06/30"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="organizationLeaderName">Leader Name</Label>
                    <Input
                      id="organizationLeaderName"
                      value={formData.organizationLeaderName || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "organizationLeaderName",
                          e.target.value
                        )
                      }
                      placeholder="Executive Director or CEO name"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="contact@organization.org"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Address</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city || ""}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        placeholder="Boston"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state || ""}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        placeholder="MA"
                        maxLength={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode || ""}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        placeholder="02101"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={saving}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={saving}
                  >
                    Skip for now
                  </Button>
                  <Button
                    onClick={handleSaveAndContinue}
                    disabled={saving || !formData.name}
                  >
                    {saving ? "Saving..." : "Save & Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            {/* Progress Bar */}
            <div className="w-full bg-muted h-2">
              <div
                className="bg-primary h-2 transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Finalize */}
        {currentStep === 3 && (
          <>
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-3xl mb-2">
                  You&apos;re All Set!
                </CardTitle>
                <CardDescription className="text-base">
                  Your profile is ready and you can start exploring grants
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="bg-muted p-6 rounded-lg space-y-4">
                <h4 className="font-semibold text-lg">What&apos;s Next?</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Explore Available Grants</p>
                      <p className="text-sm text-muted-foreground">
                        Browse through thousands of grant opportunities filtered
                        for your state
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Get AI Recommendations</p>
                      <p className="text-sm text-muted-foreground">
                        Our AI will analyze your profile and suggest the best
                        grant matches
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Chat with AI Assistant</p>
                      <p className="text-sm text-muted-foreground">
                        Ask questions, get help with applications, or research
                        funding opportunities
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>💡 Pro Tip:</strong> You can update your organization
                  profile anytime from the Settings page to improve your grant
                  recommendations.
                </p>
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={saving}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={saving}
                  size="lg"
                  className="px-8"
                >
                  {saving ? "Loading..." : "Start Exploring"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            {/* Progress Bar */}
            <div className="w-full bg-muted h-2">
              <div
                className="bg-primary h-2 transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
