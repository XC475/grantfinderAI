import { createClient } from "@/utils/supabase/server";

/**
 * Delete a file from Supabase Storage
 * @param fileUrl Full URL like "https://.../documents/orgId/file.pdf"
 * @returns true if deleted, false if failed
 */
export async function deleteFileFromStorage(fileUrl: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Extract path from URL
    // URL format: https://.../storage/v1/object/public/documents/{path}
    const parts = fileUrl.split("/documents/");
    if (parts.length < 2) {
      console.error("Invalid fileUrl format:", fileUrl);
      return false;
    }

    const filePath = parts[1]; // e.g., "orgId/abc123.pdf"

    console.log("🗑️ Attempting to delete from storage:", filePath);

    const { error } = await supabase.storage
      .from("documents")
      .remove([filePath]);

    if (error) {
      console.error("❌ Storage deletion failed:", {
        filePath,
        error,
        errorDetails: JSON.stringify(error, null, 2),
      });
      return false;
    }

    console.log("✓ Deleted from storage:", filePath);
    return true;
  } catch (error) {
    console.error("Storage cleanup error:", error);
    return false;
  }
}

/**
 * Get all documents (with fileUrl) in a folder tree
 * @param folderId Root folder ID
 * @param prisma Prisma client
 * @returns Array of documents that have fileUrl
 */
export async function getDocumentsInFolderTree(
  folderId: string,
  prisma: any
): Promise<Array<{ id: string; fileUrl: string | null }>> {
  const results: Array<{ id: string; fileUrl: string | null }> = [];

  // Get documents directly in this folder
  const docs = await prisma.document.findMany({
    where: { folderId },
    select: { id: true, fileUrl: true },
  });
  results.push(...docs);

  // Get child folders
  const children = await prisma.folder.findMany({
    where: { parentFolderId: folderId },
    select: { id: true },
  });

  // Recursively get docs from children
  for (const child of children) {
    const childDocs = await getDocumentsInFolderTree(child.id, prisma);
    results.push(...childDocs);
  }

  return results;
}
