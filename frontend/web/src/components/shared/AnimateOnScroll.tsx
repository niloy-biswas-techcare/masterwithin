'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { motionTokens } from '@/lib/motion';

type Variant = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'scaleUp';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Reveals children with a scroll-triggered Framer Motion animation (§4a.3).
 * once: true — fires once on entry, never re-triggers on scroll-back.
 * Renders children unwrapped when prefers-reduced-motion is "reduce".
 */
export function AnimateOnScroll({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = motionTokens.deliberate,
  className,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return <>{children}</>;
  }

  const variants = motionTokens[variant];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: motionTokens.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
