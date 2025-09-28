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

  try {
    console.log("[signup] start", { email: data.email });

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      // NOTE: not setting user metadata here to avoid changing behavior; just logging
    });

    console.log("[signup] signUpData", {
      user: signUpData?.user
        ? {
            id: signUpData.user.id,
            email: signUpData.user.email,
            email_confirmed_at: signUpData.user.email_confirmed_at,
          }
        : null,
      session_present: Boolean(signUpData?.session),
    });

    if (error) {
      console.error("[signup] supabase.auth.signUp error", {
        message: error.message,
        name: (error as any)?.name,
        status: (error as any)?.status,
        stack: (error as any)?.stack,
      });
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
      console.log("[signup] user created; email confirmation required", {
        userId: signUpData.user.id,
      });
      redirect(
        redirectWithToast(
          "/login",
          "info",
          "Please check your email to confirm your account"
        )
      );
    }

    // If user exists and is confirmed, DB trigger will create app.users row
    console.log("[signup] success; redirecting to /private");
    revalidatePath("/", "layout");
    redirect(
      redirectWithToast(
        "/private",
        "success",
        "Account created successfully! Welcome!"
      )
    );
  } catch (err) {
    if (
      (err as any)?.digest &&
      String((err as any).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    throw err;
  }
}
