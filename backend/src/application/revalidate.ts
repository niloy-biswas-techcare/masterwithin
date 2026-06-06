import { env } from '../env';

/**
 * Triggers Next.js Incremental Static Regeneration (ISR) for a path (§8, §18).
 * Sends a secret-authenticated POST request to the Next.js frontend `/api/revalidate` endpoint.
 * Gracefully ignores during unit testing or when configuration is not set.
 */
export async function revalidatePath(path: string): Promise<void> {
  if (
    process.env.NODE_ENV === 'test' ||
    !env.NEXT_PUBLIC_SITE_URL ||
    !env.REVALIDATE_SECRET
  ) {
    return;
  }

  try {
    const url = new URL('/api/revalidate', env.NEXT_PUBLIC_SITE_URL);
    url.searchParams.set('secret', env.REVALIDATE_SECRET);
    url.searchParams.set('path', path);

    const res = await fetch(url.toString(), { method: 'POST' });
    if (!res.ok) {
      console.error(
        `[backend] Revalidation failed for path ${path}: ${res.status} ${res.statusText}`
      );
    } else {
      console.log(`[backend] Revalidation triggered for path: ${path}`);
    }
  } catch (err) {
    console.error(`[backend] Revalidation error for path ${path}:`, err);
  }
}
