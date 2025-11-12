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
    const { title, content, contentType = "html", folderId } = body;

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
      `
      <h1>Welcome to Grantware AI</h1>
      <p>This is your document workspace. Start writing your grant application here.</p>
      <h2>Getting Started</h2>
      <ul>
        <li>Use the toolbar above to format your text</li>
        <li>Add headings, lists, and other formatting as needed</li>
        <li>Your work is automatically saved as you type</li>
        <li>Use the save button to manually save your progress</li>
      </ul>
      <h2>Tips for Grant Writing</h2>
      <ul>
        <li>Clearly state your project objectives</li>
        <li>Provide detailed budget information</li>
        <li>Include measurable outcomes and timelines</li>
        <li>Address all requirements from the grant guidelines</li>
      </ul>
      <p>Happy writing!</p>
    `;

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
