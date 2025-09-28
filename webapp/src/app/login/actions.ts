"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { redirectWithToast } from "@/lib/toast";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(
      redirectWithToast(
        "/login",
        "error",
        error.message || "Invalid email or password"
      )
    );
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
