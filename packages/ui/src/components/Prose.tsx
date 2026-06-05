import * as React from 'react';
import { cn } from '../lib/cn';

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Pre-sanitized HTML (Substack body), cleaned against an allowlist on ingest (§8).
   * Provide either `html` or `children`, not both.
   */
  html?: string;
}

/**
 * Editorial reading container (§11). Renders article body HTML at the 720px reading
 * measure (§4.2) with token-driven typography. The HTML is sanitized on ingest, never
 * here — Prose only styles it.
 */
export function Prose({ html, className, children, ...props }: ProseProps) {
  const classes = cn(
    'mx-auto max-w-prose font-body text-lg leading-relaxed text-text',
    '[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:text-text',
    '[&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-text',
    '[&_p]:my-5 [&_a]:text-deep [&_a]:underline hover:[&_a]:opacity-80',
    '[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text/80',
    '[&_img]:my-6 [&_img]:rounded-md [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6',
    className,
  );

  if (html !== undefined) {
    return (
      <div className={classes} dangerouslySetInnerHTML={{ __html: html }} {...props} />
    );
  }
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
