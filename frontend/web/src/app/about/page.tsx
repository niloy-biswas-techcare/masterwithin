'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  Sparkles,
  CalendarClock,
  Zap,
  FlaskConical,
  BookOpen,
  Target,
  ArrowRight,
} from 'lucide-react';
import { motionTokens } from '@/lib/motion';
import { AnimateOnScroll } from '@/components/shared/AnimateOnScroll';

const pillars = [
  {
    icon: Brain,
    title: 'Master Your Mind',
    desc: 'Easy and scientific methods to understand, calm, and direct your mind — building self-awareness, clarity, and lasting inner peace.',
    accent: 'from-primary/10 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    icon: Clock,
    title: 'Master Your Time',
    desc: 'The most effective time-management skills distilled into practical tools — so your energy goes toward what truly matters.',
    accent: 'from-deep/10 to-deep/5',
    iconColor: 'text-deep',
  },
  {
    icon: Sparkles,
    title: 'Become More Happy, Productive & Successful',
    desc: 'Real transformation that shows up in your daily life — in your focus, relationships, work, and sense of fulfillment.',
    accent: 'from-primary/10 to-transparent',
    iconColor: 'text-primary',
  },
] as const;

const approach = [
  {
    icon: CalendarClock,
    label: 'Weekly Solutions',
    desc: 'Unique, focused insights delivered every week — each one targeting a specific challenge you face.',
  },
  {
    icon: Zap,
    label: 'Concise & Simple',
    desc: 'Dense value without fluff. Every piece distilled to its most actionable, immediately usable essence.',
  },
  {
    icon: FlaskConical,
    label: 'Modern Research',
    desc: 'Rooted in contemporary neuroscience, cognitive science, and behavioral psychology.',
  },
  {
    icon: BookOpen,
    label: 'Timeless Wisdom',
    desc: 'Grounded in the profound insights of great Seers, helping millions of people across the world today.',
  },
  {
    icon: Target,
    label: 'Application-Based',
    desc: 'Not theory — practice. Every insight is designed to be lived, not just understood.',
  },
] as const;

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: motionTokens.deliberate, ease: motionTokens.easeOut } },
};

export default function AboutPage() {
  return (
    <div className="overflow-hidden">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 text-center overflow-hidden">
        {/* Background radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0.5%,transparent_18%)] opacity-25 dark:opacity-15 pointer-events-none" />
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.025] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.standard, ease: motionTokens.easeOut }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-6"
          >
            Our Mission
          </motion.span>

          <motion.h1
            initial={motionTokens.fadeUp.hidden}
            animate={motionTokens.fadeUp.visible}
            transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut, delay: 0.08 }}
            className="font-display font-bold tracking-[-0.02em] text-text leading-[1.1] mb-6"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)' }}
          >
            Easy, Scientific Methods to{' '}
            <span className="text-primary">Master Your Mind</span>
            {' '}& Your Time.
          </motion.h1>

          <motion.p
            initial={motionTokens.fadeUp.hidden}
            animate={motionTokens.fadeUp.visible}
            transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[1.0625rem] text-text/75 leading-relaxed font-body"
          >
            Master Within helps you deal with your mind and master the most effective time-management skills,
            so that you can become more <em>happy</em>, <em>productive</em>, and <em>successful</em> in life.
          </motion.p>
        </div>
      </section>

      {/* ── Three Pillars ───────────────────────────────────────────────── */}
      <section className="py-16 px-5 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll variant="fadeUp" className="text-center mb-12">
            <h2 className="font-display font-bold text-[1.75rem] text-text tracking-tight">
              What We Help You Achieve
            </h2>
          </AnimateOnScroll>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {pillars.map(({ icon: Icon, title, desc, accent, iconColor }) => (
              <motion.div
                key={title}
                variants={cardVariant}
                className={`relative rounded-2xl border border-border/60 bg-gradient-to-br ${accent} p-7 flex flex-col gap-4 group hover:border-primary/30 transition-colors duration-300`}
              >
                <div className={`w-11 h-11 rounded-xl bg-surface border border-border/60 flex items-center justify-center shadow-sm ${iconColor}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-display font-semibold text-[1.125rem] text-text leading-snug">{title}</h3>
                <p className="text-sm text-text/65 leading-relaxed font-body">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission Statement Block ──────────────────────────────────────── */}
      <AnimateOnScroll variant="scaleUp">
        <section className="py-16 px-5 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/[0.07] px-8 py-10 text-center overflow-hidden">
              {/* decorative quote marks */}
              <span className="absolute top-4 left-6 font-display text-7xl text-primary/10 leading-none select-none" aria-hidden="true">&ldquo;</span>
              <span className="absolute bottom-2 right-6 font-display text-7xl text-primary/10 leading-none select-none" aria-hidden="true">&rdquo;</span>

              <p className="relative font-display font-medium text-[1.25rem] md:text-[1.4rem] text-text leading-relaxed italic">
                We bring you unique solutions every week in the most concise and simple manner.
                They are based upon modern-day research evidence and the timeless wisdom of the great Seers,
                helping millions of people across the world today.
              </p>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ── How We Work ─────────────────────────────────────────────────── */}
      <section className="py-16 px-5 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <AnimateOnScroll variant="fadeUp" className="text-center mb-12">
            <h2 className="font-display font-bold text-[1.75rem] text-text tracking-tight mb-3">
              How We Work
            </h2>
            <p className="text-text/60 font-body text-[0.9375rem] max-w-xl mx-auto">
              Every piece of content we create follows five non-negotiable principles.
            </p>
          </AnimateOnScroll>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {approach.map(({ icon: Icon, label, desc }) => (
              <motion.div
                key={label}
                variants={cardVariant}
                className="flex gap-4 rounded-xl border border-border/50 bg-surface/60 p-5 hover:border-primary/20 hover:bg-primary/[0.03] transition-colors duration-300"
              >
                <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-body font-semibold text-text text-[0.9375rem] mb-1">{label}</h3>
                  <p className="text-sm text-text/60 leading-relaxed font-body">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Philosophy Quote ────────────────────────────────────────────── */}
      <AnimateOnScroll variant="fadeUp" delay={0.05}>
        <section className="py-20 px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="h-px flex-1 bg-border/40" />
              <span className="text-[11px] font-body font-semibold tracking-widest text-text/40 uppercase">Our Philosophy</span>
              <span className="h-px flex-1 bg-border/40" />
            </div>

            <motion.p
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: motionTokens.contemplative, ease: motionTokens.easeOut }}
              className="font-display font-bold text-text leading-[1.2] mb-6"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            >
              <span className="text-primary">To Do.</span>{' '}
              <span className="text-text/80">To Be.</span>{' '}
              <span className="text-deep">To Have.</span>
            </motion.p>

            <motion.p
              initial={motionTokens.fadeUp.hidden}
              whileInView={motionTokens.fadeUp.visible}
              viewport={{ once: true }}
              transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut, delay: 0.15 }}
              className="text-[1.0625rem] text-text/65 font-body leading-relaxed max-w-xl mx-auto"
            >
              Rather than theory, our contents are very much application-based.
              To Do, Be and Have is the only way to turn our dreams into reality.
            </motion.p>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <AnimateOnScroll variant="fadeUp">
        <section className="py-16 px-5 sm:px-8 pb-24">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display font-bold text-[1.5rem] text-text mb-4">
              Ready to Begin?
            </h2>
            <p className="text-text/60 font-body text-[0.9375rem] mb-8 leading-relaxed">
              Explore the Wisdom Library for weekly insights, or let the Guided Entry find the right starting point for you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/wisdom"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 min-h-11 font-body font-semibold text-white hover:bg-deep transition-colors shadow-sm"
              >
                Explore Wisdom Library <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/start-here"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 min-h-11 font-body font-semibold text-text hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                Guided Entry
              </Link>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

    </div>
  );
}
