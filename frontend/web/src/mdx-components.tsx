import type { MDXComponents } from 'mdx/types';
import React from 'react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 className="font-display text-4xl font-bold tracking-tight text-text mt-8 mb-4" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="font-display text-2xl font-semibold tracking-tight text-text mt-6 mb-3 border-b border-border pb-1" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="font-display text-xl font-semibold text-text mt-4 mb-2" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="font-body text-base leading-relaxed text-text/90 mb-4" {...props}>
        {children}
      </p>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted my-6 bg-surface/30 py-2 pr-4 rounded-r-md" {...props}>
        {children}
      </blockquote>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1 text-text/90" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1 text-text/90" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-base leading-relaxed" {...props}>
        {children}
      </li>
    ),
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-primary underline hover:text-primary/80 transition-colors font-medium"
        {...props}
      >
        {children}
      </a>
    ),
    pre: ({ children, ...props }) => (
      <pre className="bg-surface p-4 rounded-lg overflow-x-auto border border-border my-6 font-mono text-sm text-text" {...props}>
        {children}
      </pre>
    ),
    code: ({ children, ...props }) => (
      <code className="bg-surface/80 px-1.5 py-0.5 rounded font-mono text-sm text-primary border border-border/50" {...props}>
        {children}
      </code>
    ),
    hr: (props) => <hr className="my-8 border-border" {...props} />,
    ...components,
  };
}
