import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { convertTiptapToDocx, tiptapToStyledHTML } from "@/lib/document-converters";

// POST /api/documents/[documentId]/export - Export document as PDF or DOCX
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const { format } = await request.json();

    if (!format || !['pdf', 'docx'].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'pdf' or 'docx'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    // Fetch document ensuring it belongs to user's organization
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: dbUser.organizationId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Convert document based on format
    if (format === 'pdf') {
      // Return styled HTML that the browser can print to PDF
      const html = tiptapToStyledHTML(document.content || '');
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    } else {
      // DOCX export
      const buffer = await convertTiptapToDocx(document.content || '');
      const filename = `${document.title}.docx`;
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }
  } catch (error) {
    console.error("Error exporting document:", error);
    return NextResponse.json(
      { error: "Failed to export document" },
      { status: 500 }
    );
  }
}

