import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/custom-fields - List all custom fields for organization
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

    // Get all custom fields for organization
    const customFields = await prisma.customField.findMany({
      where: { organizationId: dbUser.organizationId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ customFields });
  } catch (error) {
    console.error("Error fetching custom fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom fields" },
      { status: 500 }
    );
  }
}

// POST /api/custom-fields - Create new custom field
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
    const { name, description, value } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Field name is required" },
        { status: 400 }
      );
    }

    if (!value || typeof value !== "string" || value.trim().length === 0) {
      return NextResponse.json(
        { error: "Field value is required" },
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

    // Check if custom field with same name already exists
    const existingField = await prisma.customField.findUnique({
      where: {
        organizationId_name: {
          organizationId: dbUser.organizationId,
          name: name.trim(),
        },
      },
    });

    if (existingField) {
      return NextResponse.json(
        { error: "Custom field with this name already exists" },
        { status: 409 }
      );
    }

    // Create custom field
    const customField = await prisma.customField.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        value: value.trim(),
        organizationId: dbUser.organizationId,
      },
    });

    return NextResponse.json({ customField }, { status: 201 });
  } catch (error) {
    console.error("Error creating custom field:", error);
    return NextResponse.json(
      { error: "Failed to create custom field" },
      { status: 500 }
    );
  }
}

