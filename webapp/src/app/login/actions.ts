"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { redirectWithToast } from "@/lib/toast";
import { getUserWorkspace } from "@/lib/workspace";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: authData } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    redirect(
      redirectWithToast(
        "/login",
        "error",
        (error instanceof Error ? error.message : String(error)) || "Invalid email or password"
      )
    );
  }

  // Get user's workspace and redirect to it
  if (authData.user) {
    try {
      const workspace = await getUserWorkspace(authData.user.id);
      revalidatePath("/", "layout");
      redirect(
        redirectWithToast(
          `/private/${workspace.slug}/chat`,
          "success",
          "Welcome back!"
        )
      );
    } catch (error) {
      // Re-throw redirect errors (they're not actual errors)
      if (error && typeof error === "object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
      console.error("Error fetching workspace:", error);
      revalidatePath("/", "layout");
      redirect(redirectWithToast("/private", "success", "Welcome back!"));
    }
  }

  revalidatePath("/", "layout");
  redirect(redirectWithToast("/private", "success", "Welcome back!"));
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    redirect(redirectWithToast("/login", "error", "Failed to sign out"));
  }
  revalidatePath("/", "layout");
  redirect(redirectWithToast("/login", "success", "You have been signed out"));
}
