"use client";

import Link from "next/link";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { BotMessageSquare, FileText, Sparkles, Building2 } from "lucide-react";

interface FeatureCardProps {
  slug: string;
}

export function AIAssistantCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/chat`} className="block group">
      <Card className="relative overflow-visible transition-all duration-300 ease-out h-[200px] bg-[#e8f4ff] border border-[#c8d9ff] hover:border-[#5a8bf2] hover:shadow-xl hover:shadow-[#5a8bf2]/20 hover:-translate-y-1">
        <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#5a8bf2]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#5a8bf2] group-hover:scale-110 mb-4">
            <BotMessageSquare className="h-8 w-8 text-[#5a8bf2] stroke-[1.5]" strokeWidth={1.5} />
          </div>
          
          <CardTitle 
            className="text-2xl font-normal text-foreground/90 group-hover:text-[#5a8bf2] transition-colors duration-300"
            style={{ fontFamily: "'Tiempos Text', 'Source Serif Pro', 'Source Serif 4', Georgia, serif", fontWeight: 400 }}
          >
            AI Assistant
          </CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}

export function GrantsCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/grants?tab=search`} className="block group">
      <Card className="relative overflow-visible transition-all duration-300 ease-out h-[200px] bg-[#d4e8d8] border border-[#b8d4bc] hover:border-[#7db87f] hover:shadow-xl hover:shadow-[#7db87f]/20 hover:-translate-y-1">
        <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#6ab96c]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#6ab96c] group-hover:scale-110 mb-4">
            <FileText className="h-8 w-8 text-[#5b9e5d] stroke-[1.5]" strokeWidth={1.5} />
          </div>
          
          <CardTitle 
            className="text-2xl font-normal text-foreground/90 group-hover:text-[#5b9e5d] transition-colors duration-300"
            style={{ fontFamily: "'Tiempos Text', 'Source Serif Pro', 'Source Serif 4', Georgia, serif", fontWeight: 400 }}
          >
            Grants
          </CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}

export function RecommendationsCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/grants?tab=recommendations`} className="block group">
      <Card className="relative overflow-visible transition-all duration-300 ease-out h-[200px] bg-[#e8dff5] border border-[#d4c4e8] hover:border-[#b89dd6] hover:shadow-xl hover:shadow-[#b89dd6]/20 hover:-translate-y-1">
        <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#a78bca]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#a78bca] group-hover:scale-110 mb-4">
            <Sparkles className="h-8 w-8 text-[#9370bb] stroke-[1.5]" strokeWidth={1.5} />
          </div>
          
          <CardTitle 
            className="text-2xl font-normal text-foreground/90 group-hover:text-[#9370bb] transition-colors duration-300"
            style={{ fontFamily: "'Tiempos Text', 'Source Serif Pro', 'Source Serif 4', Georgia, serif", fontWeight: 400 }}
          >
            Recommendations
          </CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}

export function OrgProfileCard({ slug }: FeatureCardProps) {
  return (
    <Link href={`/private/${slug}/settings`} className="block group">
      <Card className="relative overflow-visible transition-all duration-300 ease-out h-[200px] bg-[#f5e8dc] border border-[#e8d4c4] hover:border-[#d9b89d] hover:shadow-xl hover:shadow-[#d9b89d]/20 hover:-translate-y-1">
        <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#c89b7e]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#c89b7e] group-hover:scale-110 mb-4">
            <Building2 className="h-8 w-8 text-[#b8865f] stroke-[1.5]" strokeWidth={1.5} />
          </div>
          
          <CardTitle 
            className="text-2xl font-normal text-foreground/90 group-hover:text-[#b8865f] transition-colors duration-300"
            style={{ fontFamily: "'Tiempos Text', 'Source Serif Pro', 'Source Serif 4', Georgia, serif", fontWeight: 400 }}
          >
            Organization Profile
          </CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}
