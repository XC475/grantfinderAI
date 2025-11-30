import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

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

    const { fileTag, fileTagId, isKnowledgeBase } = await req.json();

    if (typeof isKnowledgeBase !== "boolean") {
      return NextResponse.json(
        { error: "isKnowledgeBase is required" },
        { status: 400 }
      );
    }

    // Resolve fileTagId from fileTag name or use provided fileTagId
    let resolvedFileTagId: string | null = fileTagId || null;
    if (fileTag && !resolvedFileTagId) {
      const tag = await prisma.documentTag.findFirst({
        where: {
          organizationId: dbUser.organizationId,
          OR: [{ id: fileTag }, { name: fileTag }],
        },
      });
      if (tag) {
        resolvedFileTagId = tag.id;
      } else {
        return NextResponse.json(
          { error: "Tag not found" },
          { status: 404 }
        );
      }
    }

    if (!resolvedFileTagId) {
      return NextResponse.json(
        { error: "fileTag or fileTagId is required" },
        { status: 400 }
      );
    }

    // Update ALL documents with this tag for this organization
    const result = await prisma.document.updateMany({
      where: {
        organizationId: dbUser.organizationId,
        fileTagId: resolvedFileTagId,
      },
      data: {
        isKnowledgeBase,
      },
    });

    // If enabling KB, trigger vectorization for documents needing it
    if (isKnowledgeBase) {
      const docsNeedingVectorization = await prisma.document.findMany({
        where: {
          organizationId: dbUser.organizationId,
          fileTagId: resolvedFileTagId,
          extractedText: { not: null },
          vectorizationStatus: { not: "COMPLETED" },
        },
        select: { id: true },
      });

      if (docsNeedingVectorization.length > 0) {
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

    return NextResponse.json({
      success: true,
      updated: result.count,
      fileTagId: resolvedFileTagId,
      isKnowledgeBase,
    });
  } catch (error) {
    console.error("Error toggling document tag in KB:", error);
    return NextResponse.json(
      { error: "Failed to toggle document tag" },
      { status: 500 }
    );
  }
}
