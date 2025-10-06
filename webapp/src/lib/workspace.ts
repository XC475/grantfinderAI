import prisma from "@/lib/prisma";

/**
 * Get user's workspace with slug (personal or organization)
 */
export async function getUserWorkspace(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      personalWorkspaceId: true,
      personalWorkspace: {
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
        },
      },
      organizationMembers: {
        include: {
          organization: {
            include: {
              workspace: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If user has a personal workspace, return it
  if (user.personalWorkspace) {
    return user.personalWorkspace;
  }

  // If user is a member of an organization, return the organization's workspace
  if (user.organizationMembers && user.organizationMembers.length > 0) {
    const membership = user.organizationMembers[0]; // Get first organization membership
    return membership.organization.workspace;
  }

  throw new Error(
    "User workspace not found - user has no personal workspace or organization membership"
  );
}

/**
 * Get user's workspace ID (personal or organization)
 */
export async function getUserWorkspaceId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      personalWorkspaceId: true,
      organizationMembers: {
        include: {
          organization: {
            select: { workspaceId: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If user has a personal workspace, return it
  if (user.personalWorkspaceId) {
    return user.personalWorkspaceId;
  }

  // If user is a member of an organization, return the organization's workspace ID
  if (user.organizationMembers && user.organizationMembers.length > 0) {
    return user.organizationMembers[0].organization.workspaceId;
  }

  throw new Error(
    "User workspace not found - user has no personal workspace or organization membership"
  );
}

/**
 * Get workspace by slug
 */
export async function getWorkspaceBySlug(slug: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
    },
  });

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  return workspace;
}

/**
 * Verify user has access to workspace
 */
export async function verifyWorkspaceAccess(
  userId: string,
  workspaceSlug: string
): Promise<boolean> {
  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: {
      id: true,
      type: true,
      personalUser: {
        select: { id: true },
      },
      organization: {
        select: {
          members: {
            where: { userId },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!workspace) {
    return false;
  }

  // Check if it's their personal workspace
  if (workspace.personalUser?.id === userId) {
    return true;
  }

  // Check if they're a member of the organization
  if (
    workspace.organization?.members &&
    workspace.organization.members.length > 0
  ) {
    return true;
  }

  return false;
}
