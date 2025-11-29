import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { FileCategory } from "@/generated/prisma";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { documentIds, updates } = await req.json();
    // updates can contain: { isKnowledgeBase, fileCategory, metadata }

    if (
      !documentIds ||
      !Array.isArray(documentIds) ||
      documentIds.length === 0
    ) {
      return NextResponse.json(
        { error: "No documents provided" },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Updates object required" },
        { status: 400 }
      );
    }

    // Update all documents (note: metadata requires individual updates)
    if (updates.metadata) {
      // Individual updates for metadata merge
      await Promise.all(
        documentIds.map(async (id) => {
          const doc = await prisma.document.findFirst({
            where: { id, organizationId: dbUser.organizationId },
          });
          if (doc) {
            await prisma.document.update({
              where: { id },
              data: {
                ...(updates.isKnowledgeBase !== undefined && {
                  isKnowledgeBase: updates.isKnowledgeBase,
                }),
                ...(updates.fileCategory && {
                  fileCategory: updates.fileCategory,
                }),
                metadata: {
                  ...((doc.metadata as object) || {}),
                  ...updates.metadata,
                },
              },
            });
          }
        })
      );
    } else {
      // Bulk update without metadata
      await prisma.document.updateMany({
        where: {
          id: { in: documentIds },
          organizationId: dbUser.organizationId, // Security check
        },
        data: {
          ...(updates.isKnowledgeBase !== undefined && {
            isKnowledgeBase: updates.isKnowledgeBase,
          }),
          ...(updates.fileCategory && {
            fileCategory: updates.fileCategory as FileCategory,
          }),
        },
      });
    }

    // Trigger vectorization for all
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

    return NextResponse.json({ success: true, count: documentIds.length });
  } catch (error) {
    console.error("Error bulk updating documents:", error);
    return NextResponse.json(
      { error: "Failed to bulk update documents" },
      { status: 500 }
    );
  }
}

