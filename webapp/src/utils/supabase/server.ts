// src/utils/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Utility to create a Supabase client in server-only contexts
// (Server Components, Server Actions, Route Handlers).
//
// Why use `createServerClient` instead of the normal client?
// - On the server, we don’t have access to the browser’s automatic cookie handling.
// - Supabase relies on cookies to persist and refresh user sessions across requests.
// - Therefore, we must explicitly read and write cookies using Next.js's `cookies()` API.
//   - `getAll()` reads cookies from the request (to restore the session).
//   - `setAll()` writes cookies back to the response (to update/refresh the session).
//
// Note: In some contexts (like Server Components), `setAll` may not run;
// Supabase sessions can still be refreshed in middleware if needed, thats why we use `createServerClient` there too
export async function createClient() {
  const cookieStore = await cookies(); // get access to request cookies

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // write cookies back to the response
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
