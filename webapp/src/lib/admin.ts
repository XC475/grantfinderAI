import prisma from "@/lib/prisma";

/**
 * Check if a user is a system admin
 */
export async function isSystemAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { system_admin: true },
    });

    return user?.system_admin === true;
  } catch (error) {
    console.error("Error checking system admin status:", error);
    return false;
  }
}

/**
 * Require system admin - throws error if not system admin
 */
export async function requireSystemAdmin(userId: string): Promise<void> {
  const admin = await isSystemAdmin(userId);
  if (!admin) {
    throw new Error("System admin access required");
  }
}
