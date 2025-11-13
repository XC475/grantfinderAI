"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BotMessageSquare, FileText, Sparkles, Building2 } from "lucide-react";

interface FeatureCardProps {
  slug: string;
}

export function AIAssistantCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/chat`} className="block">
      <Card className="transition-all hover:shadow-md border-border/40 hover:border-border h-full">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <BotMessageSquare className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold">AI Assistant</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get help with grants lifecycle from discovery to submission with AI-powered support
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function GrantsCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/grants?tab=search`} className="block">
      <Card className="transition-all hover:shadow-md border-border/40 hover:border-border h-full">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <FileText className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold">Grants</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Search and discover funding opportunities from federal, state, and private sources
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function RecommendationsCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/grants?tab=recommendations`} className="block">
      <Card className="transition-all hover:shadow-md border-border/40 hover:border-border h-full">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-xl font-bold">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered grant matches tailored to your district&apos;s profile and strategic goals
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function OrgProfileCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/settings`} className="block">
      <Card className="transition-all hover:shadow-md border-border/40 hover:border-border h-full">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-xl font-bold">Organization Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage your district&apos;s information, team members, and account settings
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
