import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// PUT /api/document-tags/[tagId] - Update tag name
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tagId } = await params;
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

    // Verify tag belongs to user's organization
    const existingTag = await prisma.documentTag.findFirst({
      where: {
        id: tagId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if another tag with same name exists
    const duplicateTag = await prisma.documentTag.findFirst({
      where: {
        organizationId: dbUser.organizationId,
        name: name.trim(),
        id: { not: tagId },
      },
    });

    if (duplicateTag) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 }
      );
    }

    // Update tag
    const tag = await prisma.documentTag.update({
      where: { id: tagId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("Error updating document tag:", error);
    return NextResponse.json(
      { error: "Failed to update document tag" },
      { status: 500 }
    );
  }
}

// DELETE /api/document-tags/[tagId] - Delete tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tagId } = await params;

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

    // Verify tag belongs to user's organization
    const existingTag = await prisma.documentTag.findFirst({
      where: {
        id: tagId,
        organizationId: dbUser.organizationId,
      },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Check if tag is in use
    if (existingTag._count.documents > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete tag that is in use",
          documentCount: existingTag._count.documents,
        },
        { status: 400 }
      );
    }

    // Delete tag
    await prisma.documentTag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document tag:", error);
    return NextResponse.json(
      { error: "Failed to delete document tag" },
      { status: 500 }
    );
  }
}

