"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { DocumentsView } from "@/components/folders/DocumentsView";

interface DocumentsPageProps {
  params: Promise<{ slug: string }>;
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { slug } = use(params);

  return (
    <div className="container mx-auto py-6">
      <DocumentsView organizationSlug={slug} />
    </div>
  );
}
