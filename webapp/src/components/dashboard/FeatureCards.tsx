"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BotMessageSquare, FileText, Sparkles, Building2, ArrowRight } from "lucide-react";

interface FeatureCardProps {
  slug: string;
}

export function AIAssistantCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/chat`} className="block group">
      <Card className="relative overflow-hidden transition-all duration-300 ease-out border-t-4 border-t-blue-500 hover:border-t-blue-600 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:scale-[1.02] h-full bg-gradient-to-br from-blue-50/50 via-white to-white">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-200/50">
            <BotMessageSquare className="h-12 w-12 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <CardTitle className="text-xl font-bold transition-colors duration-300 group-hover:text-blue-600">
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get help with grants lifecycle from discovery to submission with AI-powered support
          </p>
        </CardContent>
        
        {/* Arrow indicator that slides in on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="h-5 w-5 text-blue-600" />
        </div>
        
        {/* Decorative gradient orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transition-opacity duration-300 group-hover:bg-blue-500/20" />
      </Card>
    </Link>
  );
}

export function GrantsCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/grants?tab=search`} className="block group">
      <Card className="relative overflow-hidden transition-all duration-300 ease-out border-t-4 border-t-green-500 hover:border-t-green-600 hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-1 hover:scale-[1.02] h-full bg-gradient-to-br from-green-50/50 via-white to-white">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-green-200/50">
            <FileText className="h-12 w-12 text-green-600 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <CardTitle className="text-xl font-bold transition-colors duration-300 group-hover:text-green-600">
            Grants
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Search and discover funding opportunities from federal, state, and private sources
          </p>
        </CardContent>
        
        {/* Arrow indicator that slides in on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="h-5 w-5 text-green-600" />
        </div>
        
        {/* Decorative gradient orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl transition-opacity duration-300 group-hover:bg-green-500/20" />
      </Card>
    </Link>
  );
}

export function RecommendationsCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/grants?tab=recommendations`} className="block group">
      <Card className="relative overflow-hidden transition-all duration-300 ease-out border-t-4 border-t-purple-500 hover:border-t-purple-600 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 hover:scale-[1.02] h-full bg-gradient-to-br from-purple-50/50 via-white to-white">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-purple-200/50">
            <Sparkles className="h-12 w-12 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <CardTitle className="text-xl font-bold transition-colors duration-300 group-hover:text-purple-600">
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered grant matches tailored to your district&apos;s profile and strategic goals
          </p>
        </CardContent>
        
        {/* Arrow indicator that slides in on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="h-5 w-5 text-purple-600" />
        </div>
        
        {/* Decorative gradient orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl transition-opacity duration-300 group-hover:bg-purple-500/20" />
      </Card>
    </Link>
  );
}

export function OrgProfileCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/settings`} className="block group">
      <Card className="relative overflow-hidden transition-all duration-300 ease-out border-t-4 border-t-orange-500 hover:border-t-orange-600 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1 hover:scale-[1.02] h-full bg-gradient-to-br from-orange-50/50 via-white to-white">
        <CardHeader className="flex flex-col items-center text-center space-y-4 pb-2">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-orange-200/50">
            <Building2 className="h-12 w-12 text-orange-600 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <CardTitle className="text-xl font-bold transition-colors duration-300 group-hover:text-orange-600">
            Organization Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage your district&apos;s information, team members, and account settings
          </p>
        </CardContent>
        
        {/* Arrow indicator that slides in on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="h-5 w-5 text-orange-600" />
        </div>
        
        {/* Decorative gradient orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl transition-opacity duration-300 group-hover:bg-orange-500/20" />
      </Card>
    </Link>
  );
}
