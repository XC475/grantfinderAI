"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, DollarSign, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Types for n8n response
interface RecommendedGrant {
  title: string;
  agency: string;
  fit_score: number;
  funding_range: string;
  close_date: string;
  description: string;
  eligibility: string;
  url: string;
  fit_reasoning: string;
}

interface RecommendationResponse {
  metadata: {
    district_name: string;
    query_date: string;
    filters_used: Record<string, any>;
  };
  grants: RecommendedGrant[];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [recommendedGrants, setRecommendedGrants] = useState<
    RecommendedGrant[]
  >([]);
  const [metadata, setMetadata] = useState<
    RecommendationResponse["metadata"] | null
  >(null);

  const handleRunRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message:
            "Please recommend the top 3 grants that best fit our school district's needs and eligibility.",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();

      console.log("Dashboard received:", data);

      // Parse the n8n response - it comes as { recommendations: "stringified JSON" }
      let parsedData: RecommendationResponse;

      if (typeof data.recommendations === "string") {
        // Check if it's a valid JSON string
        if (data.recommendations === "OK" || data.recommendations.length < 10) {
          throw new Error(
            "n8n workflow returned an invalid response. Please check your N8N_RECOMMENDATIONS_URL is configured correctly."
          );
        }
        // Parse the stringified JSON
        parsedData = JSON.parse(data.recommendations);
      } else if (
        typeof data.recommendations === "object" &&
        data.recommendations !== null
      ) {
        // Response is already an object
        parsedData = data.recommendations;
      } else {
        throw new Error("Invalid response format from recommendations API");
      }

      // Validate the parsed data has the expected structure
      if (!parsedData.grants || !Array.isArray(parsedData.grants)) {
        console.error("Invalid parsed data:", parsedData);
        throw new Error("Response does not contain grants array");
      }

      setRecommendedGrants(parsedData.grants);
      setMetadata(parsedData.metadata);
      toast.success(
        `Found ${parsedData.grants.length} personalized grant recommendations!`
      );
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate recommendations. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your grant management dashboard
        </p>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Recommended Grants
            </h2>
            <p className="text-sm text-muted-foreground">
              Personalized grant opportunities based on your profile
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunRecommendations}
            disabled={isLoadingRecommendations}
          >
            {isLoadingRecommendations ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Running...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Run Recommendations
              </>
            )}
          </Button>
        </div>

        {/* Show metadata when recommendations are loaded */}
        {metadata && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-blue-900">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">
                  Personalized for {metadata.district_name}
                </span>
                <span className="text-blue-700">•</span>
                <span className="text-blue-700">
                  {new Date(metadata.query_date).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendedGrants.length > 0 ? (
            recommendedGrants.map((grant, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {grant.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 shrink-0"
                    >
                      {grant.fit_score}% fit
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {grant.agency}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col h-full flex-1">
                  <div className="flex-1 space-y-4">
                    <p className="text-sm line-clamp-3">{grant.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {grant.funding_range}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Closes: {formatDate(grant.close_date)}</span>
                      </div>
                    </div>

                    {/* Show fit reasoning in a collapsible section */}
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer font-medium hover:text-foreground">
                        Why this fits your district
                      </summary>
                      <p className="mt-2 pl-2 border-l-2 border-blue-200">
                        {grant.fit_reasoning}
                      </p>
                    </details>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={grant.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Show placeholder when no recommendations yet
            <div className="col-span-full text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No recommendations yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Click "Run Recommendations" to get personalized grant
                suggestions for your district
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
