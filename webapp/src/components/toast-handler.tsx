"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { parseToastFromUrl, showToast } from "@/lib/toast";

/**
 * Client component that handles toast messages from URL search params
 * Should be included in pages that can receive toast messages from server actions
 */
export function ToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const toastMessage = parseToastFromUrl(searchParams);

    if (toastMessage && !hasShownToast.current) {
      hasShownToast.current = true;

      // Show the toast
      showToast(toastMessage.type, toastMessage.message);

      // Clean up URL by removing toast params
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("toast");
      newSearchParams.delete("message");

      const newUrl =
        window.location.pathname +
        (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "");

      // Replace URL without adding to history
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  // Reset the ref when search params change (new toast message)
  useEffect(() => {
    const toastMessage = parseToastFromUrl(searchParams);
    if (!toastMessage) {
      hasShownToast.current = false;
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
