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

    const { fileCategory, isKnowledgeBase } = await req.json();

    if (!fileCategory || typeof isKnowledgeBase !== "boolean") {
      return NextResponse.json(
        { error: "fileCategory and isKnowledgeBase are required" },
        { status: 400 }
      );
    }

    if (!Object.values(FileCategory).includes(fileCategory as FileCategory)) {
      return NextResponse.json(
        { error: "Invalid file category" },
        { status: 400 }
      );
    }

    // Update ALL documents of this type for this organization
    const result = await prisma.document.updateMany({
      where: {
        organizationId: dbUser.organizationId,
        fileCategory: fileCategory as FileCategory,
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
          fileCategory: fileCategory as FileCategory,
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
      fileCategory,
      isKnowledgeBase,
    });
  } catch (error) {
    console.error("Error toggling document category in KB:", error);
    return NextResponse.json(
      { error: "Failed to toggle document category" },
      { status: 500 }
    );
  }
}

