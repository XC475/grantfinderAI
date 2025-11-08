import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/sidebar/dynamic-breadcrumb";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { unstable_noStore } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { DocumentEditorLayout } from "@/components/layouts/DocumentEditorLayout";

// Note: Authentication and access checks are now handled by middleware.ts
// This makes the layout lighter and prevents full page reloads on navigation

// Disable caching for this layout to always get fresh onboarding status
export const dynamic = "force-dynamic";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Get the current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Check if we're on the onboarding page first (before any DB queries)
  // Use exact path matching - check if pathname ends with /onboarding or /onboarding/
  const isOnboardingPage = pathname.includes("/onboarding");

  // Early return for onboarding page to prevent any redirect loops
  // This MUST happen before any database queries or user checks
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  // Check if user needs to complete onboarding (only if not already on onboarding page)
  // Use unstable_noStore to prevent caching of onboarding status
  unstable_noStore();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Fetch fresh data without caching
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        onboardingCompleted: true,
        organization: {
          select: {
            slug: true,
          },
        },
      },
    });

    // Redirect to onboarding if not completed and we're not already there
    if (dbUser && !dbUser.onboardingCompleted && dbUser.organization?.slug) {
      const targetSlug = dbUser.organization.slug;
      const targetOnboardingPath = `/private/${targetSlug}/onboarding`;

      // Double-check we're not already on the onboarding page
      if (
        !pathname.includes("/onboarding") &&
        pathname !== targetOnboardingPath
      ) {
        redirect(targetOnboardingPath);
      }
    }
  }

  // Check if we're on a document editor page
  const isDocumentPage = pathname.includes("/documents/");

  // Extract documentId from pathname if on document page
  const documentId = isDocumentPage
    ? pathname.split("/documents/")[1]?.split("/")[0] || ""
    : "";

  // If on document editor page, use special layout with document sidebar
  if (isDocumentPage && documentId) {
    return (
      <DocumentEditorLayout organizationSlug={slug} documentId={documentId}>
        {children}
      </DocumentEditorLayout>
    );
  }

  // Normal layout for other pages
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb organizationSlug={slug} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
