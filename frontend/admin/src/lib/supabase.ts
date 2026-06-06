"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "./env";

/**
 * SSR Supabase client used exclusively for the admin login handshake (§17.2).
 * The anon key is safe here — it only performs the initial sign-in; the resulting
 * access token is immediately transferred into an httpOnly cookie and discarded
 * from JS-reachable storage.
 */
export async function createAdminSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // read-only in middleware
          }
        },
      },
    }
  );
}
