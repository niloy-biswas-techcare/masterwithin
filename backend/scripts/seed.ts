import { supabaseAdmin } from '../src/adapters/supabase/client';
import { env } from '../src/env';

async function main() {
  console.log('[Seed] Starting database seed...');

  // 1. Site Config Singleton
  console.log('[Seed] Seeding site_config singleton...');
  const { error: configError } = await supabaseAdmin
    .from('site_config')
    .upsert({
      id: 'main',
      whatsapp_number: env.WHATSAPP_NUMBER || '919876543210',
      socials: {
        youtube: 'https://youtube.com/@masterwithin',
        instagram: 'https://instagram.com/masterwithin',
        substack: 'https://masterwithin.substack.com',
      },
      youtube: {
        channel_id: 'UC_some_channel_id',
        featured_video_ids: ['video-id-1', 'video-id-2'],
      },
      featured: {
        article_ids: [],
        book_ids: ['sample-book'],
      },
      updated_at: new Date().toISOString(),
    });

  if (configError) {
    console.error('Failed to seed site_config:', configError);
    process.exit(1);
  }

  // 2. Sample Book
  console.log('[Seed] Seeding sample book...');
  const { error: bookError } = await supabaseAdmin
    .from('books')
    .upsert({
      id: 'sample-book',
      title: 'The Master Within',
      author: 'Souvik Ghosh',
      price: 399,
      cover_image: 'https://res.cloudinary.com/mock-cloud/image/upload/v1/covers/sample-book.jpg',
      description: 'A comprehensive guide to inner growth, mindfulness, and self-actualization.',
      pages: 250,
      available: true,
      order: 1,
    });

  if (bookError) {
    console.error('Failed to seed books:', bookError);
    process.exit(1);
  }

  // 3. Sample Ebook
  console.log('[Seed] Seeding sample eBook...');
  const { error: ebookError } = await supabaseAdmin
    .from('ebooks')
    .upsert({
      id: 'sample-ebook',
      title: 'The Master Within (eBook)',
      author: 'Souvik Ghosh',
      price: 199,
      cover_image: 'https://res.cloudinary.com/mock-cloud/image/upload/v1/covers/sample-ebook.jpg',
      description: 'Digital edition of the comprehensive guide to inner growth.',
      play_store_url: 'https://play.google.com/store/books',
      kindle_url: 'https://amazon.com/dp/sample',
      available: true,
      order: 2,
    });

  if (ebookError) {
    console.error('Failed to seed ebooks:', ebookError);
    process.exit(1);
  }

  // 4. Sample Freebie
  console.log('[Seed] Seeding sample freebie...');
  const { error: freebieError } = await supabaseAdmin
    .from('freebies')
    .upsert({
      id: 'sample-freebie',
      title: 'Daily Mindfulness Journal Template',
      description: 'A printable daily template with structured prompts for morning alignment and evening reflection.',
      file_url: 'https://supabase.storage/freebies/mindfulness-journal.pdf',
      cover_image: 'https://res.cloudinary.com/mock-cloud/image/upload/v1/covers/sample-freebie.jpg',
      order: 1,
      published: true,
    });

  if (freebieError) {
    console.error('Failed to seed freebies:', freebieError);
    process.exit(1);
  }

  // 5. Sample Course
  console.log('[Seed] Seeding sample course...');
  const { error: courseError } = await supabaseAdmin
    .from('courses')
    .upsert({
      id: 'sample-course',
      slug: 'meditation-fundamentals',
      title: 'Meditation Fundamentals',
      level: 'beginner',
      description: 'Learn the core principles and postures of traditional mindfulness meditation.',
      who_its_for: 'Beginners looking to establish a stable and calm daily practice.',
      what_youll_gain: 'A clear technique, structured posture checklist, and daily meditation routines.',
      module_outline: [
        { title: 'Module 1: The Core Technique', summary: 'breath awareness and anchor' },
        { title: 'Module 2: Bodily Posture', summary: 'spine alignment and hand placement' },
      ],
      enrollment_cta_label: 'Start Course',
      enrollment_cta_url: 'https://masterwithin.org/courses/meditation-fundamentals',
      cover_image: 'https://res.cloudinary.com/mock-cloud/image/upload/v1/covers/sample-course.jpg',
      order: 1,
      published: true,
    });

  if (courseError) {
    console.error('Failed to seed courses:', courseError);
    process.exit(1);
  }

  // 6. Bootstrap Admin Operator
  const adminEmail = env.ADMIN_BOOTSTRAP_EMAIL;
  if (adminEmail) {
    console.log(`[Seed] Provisioning bootstrap admin user: ${adminEmail}...`);
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('Failed to check users for bootstrapping:', listError);
    } else {
      const existingUser = users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());
      if (existingUser) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          app_metadata: { role: 'admin' },
        });
        if (updateError) {
          console.error('Failed to grant admin role during seed:', updateError);
        } else {
          console.log('[Seed] Admin role granted to existing user.');
        }
      } else {
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: 'BootstrapPassword123!',
          email_confirm: true,
          app_metadata: { role: 'admin' },
        });
        if (createError) {
          console.error('Failed to create bootstrap admin during seed:', createError);
        } else {
          console.log('[Seed] Created bootstrap admin user.');
        }
      }
    }
  }

  console.log('[Seed] Database seed completed successfully!');
}

main().catch((err) => {
  console.error('[Seed] Unexpected error during seed execution:', err);
  process.exit(1);
});
