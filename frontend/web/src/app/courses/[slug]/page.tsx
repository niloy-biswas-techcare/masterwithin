import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listCourses } from '@mw/backend';
import { Badge, Card } from '@mw/ui';
import { ChevronRight, ArrowLeft, Target, Award, ListChecks, ArrowUpRight } from 'lucide-react';
import { generateSiteMetadata, getCourseJsonLd } from '@/lib/seo';
import type { Course } from '@mw/types';

export const revalidate = 3600; // Cache for 1 hour (ISR)

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Statically compile courses paths at build time (§5.1, §12.3)
export async function generateStaticParams() {
  try {
    const courses = await listCourses();
    return courses.filter((c) => c.published).map((c) => ({
      slug: c.slug,
    }));
  } catch (err) {
    console.error('[course-detail] Failed to generate static params:', err);
    return [];
  }
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const courses = await listCourses();
    const course = courses.find((c) => c.slug === slug && c.published);
    if (!course) return generateSiteMetadata({ title: 'Course Not Found' });
    return generateSiteMetadata({
      title: course.title,
      description: course.description,
      path: `/courses/${slug}`,
    });
  } catch {
    return generateSiteMetadata({ title: 'Course' });
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;

  let course: Course | null = null;

  try {
    const allCourses = await listCourses();
    course = allCourses.find((c) => c.slug === slug && c.published) || null;
  } catch (err) {
    console.error('[course-detail] Failed to fetch course from database:', err);
  }

  // Fallback structures if database is empty/offline
  if (!course) {
    const fallbacks: Record<string, Course> = {
      'foundational-discipline': {
        id: '1',
        slug: 'foundational-discipline',
        title: 'Foundational Discipline & Habits',
        level: 'beginner',
        description: 'A structured guidance into forming daily micro-habits, restructuring focus, and ordering the body vitality.',
        whoItsFor: 'Anyone seeking direction, habit restructuring, or personal discipline.',
        whatYoullGain: 'Core discipline routines, mental focus training, vitality balance.',
        moduleOutline: [
          { title: 'The Anatomy of Micro-Habits', summary: 'Understanding how tiny changes compound over days to build structural discipline.' },
          { title: 'Attention & Focus Architecture', summary: 'Techniques to remove digital friction and restore baseline attention spans.' },
          { title: 'Physical Vitality & Sleep Codes', summary: 'Structuring rest, diet, and physical movement to optimize vital energy.' },
        ],
        enrollmentCtaLabel: 'Begin this path',
        enrollmentCtaUrl: 'https://masterwithin.org/contact',
        published: true,
        order: 0,
      },
      'conscious-inquiry': {
        id: '2',
        slug: 'conscious-inquiry',
        title: 'The Science of Conscious Inquiry',
        level: 'intermediate',
        description: 'Deconstructing mental conditioning, analyzing cognitive habits, and exploring the science of consciousness.',
        whoItsFor: 'Seekers wanting to go deeper into subjective awareness, mind mechanics, and academic cognitive models.',
        whatYoullGain: 'Awareness training exercises, cognitive patterns understanding, meditative practices.',
        moduleOutline: [
          { title: 'Deconstructing the conditioning', summary: 'Identifying societal, evolutionary, and psychological narratives of self.' },
          { title: 'Consciousness as Context', summary: 'Transitioning from content-based thinking to pure subjective awareness context.' },
          { title: 'Practical Meditative Inquiry', summary: 'Step-by-step guidance on self-inquiry methods.' },
        ],
        enrollmentCtaLabel: 'Begin this path',
        enrollmentCtaUrl: 'https://masterwithin.org/contact',
        published: true,
        order: 1,
      },
      'first-principles-metaphysics': {
        id: '3',
        slug: 'first-principles-metaphysics',
        title: 'First Principles of Metaphysics',
        level: 'advanced',
        description: 'The study of non-dual reality, absolute consciousness, and ancient philosophical systems of first principles.',
        whoItsFor: 'Advanced practitioners seeking to study metaphysics and first principles.',
        whatYoullGain: 'Cosmological structures, metaphysical insight, non-dual philosophy.',
        moduleOutline: [
          { title: 'Foundations of Metaphysics', summary: 'Historical and ontological study of reality structures.' },
          { title: 'Non-Dual Consciousness', summary: 'Deep dive into pure subject-object dissolution philosophy.' },
          { title: 'Living First Principles', summary: 'Applying absolute metaphysics into daily actions and contributions.' },
        ],
        enrollmentCtaLabel: 'Begin this path',
        enrollmentCtaUrl: 'https://masterwithin.org/contact',
        published: true,
        order: 2,
      },
    };

    course = fallbacks[slug] || null;
  }

  if (!course) {
    notFound();
  }

  // Schema generation
  const courseJsonLd = getCourseJsonLd(course);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <div className="mx-auto max-w-content px-5 sm:px-8 lg:px-10 py-12 flex flex-col gap-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text/50">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text/80">{course.title}</span>
        </nav>

        {/* Back Link */}
        <div>
          <Link
            href="/courses"
            className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Back to Curriculum
          </Link>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="capitalize">{course.level}</Badge>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
              {course.title}
            </h1>
            <p className="text-lg text-text/85 leading-relaxed font-body">
              {course.description}
            </p>

            {/* Target Audience / Gain Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <Card className="p-6 border border-border/60 bg-surface/30 flex gap-3.5">
                <Target className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-sm text-text">Who It Is For</h3>
                  <p className="text-xs text-text/75 mt-2 leading-relaxed font-body">{course.whoItsFor}</p>
                </div>
              </Card>

              <Card className="p-6 border border-border/60 bg-surface/30 flex gap-3.5">
                <Award className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-bold text-sm text-text">What You Gain</h3>
                  <p className="text-xs text-text/75 mt-2 leading-relaxed font-body">{course.whatYoullGain}</p>
                </div>
              </Card>
            </div>

            {/* Course modules */}
            {course.moduleOutline && course.moduleOutline.length > 0 && (
              <div className="mt-8 flex flex-col gap-6">
                <h2 className="font-display text-xl font-bold text-text flex items-center gap-2 border-b border-border/40 pb-2">
                  <ListChecks className="h-5 w-5 text-primary" /> Curriculum Outline
                </h2>
                
                <div className="flex flex-col gap-4">
                  {course.moduleOutline.map((mod, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-surface/10">
                      <span className="font-sans font-bold text-sm text-primary shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="font-display font-semibold text-text text-base">{mod.title}</h4>
                        {mod.summary && (
                          <p className="text-xs text-text/70 mt-1.5 leading-relaxed font-body">{mod.summary}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration sidebar */}
          <div className="border border-border/60 rounded-2xl bg-surface/40 p-8 flex flex-col gap-6 shadow-sm sticky top-24">
            <h3 className="font-display font-bold text-lg text-text">Enrollment</h3>
            <p className="text-sm text-text/70 leading-relaxed font-body">
              This course is currently open for applications. Click the button below to register or contact Souvik directly to request coordinates.
            </p>
            <a
              href={course.enrollmentCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/95 text-white font-semibold px-6 py-3 transition-colors shadow-sm text-sm"
            >
              {course.enrollmentCtaLabel} <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
