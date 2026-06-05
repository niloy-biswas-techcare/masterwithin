import Image, { type ImageLoaderProps, type ImageProps } from 'next/image';

/**
 * `next/image` loader for Cloudinary-hosted assets (§2a, §13). Given a full Cloudinary
 * secure URL (as stored on entities, §16), it injects automatic format/quality and the
 * requested width into the delivery transformation so the CDN returns an optimized
 * variant. Non-Cloudinary URLs are returned unchanged.
 */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  const marker = '/upload/';
  const idx = src.indexOf(marker);
  if (idx === -1) return src;
  const transforms = `f_auto,q_${quality ?? 'auto'},w_${width},c_limit`;
  return `${src.slice(0, idx + marker.length)}${transforms}/${src.slice(idx + marker.length)}`;
}

export type CldImageProps = Omit<ImageProps, 'loader'>;

/**
 * Cloudinary-backed `next/image` (§11). Requires explicit `width`/`height` (or `fill`)
 * so there is no layout shift (§13). Always provide a meaningful `alt` (§14).
 */
export function CldImage(props: CldImageProps) {
  return <Image loader={cloudinaryLoader} {...props} />;
}
