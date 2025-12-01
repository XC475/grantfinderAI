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

    // Check if tag name actually changed
    const tagNameChanged = existingTag.name.trim() !== name.trim();

    // Update tag
    const tag = await prisma.documentTag.update({
      where: { id: tagId },
      data: { name: name.trim() },
    });

    // If tag name changed, mark all documents with this tag for re-vectorization
    if (tagNameChanged) {
      // Find all documents with this tag
      const documentsToRevectorize = await prisma.document.findMany({
        where: {
          fileTagId: tagId,
          organizationId: dbUser.organizationId,
        },
        select: { id: true },
      });

      if (documentsToRevectorize.length > 0) {
        // Delete existing vectors for these documents (they contain old tag name)
        await prisma.documentVector.deleteMany({
          where: {
            documentId: { in: documentsToRevectorize.map((d) => d.id) },
            organizationId: dbUser.organizationId,
          },
        });

        // Mark documents for re-vectorization
        await prisma.document.updateMany({
          where: {
            id: { in: documentsToRevectorize.map((d) => d.id) },
            organizationId: dbUser.organizationId,
          },
          data: {
            vectorizationStatus: "PENDING",
            vectorizedAt: null,
            chunkCount: null,
          },
        });

        console.log(
          `🔄 [Tag Rename] Marked ${documentsToRevectorize.length} document(s) for re-vectorization after tag rename`
        );

        // Trigger vectorization endpoint
        const protocol = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
          ? "https"
          : "http";
        const host =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ||
          "localhost:3000";

        fetch(`${protocol}://${host}/api/documents/vectorize`, {
          method: "POST",
          headers: { "x-api-key": process.env.INTERNAL_API_KEY! },
        }).catch((err) => console.error("Vectorization trigger failed:", err));
      }
    }

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
