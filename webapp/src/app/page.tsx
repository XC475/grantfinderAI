import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserOrganization } from "@/lib/organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is already logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect to their organization dashboard
  if (user) {
    try {
      const organization = await getUserOrganization(user.id);
      redirect(`/private/${organization.slug}/dashboard`);
    } catch (error) {
      // Re-throw redirect errors (they're not actual errors)
      if (
        typeof error === "object" &&
        error !== null &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }
      console.error("Error fetching organization:", error);
    }
  }

  // Login page as root
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Contact your administrator for account access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
