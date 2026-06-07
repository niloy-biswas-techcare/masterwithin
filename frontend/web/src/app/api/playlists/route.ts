import { NextResponse } from 'next/server';
import { listPlaylists } from '@mw/backend';

export async function GET() {
  try {
    const result = await listPlaylists();
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch playlists';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
