import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/document-tags - List all tags for organization
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    // Get all tags for organization
    const tags = await prisma.documentTag.findMany({
      where: { organizationId: dbUser.organizationId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching document tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch document tags" },
      { status: 500 }
    );
  }
}

// POST /api/document-tags - Create new tag
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: "User organization not found" },
        { status: 404 }
      );
    }

    // Check if tag with same name already exists
    const existingTag = await prisma.documentTag.findUnique({
      where: {
        organizationId_name: {
          organizationId: dbUser.organizationId,
          name: name.trim(),
        },
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 }
      );
    }

    // Create tag
    const tag = await prisma.documentTag.create({
      data: {
        name: name.trim(),
        organizationId: dbUser.organizationId,
      },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    console.error("Error creating document tag:", error);
    return NextResponse.json(
      { error: "Failed to create document tag" },
      { status: 500 }
    );
  }
}

