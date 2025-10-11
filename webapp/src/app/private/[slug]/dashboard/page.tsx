"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, DollarSign } from "lucide-react";

// Mock grant data
const mockGrants = [
  {
    id: 1,
    title: "STEM Education Innovation Grant",
    agency: "National Science Foundation",
    award_max: 500000,
    award_min: 100000,
    close_date: "2025-11-15",
    status: "posted",
    description:
      "Funding to support innovative STEM education programs in K-12 schools, focusing on hands-on learning and technology integration.",
    category: "Education",
  },
  {
    id: 2,
    title: "Community School Development Program",
    agency: "Department of Education",
    award_max: 300000,
    award_min: 50000,
    close_date: "2025-10-30",
    status: "posted",
    description:
      "Support for developing comprehensive community schools that provide integrated services to students and families.",
    category: "Community Development",
  },
  {
    id: 3,
    title: "Technology Modernization Fund",
    agency: "State Board of Education",
    award_max: 250000,
    award_min: 75000,
    close_date: "2025-12-01",
    status: "posted",
    description:
      "Grants for upgrading educational technology infrastructure, including hardware, software, and training.",
    category: "Technology",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
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
          <Button variant="outline" size="sm">
            View All Grants
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockGrants.map((grant) => (
            <Card key={grant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-tight line-clamp-2">
                    {grant.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 shrink-0"
                  >
                    {grant.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{grant.agency}</p>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <div className="flex-1 space-y-4">
                  <p className="text-sm line-clamp-3">{grant.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(grant.award_min)} -{" "}
                        {formatCurrency(grant.award_max)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Closes: {formatDate(grant.close_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-[-20px]">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
