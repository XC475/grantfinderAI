import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

/**
 * Check if the current user is a system admin
 * This runs server-side and cannot be bypassed from the client
 */
export async function isSystemAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { system_admin: true },
    });

    return dbUser?.system_admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Require admin access or throw an error
 * Use this in API routes to protect admin endpoints
 */
export async function requireAdmin(): Promise<void> {
  const isAdmin = await isSystemAdmin();
  if (!isAdmin) {
    throw new Error("Forbidden: Admin access required");
  }
}
