import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/applications/[applicationId]/documents - List all documents for an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        organization: {
          users: {
            some: { id: user.id },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Get all documents for this application - handle gracefully if no documents exist
    const documents = await prisma.document.findMany({
      where: {
        applicationId: applicationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ documents: documents || [] });
  } catch (error) {
    console.error("Error fetching documents:", error);

    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes("findMany")) {
      return NextResponse.json(
        { error: "Database connection error", documents: [] },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch documents", documents: [] },
      { status: 500 }
    );
  }
}

// POST /api/applications/[applicationId]/documents - Create a new document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this application
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        organization: {
          users: {
            some: { id: user.id },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, contentType = "json", folderId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the application's folder
    const applicationFolder = await prisma.folder.findUnique({
      where: { applicationId: applicationId },
    });

    // Use provided folderId or default to application's root folder
    const targetFolderId = folderId || applicationFolder?.id || null;

    // Create new document with getting started content if no content provided
    const gettingStartedContent =
      content ||
      JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Grantware AI" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is your document workspace. Start writing your grant application here.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Getting Started" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Use the toolbar above to format your text",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Add headings, lists, and other formatting as needed",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Your work is automatically saved as you type",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Use the save button to manually save your progress",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Tips for Grant Writing" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Clearly state your project objectives",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Provide detailed budget information",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Include measurable outcomes and timelines",
                      },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Address all requirements from the grant guidelines",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Happy writing!" }],
          },
        ],
      });

    const document = await prisma.document.create({
      data: {
        applicationId: applicationId,
        organizationId: application.organizationId,
        folderId: targetFolderId,
        title,
        content: gettingStartedContent,
        contentType,
        version: 1,
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error creating document:", error);

    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes("create")) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
