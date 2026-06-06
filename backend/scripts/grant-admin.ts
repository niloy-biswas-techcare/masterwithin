import { randomBytes } from 'crypto';
import { supabaseAdmin } from '../src/adapters/supabase/client';
import { env } from '../src/env';

function generatePassword(): string {
  return randomBytes(16).toString('base64url') + '!Aa1';
}

async function main() {
  const email = env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) {
    console.error('ADMIN_BOOTSTRAP_EMAIL is not set in environment.');
    process.exit(1);
  }

  console.log(`[Bootstrap] Granting admin role to: ${email}`);

  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users from Supabase:', listError);
    process.exit(1);
  }

  const existingUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    console.log('[Bootstrap] User exists. Updating app_metadata with admin role...');
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      app_metadata: { role: 'admin' },
    });
    if (updateError) {
      console.error('Failed to update user role:', updateError);
      process.exit(1);
    }
    console.log('[Bootstrap] Success: admin role granted to existing user.');
    console.log('[Bootstrap] IMPORTANT: The user already has a password set in Supabase Auth.');
  } else {
    const tempPassword = generatePassword();
    console.log('[Bootstrap] User does not exist. Creating new user with admin role...');
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });
    if (createError) {
      console.error('Failed to create bootstrap admin user:', createError);
      process.exit(1);
    }
    console.log(`[Bootstrap] Success: created user ${data.user?.id} with admin role.`);
    console.log('');
    console.log('============================================================');
    console.log('  TEMPORARY PASSWORD (one-time use — change immediately):');
    console.log(`  ${tempPassword}`);
    console.log('============================================================');
    console.log('');
    console.log('[Bootstrap] ACTION REQUIRED: Log in to the Admin Console and');
    console.log('  change this password via Supabase Auth dashboard or the');
    console.log('  Supabase "Update user" API before anyone else gains access.');
  }
}

main().catch((err) => {
  console.error('[Bootstrap] Unexpected error:', err);
  process.exit(1);
});
