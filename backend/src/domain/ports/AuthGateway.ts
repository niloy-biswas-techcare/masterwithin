import type { Operator, OperatorRole } from '../entities';

/** A signed-in operator session: the typed operator plus its opaque token. */
export interface OperatorSession {
  operator: Operator;
  /** Opaque session/access token exchanged into an httpOnly cookie by the app (§17.2). */
  accessToken: string;
}

/**
 * AuthGateway port (§17.2) 🔒.
 *
 * The operator authentication boundary, implemented today by Supabase Auth. The
 * allowlist + role-claim gate (§17.6, §17.8) is enforced *inside* `signIn` /
 * `verifySession`: a valid credential without an allowlisted email and role claim
 * resolves to `null`, so callers can treat null uniformly as "not an operator".
 */
export interface AuthGateway {
  /**
   * Verify a credential and, only if the user is an allowlisted operator with a
   * role claim, return the session. Returns null otherwise (no enumeration, §17.8).
   */
  signIn(email: string, password: string): Promise<OperatorSession | null>;
  /** Re-verify a session token server-side; returns the typed operator or null (§17.3). */
  verifySession(accessToken: string): Promise<Operator | null>;
  /** Revoke all of an operator's sessions (ends active cookies on next check, §17.6). */
  revoke(uid: string): Promise<void>;
  /** Look up an operator's current role claim, or null if absent/not an operator. */
  getRole(uid: string): Promise<OperatorRole | null>;
}
