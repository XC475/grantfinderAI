import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseServer } from "@/lib/supabaseServer";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

// POST /api/applications - Create a new application
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { opportunityId, organizationSlug, alsoBookmark, grantTitle } = body;

    if (!opportunityId || !organizationSlug) {
      return NextResponse.json(
        { error: "opportunityId and organizationSlug are required" },
        { status: 400 }
      );
    }

    // Find the organization
    const organization = await prisma.organization.findFirst({
      where: {
        slug: organizationSlug,
        user: { id: user.id },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if application already exists
    const existing = await prisma.application.findUnique({
      where: {
        opportunityId_organizationId: {
          opportunityId,
          organizationId: organization.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Application already exists for this grant",
          application: existing,
        },
        { status: 409 }
      );
    }

    // Create the application with the grant title
    const application = await prisma.application.create({
      data: {
        opportunityId,
        organizationId: organization.id,
        status: "DRAFT",
        title: grantTitle || `Application for Grant #${opportunityId}`,
      },
    });

    // Also bookmark if requested
    if (alsoBookmark) {
      await prisma.grantBookmark.upsert({
        where: {
          userId_opportunityId_organizationId: {
            userId: user.id,
            opportunityId,
            organizationId: organization.id,
          },
        },
        create: {
          userId: user.id,
          opportunityId,
          organizationId: organization.id,
        },
        update: {},
      });
    }

    // Trigger async background process for checklist generation
    // Don't wait for this to complete - let it run in background
    (async () => {
      try {
        console.log(
          `🚀 Starting async checklist generation for application ${application.id}`
        );

        // Fetch the grant/opportunity details
        const opportunity = await supabaseServer
          .from("opportunities")
          .select("*")
          .eq("id", opportunityId)
          .single();

        if (!opportunity.data) {
          console.error("❌ Opportunity not found for checklist generation");
          return;
        }

        const grantInfo = opportunity.data;
        let attachmentsMarkdown = "";

        // Extract attachment URLs if they exist
        if (grantInfo.attachments && Array.isArray(grantInfo.attachments)) {
          const attachmentUrls = grantInfo.attachments
            .filter((att: { url?: string }) => att.url)
            .map((att: { url: string }) => att.url);

          if (attachmentUrls.length > 0) {
            console.log(
              `📎 Found ${attachmentUrls.length} attachments to scrape`
            );

            // Call Firecrawl to scrape attachments
            const scrapeResponse = await fetch(
              `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/firecrawl/scrape`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Cookie: request.headers.get("cookie") || "",
                },
                body: JSON.stringify({ urls: attachmentUrls }),
              }
            );

            if (scrapeResponse.ok) {
              const scrapeData = await scrapeResponse.json();
              const successfulScrapes = scrapeData.results.filter(
                (r: { success?: boolean }) => r.success
              );

              if (successfulScrapes.length > 0) {
                attachmentsMarkdown = successfulScrapes
                  .map(
                    (r: { url: string; markdown: string }) =>
                      `\n\n--- ${r.url} ---\n${r.markdown}`
                  )
                  .join("\n");

                // Store attachments markdown in database
                await prisma.application.update({
                  where: { id: application.id },
                  data: { attachments_markdown: attachmentsMarkdown },
                });

                console.log(
                  `✅ Scraped and stored ${successfulScrapes.length} attachments`
                );
              }
            }
          }
        }

        // Generate AI checklist
        const checklistResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/ai/application-checklist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: request.headers.get("cookie") || "",
            },
            body: JSON.stringify({
              applicationId: application.id,
              grantInfo,
              attachmentsMarkdown,
            }),
          }
        );

        if (checklistResponse.ok) {
          console.log(
            `✅ Checklist generated successfully for application ${application.id}`
          );
        } else {
          console.error(
            `❌ Failed to generate checklist: ${checklistResponse.status}`
          );
        }
      } catch (error) {
        console.error("❌ Error in background checklist generation:", error);
      }
    })();

    return NextResponse.json({ application, alsoBookmarked: alsoBookmark });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

// GET /api/applications - List all applications for user's organization
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationSlug = searchParams.get("organizationSlug");

    // Build where clause
    const whereClause: Prisma.ApplicationWhereInput = {
      organization: {
        user: { id: user.id },
        ...(organizationSlug ? { slug: organizationSlug } : {}),
      },
    };

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
