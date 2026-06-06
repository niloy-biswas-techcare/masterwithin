"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireOperator } from "@mw/backend";
import { env } from "@/lib/env";
import { checkRateLimit, clearRateLimit } from "@/lib/rateLimit";
import { createAdminSupabaseClient } from "@/lib/supabase";

const MAX_AGE_SECONDS = (env.ADMIN_SESSION_MAX_AGE_DAYS ?? 5) * 86400;

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export type LoginActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function loginAction(
  _: unknown,
  formData: FormData
): Promise<LoginActionResult> {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? "unknown";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  // Rate-limit by IP and by email (§17.8)
  const ipCheck = checkRateLimit(`ip:${ip}`);
  const emailCheck = checkRateLimit(`email:${email}`);
  if (!ipCheck.allowed || !emailCheck.allowed) {
    // Generic message: no enumeration (§17.8)
    return { ok: false, error: "Too many attempts. Please try again later." };
  }

  const supabase = await createAdminSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    // Don't reveal whether the email exists
    return { ok: false, error: "Invalid credentials." };
  }

  const accessToken = data.session.access_token;

  // Verify the token carries a valid operator role via the backend auth use-case
  try {
    await requireOperator(accessToken);
  } catch {
    // Not on the allowlist or no role — reject and sign out
    await supabase.auth.signOut();
    return { ok: false, error: "Invalid credentials." };
  }

  // Clear rate-limit on success
  clearRateLimit(`ip:${ip}`);
  clearRateLimit(`email:${email}`);

  // Exchange into httpOnly server-side cookie; discard client session (§17.2)
  const cookieStore = await cookies();
  cookieStore.set(env.ADMIN_SESSION_COOKIE_NAME ?? "mw_session", accessToken, cookieOpts(MAX_AGE_SECONDS));

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.ADMIN_SESSION_COOKIE_NAME ?? "mw_session")?.value;

  if (token) {
    const supabase = await createAdminSupabaseClient();
    await supabase.auth.signOut();
  }

  cookieStore.set(env.ADMIN_SESSION_COOKIE_NAME ?? "mw_session", "", cookieOpts(0));
  redirect("/login");
}
