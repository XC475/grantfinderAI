"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BotMessageSquare,
  FileText,
  Bookmark,
  ClipboardList,
  Building2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// Commented out - Old recommendations interface
// interface Recommendation {
//   id: string;
//   opportunityId: string;
//   fitScore: number;
//   fitReasoning: string;
//   fitDescription: string;
//   districtName: string;
//   queryDate: string;
//   grant?: {
//     title: string;
//     agency: string;
//     total_funding_amount?: number;
//     award_min?: number;
//     award_max?: number;
//     url?: string;
//   };
// }

export default function DashboardPage() {
  // Commented out - Old recommendations state
  // const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  // const [loading, setLoading] = useState(true);
  const params = useParams();
  const organizationSlug = params.slug as string;

  // Commented out - Old recommendations fetching logic
  // useEffect(() => {
  //   fetchRecommendations();
  // }, []);

  // const fetchRecommendations = async () => {
  //   try {
  //     const response = await fetch(`/api/recommendations/list`);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch recommendations");
  //     }

  //     const data = await response.json();
  //     if (data.success && data.recommendations) {
  //       // API already sorts by fit score, just take top 3
  //       const topRecommendations = data.recommendations.slice(0, 3);

  //       // Fetch grant details for each recommendation
  //       const recommendationsWithGrants = await Promise.all(
  //         topRecommendations.map(async (rec: Recommendation) => {
  //           try {
  //             const grantResponse = await fetch(
  //               `/api/grants/${rec.opportunityId}`
  //             );
  //             if (grantResponse.ok) {
  //               const grantData = await grantResponse.json();
  //               return { ...rec, grant: grantData };
  //             }
  //           } catch (error) {
  //             console.error(
  //               `Failed to fetch grant ${rec.opportunityId}:`,
  //               error
  //             );
  //           }
  //           return rec;
  //         })
  //       );

  //       setRecommendations(recommendationsWithGrants);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching recommendations:", error);
  //     toast.error("Failed to load recommendations");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const formatAwardAmount = (grant?: Recommendation["grant"]) => {
  //   if (!grant) return "Amount not available";

  //   if (grant.total_funding_amount) {
  //     return `$${grant.total_funding_amount.toLocaleString()}`;
  //   }

  //   if (grant.award_min && grant.award_max) {
  //     return `$${grant.award_min.toLocaleString()} - $${grant.award_max.toLocaleString()}`;
  //   }

  //   if (grant.award_min) {
  //     return `$${grant.award_min.toLocaleString()}+`;
  //   }

  //   if (grant.award_max) {
  //     return `Up to $${grant.award_max.toLocaleString()}`;
  //   }

  //   return "Amount not available";
  // };

  // Dashboard page cards
  const dashboardCards = [
    {
      title: "AI Assistant",
      description:
        "Get personalized grant recommendations and answers to your funding questions using our intelligent chatbot.",
      icon: BotMessageSquare,
      url: `/private/${organizationSlug}/chat`,
      color: "text-blue-500",
    },
    {
      title: "Grant Search",
      description:
        "Browse and search through thousands of available grants. Filter by category, deadline, and funding amount.",
      icon: FileText,
      url: `/private/${organizationSlug}/grants`,
      color: "text-green-500",
    },
    {
      title: "Recommendations",
      description:
        "View AI-powered grant recommendations tailored specifically to your organization's profile and needs.",
      icon: Sparkles,
      url: `/private/${organizationSlug}/recommendations`,
      color: "text-purple-500",
    },
    {
      title: "Bookmarks",
      description:
        "Access your saved grants and keep track of opportunities you're interested in applying for.",
      icon: Bookmark,
      url: `/private/${organizationSlug}/bookmarks`,
      color: "text-yellow-500",
    },
    {
      title: "Applications",
      description:
        "Manage your grant applications, track deadlines, and monitor the status of your submissions.",
      icon: ClipboardList,
      url: `/private/${organizationSlug}/applications`,
      color: "text-orange-500",
    },
    {
      title: "Organization Profile",
      description:
        "Update your organization's information, mission statement, and strategic priorities for better matches.",
      icon: Building2,
      url: `/private/${organizationSlug}/profile`,
      color: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your grant management hub. Explore the tools and features
          available to you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.url}>
              <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors`}
                    >
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {card.description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between transition-colors"
                    asChild
                  >
                    <span>
                      Go to {card.title}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Commented out - Old recommendations section */}
      {/* {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">
            Loading recommendations...
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Top Grant Recommendations
            </h2>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/private/${organizationSlug}/recommendations`)
              }
              className="flex items-center gap-2"
            >
              View All Recommendations
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((recommendation) => (
              <Card
                key={recommendation.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg leading-tight">
                      {recommendation.grant?.title
                        ?.split(" ")
                        .slice(0, 5)
                        .join(" ") + "..." || "Grant Title Not Available"}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      {recommendation.fitScore}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatAwardAmount(recommendation.grant)}</span>
                  </div>

                  {recommendation.grant?.agency && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Agency:</strong> {recommendation.grant.agency}
                    </div>
                  )}

                  {recommendation.grant?.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        window.open(recommendation.grant?.url, "_blank")
                      }
                    >
                      View Grant Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-semibold mb-1">
              No Recommendations Yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Get personalized grant recommendations by running an AI analysis
              of your organization.
            </p>
            <Button
              onClick={() =>
                router.push(`/private/${organizationSlug}/recommendations`)
              }
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Get Recommendations
            </Button>
          </CardContent>
        </Card>
      )} */}
    </div>
  );
}
