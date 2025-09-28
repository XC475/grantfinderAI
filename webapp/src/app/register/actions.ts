"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { redirectWithToast } from "@/lib/toast";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string,
  };

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    redirect(
      redirectWithToast(
        "/register",
        "error",
        error.message || "Failed to create account"
      )
    );
  }

  // If user exists immediately (no email confirmation required)
  if (signUpData.user && !signUpData.user.email_confirmed_at) {
    // User created but needs email confirmation
    redirect(
      redirectWithToast(
        "/login",
        "info",
        "Please check your email to confirm your account"
      )
    );
  }

  // If user exists and is confirmed, DB trigger will create app.users row
  revalidatePath("/", "layout");
  redirect(
    redirectWithToast(
      "/private",
      "success",
      "Account created successfully! Welcome!"
    )
  );
}
