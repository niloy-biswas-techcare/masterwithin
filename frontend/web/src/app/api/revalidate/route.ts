import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { env } from '@/lib/env';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  if (!env.REVALIDATE_SECRET || secret !== env.REVALIDATE_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!path) {
    return new NextResponse('Path parameter is required', { status: 400 });
  }

  try {
    revalidatePath(path);
    console.log(`[revalidate] Successfully revalidated path: ${path}`);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error(`[revalidate] Error revalidating path ${path}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  if (!env.REVALIDATE_SECRET || secret !== env.REVALIDATE_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!path) {
    return new NextResponse('Path parameter is required', { status: 400 });
  }

  try {
    revalidatePath(path);
    console.log(`[revalidate] Successfully revalidated path: ${path}`);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    console.error(`[revalidate] Error revalidating path ${path}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
