"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { redirectWithToast } from "@/lib/toast";
import { getUserOrganization } from "@/lib/organization";
import prisma from "@/lib/prisma";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: authData } =
    await supabase.auth.signInWithPassword(data);

  if (error) {
    // Redirect to root (/) since /login redirects there anyway
    // prevents double-redirect that can lose toast params
    redirect(
      redirectWithToast(
        "/",
        "error",
        (error instanceof Error ? error.message : String(error)) ||
          "Invalid email or password"
      )
    );
  }

  // Get user's organization and redirect to it
  if (authData.user) {
    try {
      // Check if user has temporary password
      const dbUser = await prisma.user.findUnique({
        where: { id: authData.user.id },
        select: { hasTemporaryPassword: true },
      });

      if (dbUser?.hasTemporaryPassword) {
        revalidatePath("/", "layout");
        redirect("/set-password");
      }

      const organization = await getUserOrganization(authData.user.id);
      revalidatePath("/", "layout");
      redirect(
        redirectWithToast(
          `/private/${organization.slug}/dashboard`,
          "success",
          "Welcome back!"
        )
      );
    } catch (error) {
      // Re-throw redirect errors (they're not actual errors)
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }
      console.error("Error fetching organization:", error);
      revalidatePath("/", "layout");
      redirect(redirectWithToast("/", "error", "Organization not found"));
    }
  }

  revalidatePath("/", "layout");
  redirect(redirectWithToast("/", "error", "Login failed"));
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    redirect(redirectWithToast("/", "error", "Failed to sign out"));
  }
  revalidatePath("/", "layout");
  redirect(redirectWithToast("/", "success", "You have been signed out"));
}
