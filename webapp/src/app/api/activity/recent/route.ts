import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { supabaseServer } from "@/lib/supabaseServer";

interface Activity {
  id: string;
  title: string;
  timestamp: string;
  type: "application" | "document" | "folder" | "chat" | "bookmark";
  link: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationSlug = searchParams.get("organizationSlug");

    if (!organizationSlug) {
      return NextResponse.json(
        { error: "organizationSlug is required" },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get organization
    const organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Fetch recent activities from different sources in parallel
    const [applications, documents, folders, chats, bookmarks] =
      await Promise.all([
        // Recent applications
        prisma.application.findMany({
          where: { organizationId: organization.id },
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),

        // Recent documents
        prisma.document.findMany({
          where: {
            organizationId: organization.id,
            applicationId: { not: null }, // Only documents linked to applications
          },
          select: {
            id: true,
            title: true,
            updatedAt: true,
            folderId: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),

        // Recent folders (excluding application-linked folders to avoid duplicates)
        prisma.folder.findMany({
          where: {
            organizationId: organization.id,
            applicationId: null, // Exclude application folders
          },
          select: {
            id: true,
            name: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),

        // Recent chats
        prisma.aiChat.findMany({
          where: { organizationId: organization.id },
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 10,
        }),

        // Recent bookmarks with opportunity details
        prisma.grantBookmark.findMany({
          where: { organizationId: organization.id },
          select: {
            id: true,
            createdAt: true,
            opportunityId: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    // Get opportunity titles for bookmarks
    const opportunityIds = bookmarks.map((b) => b.opportunityId);
    const opportunities = await prisma.$queryRaw<
      Array<{ id: number; title: string }>
    >`
      SELECT id, title 
      FROM public.opportunities 
      WHERE id = ANY(${opportunityIds}::int[])
    `;

    const opportunityMap = new Map(
      opportunities.map((opp) => [opp.id, opp.title])
    );

    // Transform all activities into unified format
    const activities: Activity[] = [];

    // Add applications
    applications.forEach((app) => {
      if (app.title) {
        activities.push({
          id: app.id,
          title: app.title,
          timestamp: app.updatedAt.toISOString(),
          type: "application",
          link: `/private/${organizationSlug}/applications/${app.id}`,
        });
      }
    });

    // Add documents
    documents.forEach((doc) => {
      activities.push({
        id: doc.id,
        title: doc.title,
        timestamp: doc.updatedAt.toISOString(),
        type: "document",
        link: doc.folderId
          ? `/private/${organizationSlug}/documents?folderId=${doc.folderId}`
          : `/private/${organizationSlug}/documents`,
      });
    });

    // Add folders
    folders.forEach((folder) => {
      activities.push({
        id: folder.id,
        title: `Folder: ${folder.name}`,
        timestamp: folder.updatedAt.toISOString(),
        type: "folder",
        link: `/private/${organizationSlug}/documents?folderId=${folder.id}`,
      });
    });

    // Add chats
    chats.forEach((chat) => {
      activities.push({
        id: chat.id,
        title: chat.title || "Untitled Chat",
        timestamp: chat.updatedAt.toISOString(),
        type: "chat",
        link: `/private/${organizationSlug}/chat?chatId=${chat.id}`,
      });
    });

    // Add bookmarks
    bookmarks.forEach((bookmark) => {
      const opportunityTitle = opportunityMap.get(bookmark.opportunityId);
      if (opportunityTitle) {
        activities.push({
          id: bookmark.id,
          title: `Bookmarked: ${opportunityTitle}`,
          timestamp: bookmark.createdAt.toISOString(),
          type: "bookmark",
          link: `/private/${organizationSlug}/grants?opportunityId=${bookmark.opportunityId}`,
        });
      }
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return top 10 most recent activities
    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activities" },
      { status: 500 }
    );
  }
}

