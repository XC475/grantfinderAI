import prisma from "@/lib/prisma";

/**
 * Get user's organization with slug
 */
export async function getUserOrganization(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizationId: true,
      organization: {
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.organization) {
    throw new Error("User organization not found");
  }

  return user.organization;
}

/**
 * Get user's organization ID
 */
export async function getUserOrganizationId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizationId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.organizationId) {
    throw new Error("User organization ID not found");
  }

  return user.organizationId;
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string) {
  const organization = await prisma.organization.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return organization;
}

/**
 * Verify user has access to organization
 */
export async function verifyOrganizationAccess(
  userId: string,
  organizationSlug: string
): Promise<boolean> {
  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
    select: {
      id: true,
      type: true,
      user: {
        select: { id: true },
      },
    },
  });

  if (!organization) {
    return false;
  }

  // Check if it's their organization
  if (organization.user?.id === userId) {
    return true;
  }

  return false;
}
