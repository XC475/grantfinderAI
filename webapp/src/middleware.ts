import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

/**
 * Next.js middleware entry point.
 *
 * Purpose:
 * - Delegates all request handling to the Supabase `updateSession` middleware.
 * - Ensures authentication cookies are refreshed and user sessions stay valid
 *   across requests.
 *
 * Config:
 * - `matcher` defines which routes should run through this middleware.
 * - By default, all paths are matched *except*:
 *   - `_next/static/*` → static assets
 *   - `_next/image/*` → image optimization files
 *   - `favicon.ico` → site favicon
 *   - common image file extensions (svg, png, jpg, jpeg, gif, webp)
 *
 * Tip:
 * - You can extend the `matcher` regex to exclude/include additional paths
 *   depending on your app’s requirements.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
