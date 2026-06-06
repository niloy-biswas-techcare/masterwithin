import { createClient } from '@supabase/supabase-js';
import { env } from '../../env';

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase URL and Service Role Key are required in environment.');
}

/**
 * Privileged Supabase client using the service-role key.
 * Used for server-side operations that bypass Row-Level Security (§16, §3.3).
 * Never importable by frontends (§24).
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
