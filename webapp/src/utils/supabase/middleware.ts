// src/utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware to keep Supabase sessions in sync between client and server.
 *
 * Why is this needed?
 * - Supabase uses cookies to persist sessions, but on the server we must
 *   explicitly handle them so the browser and server stay aligned.
 * - This middleware refreshes auth cookies on each request, preventing
 *   users from being logged out unexpectedly.
 *
 * How it works:
 * 1. Creates a Supabase server client bound to the request/response cycle.
 * 2. Defines custom cookie handlers (`getAll`, `setAll`) so Supabase can
 *    read and update cookies.
 * 3. Calls `supabase.auth.getUser()` immediately — this is required to
 *    trigger session refresh. Skipping it can cause random logouts.
 * 4. Redirects to `/login` if no user is found and the request path is not
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
          cookiesToSet.forEach(({ name, value, options }) =>
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
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/error")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
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

  return supabaseResponse;
}
