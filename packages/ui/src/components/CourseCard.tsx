import * as React from 'react';
import type { Course } from '@mw/types';
import { cn } from '../lib/cn';
import { Card } from './Card';
import { Badge } from '../primitives/Badge';

export interface CourseCardProps {
  course: Course;
  /** Destination, e.g. `/courses/[slug]`. */
  href: string;
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  className?: string;
}

/** Course summary card for the courses listing (§7.6, §11). */
export function CourseCard({ course, href, anchorProps, className }: CourseCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <a
        href={href}
        className="group flex flex-1 flex-col gap-2 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...anchorProps}
      >
        <Badge variant="neutral" className="self-start capitalize">
          {course.level}
        </Badge>
        <h3 className="font-display text-xl leading-tight text-text group-hover:text-deep">
          {course.title}
        </h3>
        <p className="line-clamp-3 text-base text-text/80">{course.description}</p>
      </a>
    </Card>
  );
}
