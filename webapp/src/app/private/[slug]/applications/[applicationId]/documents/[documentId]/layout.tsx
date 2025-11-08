"use client";

import { use } from "react";
import { DocumentEditorLayout } from "@/components/layouts/DocumentEditorLayout";

interface DocumentLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string; applicationId: string; documentId: string }>;
}

export default function DocumentLayout({
  children,
  params,
}: DocumentLayoutProps) {
  const { slug, documentId } = use(params);

  return (
    <DocumentEditorLayout organizationSlug={slug} documentId={documentId}>
      {children}
    </DocumentEditorLayout>
  );
}
