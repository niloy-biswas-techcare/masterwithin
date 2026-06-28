import { NextResponse } from 'next/server';
import { listPlaylists } from '@mw/backend';

// Cache at the CDN for 1 hour; stale responses served for up to another hour
// while a fresh fetch runs in the background.
export const revalidate = 3600;

export async function GET() {
  try {
    const result = await listPlaylists();
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch playlists';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
