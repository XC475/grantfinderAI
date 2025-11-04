// src/utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware to keep Supabase sessions in sync between client and server.
 * Also supports API key authentication for server-to-server requests.
 *
 * Why is this needed?
 * - Supabase uses cookies to persist sessions, but on the server we must
 *   explicitly handle them so the browser and server stay aligned.
 * - This middleware refreshes auth cookies on each request, preventing
 *   users from being logged out unexpectedly.
 *
 * How it works:
 * 1. Checks for API key authentication first (bypasses Supabase auth if valid)
 * 2. Creates a Supabase server client bound to the request/response cycle.
 * 3. Defines custom cookie handlers (`getAll`, `setAll`) so Supabase can
 *    read and update cookies.
 * 4. Calls `supabase.auth.getUser()` immediately — this is required to
 *    trigger session refresh. Skipping it can cause random logouts.
 * 5. Redirects to `/login` if no user is found and the request path is not
 *    `/login`, `/auth`, or `/error`.
 *
 * ⚠️ Important:
 * - Always return the `supabaseResponse` object.
 * - If creating a new response with `NextResponse.next()`, you must:
 *   (1) pass the original request,
 *   (2) copy cookies from `supabaseResponse`,
 *   (3) only then apply modifications.
 *   Otherwise, cookies may desync and terminate the session.
 */

export async function updateSession(request: NextRequest) {
  // Check for API key authentication first (for server-to-server requests)
  const apiKey = request.headers.get("x-api-key");
  if (apiKey && apiKey === process.env.INTERNAL_API_KEY) {
    console.log("✅ API key authenticated request:", request.nextUrl.pathname);
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/error") &&
    !request.nextUrl.pathname.startsWith("/set-password") &&
    request.nextUrl.pathname !== "/"
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Note: Temporary password check is handled in login action (not middleware)
  // because Prisma cannot run on Edge runtime where middleware executes

  // Organization access verification (for /private/[slug] routes)
  if (user && request.nextUrl.pathname.startsWith("/private/")) {
    const pathParts = request.nextUrl.pathname.split("/");
    const orgSlug = pathParts[2]; // /private/[slug]/...

    if (orgSlug && orgSlug !== "undefined") {
      // Quick check: verify user's organization matches the slug
      // This is a lightweight check that doesn't require additional DB queries
      // Full verification happens on the server if needed
      const userOrgSlug = request.cookies.get("org-slug")?.value;

      // If we have a cached org slug and it doesn't match, redirect
      if (userOrgSlug && userOrgSlug !== orgSlug) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  // Add pathname to headers for use in layout
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);

  return supabaseResponse;
}
