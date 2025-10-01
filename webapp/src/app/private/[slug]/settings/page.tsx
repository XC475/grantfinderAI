"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Redirect to account settings by default
  useEffect(() => {
    router.replace(`/private/${slug}/settings/account`);
  }, [slug, router]);

  return null; // Redirecting...
}
