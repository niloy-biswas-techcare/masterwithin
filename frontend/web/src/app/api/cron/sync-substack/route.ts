import { NextResponse } from 'next/server';
import { syncSubstack } from '@mw/backend';
import { env } from '@/lib/env';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[cron] Running Substack sync...');
    const result = await syncSubstack({ uid: 'system', email: 'system@masterwithin.org' });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[cron] Substack sync failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[cron] Running Substack sync...');
    const result = await syncSubstack({ uid: 'system', email: 'system@masterwithin.org' });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[cron] Substack sync failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
