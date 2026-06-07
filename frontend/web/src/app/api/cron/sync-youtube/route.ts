import { NextResponse } from 'next/server';
import { syncYoutube } from '@mw/backend';
import { env } from '@/lib/env';

// Vercel-cron fallback route for YouTube sync (§8c, §21.4). 🔒
// Primary trigger is the Supabase Edge Function cron (daily).

async function handleSync(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[cron] Running YouTube sync...');
    const result = await syncYoutube({ uid: 'system', email: 'system@masterwithin.org' });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[cron] YouTube sync failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}

export const POST = handleSync;
export const GET = handleSync;
