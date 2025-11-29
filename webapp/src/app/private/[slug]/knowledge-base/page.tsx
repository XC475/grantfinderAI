import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { KnowledgeBaseHeader } from "@/components/knowledge-base/KnowledgeBaseHeader";
import { KnowledgeBaseCategoryList } from "@/components/knowledge-base/KnowledgeBaseCategoryList";
import { getAllFileCategories } from "@/lib/fileCategories";

export default async function KnowledgeBasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get organization
  const organization = await prisma.organization.findFirst({
    where: {
      slug,
      users: { some: { id: user.id } },
    },
    select: { id: true, name: true, slug: true },
  });

  if (!organization) {
    redirect("/");
  }

  // Fetch ALL documents grouped by type with KB status
  const allFileCategories = getAllFileCategories();
  const documentsByType = await Promise.all(
    allFileCategories.map(async (type) => {
      const documents = await prisma.document.findMany({
        where: {
          organizationId: organization.id,
          fileCategory: type,
        },
        select: {
          id: true,
          title: true,
          isKnowledgeBase: true,
          fileCategory: true,
          fileSize: true,
          fileType: true,
          createdAt: true,
          updatedAt: true,
          vectorizationStatus: true,
          metadata: true, // Contains custom fields (tags, notes, successNotes, etc.)
          applicationId: true,
          application: {
            // Use existing relation
            select: {
              id: true,
              title: true,
              opportunityAgency: true,
              opportunityAwardMax: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Determine toggle state: true if ANY document is in KB
      const hasKBDocs = documents.some((doc) => doc.isKnowledgeBase);
      const allInKB =
        documents.length > 0 && documents.every((doc) => doc.isKnowledgeBase);

      return {
        type,
        documents,
        hasKBDocs,
        allInKB,
        totalCount: documents.length,
        kbCount: documents.filter((d) => d.isKnowledgeBase).length,
      };
    })
  );

  return (
    <div className="container py-6 space-y-6">
      <KnowledgeBaseHeader
        organizationSlug={slug}
        organizationId={organization.id}
      />
      <KnowledgeBaseCategoryList
        documentsByType={documentsByType}
        organizationSlug={slug}
        organizationId={organization.id}
      />
    </div>
  );
}

