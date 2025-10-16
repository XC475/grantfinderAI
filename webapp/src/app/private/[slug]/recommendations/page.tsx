"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Sparkles,
  AlertCircle,
  ExternalLink,
  Calendar,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  state: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  missionStatement: string | null;
  strategicPlan: string | null;
  annualOperatingBudget: number | null;
  fiscalYearEnd: string | null;
}

interface Recommendation {
  id: string;
  opportunityId: string;
  fitScore: number;
  fitReasoning: string;
  fitDescription: string;
  districtName: string;
  queryDate: string;
  createdAt: string;
  grant?: {
    id: number;
    title: string;
    agency: string;
    close_date: string;
    total_funding_amount: number;
    award_min: number;
    award_max: number;
    status: string;
    url: string;
  };
}

export default function RecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [runningRecommendations, setRunningRecommendations] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch organization data
      const orgResponse = await fetch("/api/organizations");
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrganization(orgData);
      }

      // Fetch existing recommendations
      const recResponse = await fetch("/api/recommendations/list");
      if (recResponse.ok) {
        const recData = await recResponse.json();
        const recs = recData.recommendations || [];

        // Fetch grant details for each recommendation
        const recsWithGrants = await Promise.all(
          recs.map(async (rec: Recommendation) => {
            try {
              const grantResponse = await fetch(
                `/api/grants/${rec.opportunityId}`
              );
              if (grantResponse.ok) {
                const grantData = await grantResponse.json();
                return { ...rec, grant: grantData };
              }
            } catch (error) {
              console.error(
                `Failed to fetch grant ${rec.opportunityId}:`,
                error
              );
            }
            return rec;
          })
        );

        setRecommendations(recsWithGrants);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = () => {
    if (!organization) return false;

    // Check required fields
    return !!(
      organization.name &&
      organization.state &&
      organization.city &&
      organization.phone &&
      organization.email &&
      organization.missionStatement &&
      organization.strategicPlan &&
      organization.annualOperatingBudget &&
      organization.fiscalYearEnd
    );
  };

  const handleRunRecommendations = async () => {
    setRunningRecommendations(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Generate grant recommendations for our organization",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      toast.success("Recommendations generated successfully!");

      // Refresh the data to show new recommendations
      await fetchData();
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setRunningRecommendations(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const profileComplete = isProfileComplete();
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recommendations</h1>
        <p className="text-muted-foreground">
          AI-powered grant recommendations tailored to your organization
        </p>
      </div>

      {/* Profile Incomplete Alert */}
      {!profileComplete && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Please complete all required fields in your organization profile
              to get personalized grant recommendations.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/private/${slug}/profile`)}
            >
              Go to Profile
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Run Recommendations Button - Show if profile complete but no recommendations */}
      {profileComplete && !hasRecommendations && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Ready to Get Recommendations
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Your profile is complete! Click the button below to generate
              AI-powered grant recommendations tailored to your organization.
            </p>
            <Button
              onClick={handleRunRecommendations}
              disabled={runningRecommendations}
              size="lg"
            >
              {runningRecommendations ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Run Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Show Recommendations */}
      {profileComplete && hasRecommendations && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {recommendations.length} personalized recommendations
              </p>
            </div>
            <Button
              onClick={handleRunRecommendations}
              disabled={runningRecommendations}
              variant="outline"
              size="sm"
            >
              {runningRecommendations ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => (
              <Card
                key={rec.id}
                className="hover:shadow-md transition-shadow flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {rec.grant?.title || `Grant #${rec.opportunityId}`}
                    </CardTitle>
                    <Badge
                      variant={
                        rec.fitScore >= 80
                          ? "default"
                          : rec.fitScore >= 60
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {rec.fitScore}%
                    </Badge>
                  </div>
                  {rec.grant?.agency && (
                    <p className="text-sm text-muted-foreground">
                      {rec.grant.agency}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col h-full flex-1">
                  <div className="flex-1 space-y-4">
                    {/* Grant info */}
                    {rec.grant && (
                      <div className="space-y-2 text-sm pb-3 border-b">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {rec.grant.total_funding_amount
                              ? `$${rec.grant.total_funding_amount.toLocaleString()}`
                              : rec.grant.award_min && rec.grant.award_max
                                ? `$${rec.grant.award_min.toLocaleString()} - $${rec.grant.award_max.toLocaleString()}`
                                : "Amount not specified"}
                          </span>
                        </div>
                        {rec.grant.close_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Closes: {formatDate(rec.grant.close_date)}
                            </span>
                          </div>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {rec.grant.status}
                        </Badge>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-sm mb-1">
                        Why This Fits
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {rec.fitDescription}
                      </p>
                    </div>

                    {/* Detailed reasoning */}
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer font-medium hover:text-foreground">
                        View detailed analysis
                      </summary>
                      <p className="mt-2 pl-2 border-l-2 border-blue-200">
                        {rec.fitReasoning}
                      </p>
                    </details>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Analyzed: {formatDate(rec.queryDate)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground">
                      {rec.districtName}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={
                          rec.grant?.url ||
                          `/private/${slug}/grants?id=${rec.opportunityId}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Grant
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
