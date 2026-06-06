import { supabaseAdmin } from '../src/adapters/supabase/client';
import { env } from '../src/env';

async function main() {
  const email = env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) {
    console.error('ADMIN_BOOTSTRAP_EMAIL is not set in environment.');
    process.exit(1);
  }
  
  console.log(`[Bootstrap] Granting admin role to: ${email}`);

  // List users to check if they already exist
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users from Supabase:', listError);
    process.exit(1);
  }

  const existingUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    console.log(`[Bootstrap] User exists. Updating app_metadata with admin role...`);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      app_metadata: { role: 'admin' },
    });
    if (updateError) {
      console.error('Failed to update user role:', updateError);
      process.exit(1);
    }
    console.log(`[Bootstrap] Success: admin role granted to existing user.`);
  } else {
    console.log(`[Bootstrap] User does not exist. Creating new user with admin role...`);
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'BootstrapPassword123!',
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });
    if (createError) {
      console.error('Failed to create bootstrap admin user:', createError);
      process.exit(1);
    }
    console.log(`[Bootstrap] Success: created user ${data.user?.id} with admin role.`);
  }
}

main().catch((err) => {
  console.error('[Bootstrap] Unexpected error:', err);
  process.exit(1);
});
