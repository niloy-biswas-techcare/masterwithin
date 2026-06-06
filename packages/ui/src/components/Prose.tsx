import * as React from 'react';
import { cn } from '../lib/cn';

export interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Pre-sanitized HTML (Substack body), cleaned against an allowlist on ingest (§8).
   * Provide either `html` or `children`, not both.
   */
  html?: string;
  /** Apply editorial drop-cap on the first paragraph (§4a.2). */
  dropCap?: boolean;
  /** Style blockquotes as pull quotes with primary border (§4a.2). */
  pullQuotes?: boolean;
}

/**
 * Editorial reading container (§11). Renders article body HTML at the 720px reading
 * measure (§4.2) with token-driven typography. The HTML is sanitized on ingest, never
 * here — Prose only styles it.
 */
export function Prose({ html, className, children, dropCap, pullQuotes, ...props }: ProseProps) {
  const classes = cn(
    'mx-auto max-w-[720px] font-body text-[1.0625rem] leading-[1.75] text-text',
    '[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:leading-tight [&_h2]:text-text',
    '[&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-text',
    '[&_p]:my-[1.75em]',
    '[&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_a]:decoration-primary/40',
    '[&_blockquote]:my-8 [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:font-display [&_blockquote]:text-[1.25rem] [&_blockquote]:leading-[1.6] [&_blockquote]:text-text',
    '[&_img]:my-6 [&_img]:rounded-lg [&_img]:w-full',
    '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6',
    '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6',
    dropCap && 'prose-drop-cap',
    pullQuotes && 'prose-pull-quote',
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
