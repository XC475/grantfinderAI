import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// PATCH /api/custom-fields/[id] - Update custom field
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    const body = await request.json();
    const { name, description, value } = body;

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

    // Verify custom field belongs to user's organization
    const existingField = await prisma.customField.findFirst({
      where: {
        id: id,
        organizationId: dbUser.organizationId,
      },
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: {
      name?: string;
      description?: string | null;
      value?: string;
    } = {};

    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Field name cannot be empty" },
          { status: 400 }
        );
      }

      // Check if another field with same name exists (if name is changing)
      if (name.trim() !== existingField.name.trim()) {
        const duplicateField = await prisma.customField.findFirst({
          where: {
            organizationId: dbUser.organizationId,
            name: name.trim(),
            id: { not: id },
          },
        });

        if (duplicateField) {
          return NextResponse.json(
            { error: "Custom field with this name already exists" },
            { status: 409 }
          );
        }
      }

      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description =
        description && typeof description === "string"
          ? description.trim() || null
          : null;
    }

    if (value !== undefined) {
      if (!value || typeof value !== "string" || value.trim().length === 0) {
        return NextResponse.json(
          { error: "Field value cannot be empty" },
          { status: 400 }
        );
      }
      updateData.value = value.trim();
    }

    // Update custom field
    const customField = await prisma.customField.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({ customField });
  } catch (error) {
    console.error("Error updating custom field:", error);
    return NextResponse.json(
      { error: "Failed to update custom field" },
      { status: 500 }
    );
  }
}

// DELETE /api/custom-fields/[id] - Delete custom field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

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

    // Verify custom field belongs to user's organization
    const existingField = await prisma.customField.findFirst({
      where: {
        id: id,
        organizationId: dbUser.organizationId,
      },
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 }
      );
    }

    // Delete custom field
    await prisma.customField.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom field:", error);
    return NextResponse.json(
      { error: "Failed to delete custom field" },
      { status: 500 }
    );
  }
}
