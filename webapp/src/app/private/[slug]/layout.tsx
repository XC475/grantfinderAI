import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/sidebar/dynamic-breadcrumb";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// Note: Authentication and access checks are now handled by middleware.ts
// This makes the layout lighter and prevents full page reloads on navigation

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

  // Check if user needs to complete onboarding
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organization: {
          select: {
            onboardingCompleted: true,
            slug: true,
          },
        },
      },
    });

    // Redirect to onboarding if not completed, but not if already on onboarding page
    const isOnboardingPage = pathname.includes("/onboarding");

    if (
      userWithOrg?.organization &&
      !userWithOrg.organization.onboardingCompleted &&
      !isOnboardingPage
    ) {
      redirect(`/private/${userWithOrg.organization.slug}/onboarding`);
    }
  }

  // Don't show sidebar on onboarding page
  const isOnboardingPage = pathname.includes("/onboarding");

  // Check if we're on a document editor page
  const isDocumentPage = pathname.includes("/documents/");

  if (isOnboardingPage) {
    return <>{children}</>;
  }

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
        <div
          className={
            isDocumentPage
              ? "flex flex-1 flex-col"
              : "flex flex-1 flex-col gap-4 p-4 pt-0"
          }
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
