import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is already logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect to private area
  if (user) {
    redirect("/private/chat");
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to GrantFinder
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover and manage grant opportunities with AI-powered assistance
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
