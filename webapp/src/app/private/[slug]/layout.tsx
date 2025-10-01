import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { verifyWorkspaceAccess, getWorkspaceBySlug } from "@/lib/workspace";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/sidebar/dynamic-breadcrumb";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify workspace exists and user has access
  try {
    await getWorkspaceBySlug(slug);
    const hasAccess = await verifyWorkspaceAccess(user.id, slug);

    if (!hasAccess) {
      // User doesn't have access to this workspace
      redirect("/");
    }
  } catch (error) {
    console.error("Workspace access error:", error);
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb workspaceSlug={slug} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
