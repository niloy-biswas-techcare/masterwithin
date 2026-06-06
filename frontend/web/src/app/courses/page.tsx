import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { listCourses } from '@mw/backend';
import { CourseCard } from '@mw/ui';
import { ArrowRight, Layers } from 'lucide-react';
import type { Course } from '@mw/types';
import { generateSiteMetadata } from '@/lib/seo';

export const revalidate = 3600; // Cache for 1 hour (ISR)

export const metadata: Metadata = generateSiteMetadata({
  title: 'Guided Courses',
  description:
    'Structured, self-paced philosophical courses from Master Within Foundation — from foundational discipline and habit-building to conscious inquiry and first principles of metaphysics.',
  path: '/courses',
});

export default async function CoursesPage() {
  let courses: Course[] = [];

  try {
    const allCourses = await listCourses();
    courses = allCourses.filter((c) => c.published);
  } catch (err) {
    console.error('[courses-page] Failed to fetch courses:', err);
  }

  // Fallback courses if database is empty/offline
  const displayedCourses = courses.length
    ? courses
    : ([
        {
          id: '1',
          slug: 'foundational-discipline',
          title: 'Foundational Discipline & Habits',
          level: 'beginner',
          description: 'A structured guidance into forming daily micro-habits, restructuring focus, and ordering the body vitality.',
          whoItsFor: 'Anyone seeking direction, habit restructuring, or personal discipline.',
          whatYoullGain: 'Core discipline routines, mental focus training, vitality balance.',
          moduleOutline: [],
          enrollmentCtaLabel: 'Enroll Now',
          enrollmentCtaUrl: 'https://masterwithin.org',
          published: true,
          order: 0,
        },
        {
          id: '2',
          slug: 'conscious-inquiry',
          title: 'The Science of Conscious Inquiry',
          level: 'intermediate',
          description: 'Deconstructing mental conditioning, analyzing cognitive habits, and exploring the science of consciousness.',
          whoItsFor: 'Seekers wanting to go deeper into subjective awareness, mind mechanics, and academic cognitive models.',
          whatYoullGain: 'Awareness training exercises, cognitive patterns understanding, meditative practices.',
          moduleOutline: [],
          enrollmentCtaLabel: 'Enroll Now',
          enrollmentCtaUrl: 'https://masterwithin.org',
          published: true,
          order: 1,
        },
        {
          id: '3',
          slug: 'first-principles-metaphysics',
          title: 'First Principles of Metaphysics',
          level: 'advanced',
          description: 'The study of non-dual reality, absolute consciousness, and ancient philosophical systems of first principles.',
          whoItsFor: 'Advanced practitioners seeking to study metaphysics and first principles.',
          whatYoullGain: 'Cosmological structures, metaphysical insight, non-dual philosophy.',
          moduleOutline: [],
          enrollmentCtaLabel: 'Enroll Now',
          enrollmentCtaUrl: 'https://masterwithin.org',
          published: true,
          order: 2,
        },
      ] as Course[]);

  // Sort courses by order weight
  const sortedCourses = [...displayedCourses].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-content px-6 py-12 flex flex-col gap-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
          Curriculum
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Guided Courses
        </h1>
        <p className="mt-4 text-text/80 leading-relaxed font-body">
          We offer structured, self-paced philosophical studies designed to guide you from foundational discipline to deep cosmological insight.
        </p>
      </div>

      {/* Learning Path Visualization (Timeline) */}
      <section className="bg-surface/30 border border-border/40 rounded-2xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <h2 className="font-display text-xl font-bold text-text mb-10 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" /> The Path of Inquiry
        </h2>

        {/* Timeline representation */}
        <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4 before:absolute before:left-4 before:top-8 before:h-[calc(100%-60px)] before:w-0.5 before:bg-border md:before:left-12 md:before:right-12 md:before:top-14 md:before:h-0.5 md:before:w-[calc(100%-96px)] before:content-[''] z-10">
          
          {/* Step 1: Beginner */}
          <div className="relative pl-10 md:pl-0 flex-1 flex flex-col items-start md:items-center text-left md:text-center gap-3">
            <div className="absolute left-0 top-1.5 md:relative md:top-0 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface border-2 border-primary text-primary font-bold font-sans text-sm shadow-sm">
              I
            </div>
            <div className="md:mt-3">
              <span className="text-[10px] uppercase font-semibold text-primary tracking-wider font-sans">Beginner Path</span>
              <h3 className="font-display font-bold text-text text-lg mt-1">Foundational Discipline</h3>
              <p className="text-xs text-text/70 max-w-xs mt-2 leading-relaxed font-body">
                Order your physical body, rest, and establish micro-habits to create a stable ground for attention.
              </p>
            </div>
          </div>

          {/* Step 2: Intermediate */}
          <div className="relative pl-10 md:pl-0 flex-1 flex flex-col items-start md:items-center text-left md:text-center gap-3">
            <div className="absolute left-0 top-1.5 md:relative md:top-0 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface border-2 border-amber-500 text-amber-500 font-bold font-sans text-sm shadow-sm">
              II
            </div>
            <div className="md:mt-3">
              <span className="text-[10px] uppercase font-semibold text-amber-500 tracking-wider font-sans">Intermediate Path</span>
              <h3 className="font-display font-bold text-text text-lg mt-1">Cognitive Awareness</h3>
              <p className="text-xs text-text/70 max-w-xs mt-2 leading-relaxed font-body">
                Deconstruct psychological conditioning, study the mechanism of mind, and develop focused meditation.
              </p>
            </div>
          </div>

          {/* Step 3: Advanced */}
          <div className="relative pl-10 md:pl-0 flex-1 flex flex-col items-start md:items-center text-left md:text-center gap-3">
            <div className="absolute left-0 top-1.5 md:relative md:top-0 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-surface border-2 border-indigo-500 text-indigo-500 font-bold font-sans text-sm shadow-sm">
              III
            </div>
            <div className="md:mt-3">
              <span className="text-[10px] uppercase font-semibold text-indigo-500 tracking-wider font-sans">Advanced Path</span>
              <h3 className="font-display font-bold text-text text-lg mt-1">Metaphysical Insight</h3>
              <p className="text-xs text-text/70 max-w-xs mt-2 leading-relaxed font-body">
                Inquire into absolute non-duality, first principles of reality, and transcendent consciousness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Catalog Grid */}
      <section className="flex flex-col gap-8">
        <div className="border-b border-border/40 pb-4">
          <h2 className="font-display text-2xl font-bold text-text">Available Courses</h2>
          <p className="text-sm text-text/60 mt-1">Find a structured program aligning with your experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sortedCourses.map((course) => (
            <div key={course.id} className="flex flex-col h-full justify-between">
              <CourseCard
                course={course}
                href={`/courses/${course.slug}`}
                className="h-full hover:-translate-y-1 hover:shadow-md transition-all duration-300 border border-border/60 bg-surface/30"
              />
              <div className="mt-4 px-5">
                <Link
                  href={`/courses/${course.slug}`}
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  View Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
