import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

// PATCH /api/organizations/[id]/custom-fields/[fieldId] - Update a custom field
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id, fieldId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser || dbUser.organizationId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the custom field belongs to this organization
    const existingField = await prisma.customField.findUnique({
      where: { id: fieldId },
      select: { organizationId: true },
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 }
      );
    }

    if (existingField.organizationId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { fieldName, fieldValue } = body;

    // Validate field name if provided
    if (fieldName !== undefined && fieldName.trim() === "") {
      return NextResponse.json(
        { error: "Field name cannot be empty" },
        { status: 400 }
      );
    }

    // Update the custom field
    const updatedField = await prisma.customField.update({
      where: { id: fieldId },
      data: {
        ...(fieldName !== undefined && { fieldName: fieldName.trim() }),
        ...(fieldValue !== undefined && { fieldValue }),
      },
    });

    return NextResponse.json(updatedField);
  } catch (error) {
    console.error("Error updating custom field:", error);
    return NextResponse.json(
      { error: "Failed to update custom field" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/custom-fields/[fieldId] - Delete a custom field
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id, fieldId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has access to this organization
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { organizationId: true },
    });

    if (!dbUser || dbUser.organizationId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the custom field belongs to this organization
    const existingField = await prisma.customField.findUnique({
      where: { id: fieldId },
      select: { organizationId: true },
    });

    if (!existingField) {
      return NextResponse.json(
        { error: "Custom field not found" },
        { status: 404 }
      );
    }

    if (existingField.organizationId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the custom field
    await prisma.customField.delete({
      where: { id: fieldId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting custom field:", error);
    return NextResponse.json(
      { error: "Failed to delete custom field" },
      { status: 500 }
    );
  }
}
