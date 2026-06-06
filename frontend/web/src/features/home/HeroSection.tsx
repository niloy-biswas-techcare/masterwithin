'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { motionTokens } from '@/lib/motion';

/**
 * Animated hero section for the Home page (§4a.5, §4a.4.2, §4a.6).
 * Client component so Framer Motion on-mount animations work.
 */
export function HeroSection() {
  return (
    <>
      {/* Hero — section-lg (§4a.1) */}
      <section className="relative overflow-hidden section-lg bg-linear-to-b from-surface/50 to-bg border-b border-border/20">
        {/* Radial gradient from primary at 3% opacity (§4a.5) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0.5%,transparent_15%)] opacity-30 dark:opacity-20 pointer-events-none" />
        {/* Grid texture at 0.025 opacity (§4a.5) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.025] pointer-events-none" />

        <div className="mx-auto max-w-330 px-5 sm:px-8 lg:px-10 xl:px-12 text-center relative z-10 flex flex-col items-center">
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.standard, ease: motionTokens.easeOut }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-body font-semibold tracking-widest text-primary uppercase"
          >
            <Compass className="h-3 w-3" aria-hidden="true" /> Digital Sanctuary
          </motion.span>

          {/* H1 — fluid clamp, philosophical phrase in text-primary (§4a.5) */}
          <motion.h1
            initial={motionTokens.fadeUp.hidden}
            animate={motionTokens.fadeUp.visible}
            transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut, delay: 0.08 }}
            className="max-w-3xl font-display font-bold tracking-[-0.02em] text-text leading-[1.1]"
            style={{ fontSize: 'clamp(2.75rem, 5vw, 4rem)' }}
          >
            Mastery is not in controlling others, but in returning to the{' '}
            <span className="text-primary">Source Within.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={motionTokens.fadeUp.hidden}
            animate={motionTokens.fadeUp.visible}
            transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut, delay: 0.18 }}
            className="mt-6 max-w-140 text-[1.0625rem] text-text/80 leading-relaxed font-body"
          >
            A contemplative school and digital sanctuary dedicated to self-actualization, systems of peace, and deep human consciousness.
          </motion.p>

          {/* CTA pair — min-h-11 = 44px touch target (§4a.5) */}
          <motion.div
            initial={motionTokens.fadeUp.hidden}
            animate={motionTokens.fadeUp.visible}
            transition={{ duration: motionTokens.standard, ease: motionTokens.easeOut, delay: 0.28 }}
            className="mt-10 flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/wisdom"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 min-h-11 font-body font-semibold text-white hover:bg-deep transition-colors shadow-sm"
            >
              Explore the Library <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/start-here"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 min-h-11 font-body font-semibold text-text hover:bg-primary/5 hover:border-primary/30 transition-colors"
            >
              Guided Entry <Compass className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Founder credit (§4a.5 HeroSection spec) */}
          <motion.p
            initial={motionTokens.fadeIn.hidden}
            animate={motionTokens.fadeIn.visible}
            transition={{ duration: motionTokens.standard, ease: motionTokens.easeOut, delay: 0.38 }}
            className="mt-6 text-sm text-text/60 font-body"
          >
            Founded by Souvik Ghosh, PhD — researcher, author, and practitioner.
          </motion.p>
        </div>
      </section>

      {/* Empathic reflection block — between Hero and Featured Articles (§4a.4.2, §4a.6) */}
      <motion.div
        initial={motionTokens.fadeIn.hidden}
        animate={motionTokens.fadeIn.visible}
        transition={{ duration: motionTokens.standard, ease: motionTokens.easeOut, delay: 0.5 }}
        className="py-10 px-5 text-center"
      >
        <p className="max-w-xl mx-auto font-display italic text-text/70 text-[1.0625rem] leading-relaxed">
          If you&apos;ve ever felt that the answers must go deeper than what you&apos;ve been given — you&apos;re in the right place.
        </p>
      </motion.div>
    </>
  );
}
