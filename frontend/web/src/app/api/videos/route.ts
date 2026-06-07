import { NextResponse } from 'next/server';
import { listVideos } from '@mw/backend';

export async function GET() {
  try {
    const result = await listVideos();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch videos';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
