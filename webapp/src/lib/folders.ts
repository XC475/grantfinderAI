import { prisma } from "./prisma";

/**
 * Get all folder IDs in an application's folder tree (recursive)
 * @param applicationId The application ID
 * @returns Set of folder IDs that belong to the application's folder tree
 */
export async function getApplicationFolderTree(
  applicationId: string
): Promise<Set<string>> {
  const folderIds = new Set<string>();

  // Get the root folder for this application
  const rootFolder = await prisma.folder.findUnique({
    where: { applicationId },
  });

  if (!rootFolder) {
    return folderIds;
  }

  // Recursively get all descendant folders
  async function collectDescendants(folderId: string) {
    folderIds.add(folderId);

    const children = await prisma.folder.findMany({
      where: { parentFolderId: folderId },
      select: { id: true },
    });

    for (const child of children) {
      await collectDescendants(child.id);
    }
  }

  await collectDescendants(rootFolder.id);
  return folderIds;
}

/**
 * Check if moving a folder would create a circular reference
 * @param folderId The folder being moved
 * @param newParentId The new parent folder ID (null for root)
 * @returns true if the move would create a circular reference
 */
export async function wouldCreateCircularReference(
  folderId: string,
  newParentId: string | null
): Promise<boolean> {
  if (!newParentId) {
    return false; // Moving to root is always safe
  }

  if (folderId === newParentId) {
    return true; // Can't be its own parent
  }

  // Check if newParentId is a descendant of folderId
  const descendants = await getFolderDescendants(folderId);
  return descendants.has(newParentId);
}

/**
 * Get all descendant folder IDs (recursive)
 * @param folderId The folder ID
 * @returns Set of descendant folder IDs
 */
export async function getFolderDescendants(
  folderId: string
): Promise<Set<string>> {
  const descendants = new Set<string>();

  async function collectDescendants(id: string) {
    const children = await prisma.folder.findMany({
      where: { parentFolderId: id },
      select: { id: true },
    });

    for (const child of children) {
      descendants.add(child.id);
      await collectDescendants(child.id);
    }
  }

  await collectDescendants(folderId);
  return descendants;
}

/**
 * Get the full path of a folder (breadcrumb trail)
 * @param folderId The folder ID
 * @returns Array of folder objects from root to current folder
 */
export async function getFolderPath(
  folderId: string | null
): Promise<Array<{ id: string; name: string; applicationId: string | null }>> {
  if (!folderId) {
    return [];
  }

  const path: Array<{
    id: string;
    name: string;
    applicationId: string | null;
  }> = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const folder: {
      id: string;
      name: string;
      parentFolderId: string | null;
      applicationId: string | null;
    } | null = await prisma.folder.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        name: true,
        parentFolderId: true,
        applicationId: true,
      },
    });

    if (!folder) {
      break;
    }

    path.unshift({
      id: folder.id,
      name: folder.name,
      applicationId: folder.applicationId,
    });
    currentId = folder.parentFolderId;
  }

  return path;
}

/**
 * Get folder metadata (document count, subfolder count)
 * @param folderId The folder ID
 * @returns Metadata object
 */
export async function getFolderMetadata(folderId: string) {
  const [documentCount, subfolderCount] = await Promise.all([
    prisma.document.count({
      where: { folderId },
    }),
    prisma.folder.count({
      where: { parentFolderId: folderId },
    }),
  ]);

  return {
    documentCount,
    subfolderCount,
  };
}

/**
 * Backfill folders for existing applications
 * Creates a root folder for each application that doesn't have one
 */
export async function backfillApplicationFolders() {
  const applications = await prisma.application.findMany({
    select: {
      id: true,
      title: true,
      organizationId: true,
    },
  });

  const results = {
    created: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const app of applications) {
    try {
      // Check if folder already exists
      const existingFolder = await prisma.folder.findUnique({
        where: { applicationId: app.id },
      });

      if (existingFolder) {
        results.skipped++;
        continue;
      }

      // Create folder for application
      await prisma.folder.create({
        data: {
          name: app.title || "Untitled Application",
          organizationId: app.organizationId,
          applicationId: app.id,
          parentFolderId: null,
        },
      });

      results.created++;
    } catch (error) {
      results.errors.push(
        `Failed to create folder for application ${app.id}: ${error}`
      );
    }
  }

  return results;
}
