import type { AuthGateway, Operator, OperatorRole, OperatorSession } from '../../domain';
import { supabaseAdmin } from './client';
import { env } from '../../env';

export class SupabaseAuthGateway implements AuthGateway {
  async signIn(email: string, password: string): Promise<OperatorSession | null> {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      return null;
    }

    const { user, session } = data;

    // Check allowlist
    const emailLower = (user.email || '').toLowerCase();
    const isAllowlisted = env.ADMIN_ALLOWLIST.some(
      (allowed) => allowed.toLowerCase() === emailLower
    );

    // Check role claim
    const role = user.app_metadata?.role as OperatorRole | undefined;
    const hasValidRole = role && ['admin', 'editor'].includes(role);

    if (!isAllowlisted || !hasValidRole) {
      // Sign out/revoke session immediately
      await supabaseAdmin.auth.admin.signOut(user.id);
      return null;
    }

    return {
      operator: {
        uid: user.id,
        email: user.email!,
        role,
        displayName: user.user_metadata?.display_name,
      },
      accessToken: session.access_token,
    };
  }

  async verifySession(accessToken: string): Promise<Operator | null> {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    // Check allowlist
    const emailLower = (user.email || '').toLowerCase();
    const isAllowlisted = env.ADMIN_ALLOWLIST.some(
      (allowed) => allowed.toLowerCase() === emailLower
    );

    // Check role claim
    const role = user.app_metadata?.role as OperatorRole | undefined;
    const hasValidRole = role && ['admin', 'editor'].includes(role);

    if (!isAllowlisted || !hasValidRole) {
      return null;
    }

    return {
      uid: user.id,
      email: user.email!,
      role,
      displayName: user.user_metadata?.display_name,
    };
  }

  async revoke(uid: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.admin.signOut(uid);
    if (error) throw error;
  }

  async getRole(uid: string): Promise<OperatorRole | null> {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(uid);
    if (error || !user) return null;

    const role = user.app_metadata?.role as OperatorRole | undefined;
    if (role && ['admin', 'editor'].includes(role)) {
      return role;
    }
    return null;
  }
}
