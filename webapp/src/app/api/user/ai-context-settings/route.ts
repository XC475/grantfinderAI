import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// Default settings when no record exists
const DEFAULT_SETTINGS = {
  enableOrgProfileChat: true,
  enableOrgProfileEditor: true,
  enableKnowledgeBaseChat: true,
  enableKnowledgeBaseEditor: true,
  enableGrantSearchChat: true,
  enableGrantSearchEditor: true,
};

// GET /api/user/ai-context-settings - Get user's AI context settings
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await prisma.userAIContextSettings.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        userId: true,
        enableOrgProfileChat: true,
        enableOrgProfileEditor: true,
        enableKnowledgeBaseChat: true,
        enableKnowledgeBaseEditor: true,
        enableGrantSearchChat: true,
        enableGrantSearchEditor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        ...DEFAULT_SETTINGS,
        id: null,
        userId: user.id,
        createdAt: null,
        updatedAt: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching AI context settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI context settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/ai-context-settings - Update user's AI context settings
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { field, enabled } = body;

    // Validate field name
    const validFields = [
      "enableOrgProfileChat",
      "enableOrgProfileEditor",
      "enableKnowledgeBaseChat",
      "enableKnowledgeBaseEditor",
      "enableGrantSearchChat",
      "enableGrantSearchEditor",
    ];

    if (!field || !validFields.includes(field)) {
      return NextResponse.json(
        { error: "Invalid field name" },
        { status: 400 }
      );
    }

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled must be a boolean" },
        { status: 400 }
      );
    }

    // Use upsert to create or update settings
    const updatedSettings = await prisma.userAIContextSettings.upsert({
      where: { userId: user.id },
      update: {
        [field]: enabled,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        ...DEFAULT_SETTINGS,
        [field]: enabled,
      },
      select: {
        id: true,
        userId: true,
        enableOrgProfileChat: true,
        enableOrgProfileEditor: true,
        enableKnowledgeBaseChat: true,
        enableKnowledgeBaseEditor: true,
        enableGrantSearchChat: true,
        enableGrantSearchEditor: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating AI context settings:", error);
    return NextResponse.json(
      { error: "Failed to update AI context settings" },
      { status: 500 }
    );
  }
}
