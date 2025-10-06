import { toast } from "sonner";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  type: ToastType;
  message: string;
}

/**
 * Show a toast notification
 */
export function showToast(type: ToastType, message: string) {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
  }
}

/**
 * Create URL with toast message as search params
 */
export function createToastUrl(
  baseUrl: string,
  type: ToastType,
  message: string
): string {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set("toast", type);
  url.searchParams.set("message", message);
  return url.pathname + url.search;
}

/**
 * Parse toast message from URL search params
 */
export function parseToastFromUrl(
  searchParams: URLSearchParams
): ToastMessage | null {
  const type = searchParams.get("toast") as ToastType;
  const message = searchParams.get("message");

  if (type && message && ["success", "error", "info"].includes(type)) {
    return { type, message };
  }

  return null;
}

/**
 * Server action helper to redirect with toast message
 */
export function redirectWithToast(
  url: string,
  type: ToastType,
  message: string
): string {
  const redirectUrl = new URL(
    url,
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  );
  redirectUrl.searchParams.set("toast", type);
  redirectUrl.searchParams.set("message", message);
  return redirectUrl.pathname + redirectUrl.search;
}
