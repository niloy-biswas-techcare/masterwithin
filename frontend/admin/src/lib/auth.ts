"use server";
import { cookies } from "next/headers";
import { requireOperator } from "@mw/backend";
import { env } from "./env";
import type { Operator, OperatorRole } from "@mw/types";

/**
 * Server-side auth helper used in layouts and server actions (§17.3).
 * Returns the verified operator or null.
 */
export async function getOperator(): Promise<Operator | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(env.ADMIN_SESSION_COOKIE_NAME ?? "mw_session")?.value;
    if (!token) return null;
    return await requireOperator(token);
  } catch {
    return null;
  }
}

/**
 * The real authorization boundary (§17.3) 🔒.
 * Throws a Response redirect to /login if unauthenticated, or a 403 if role insufficient.
 */
export async function verifyOperator(requiredRole?: OperatorRole): Promise<Operator> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.ADMIN_SESSION_COOKIE_NAME ?? "mw_session")?.value;
  return await requireOperator(token, requiredRole);
}
