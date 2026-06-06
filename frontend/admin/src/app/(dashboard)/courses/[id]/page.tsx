import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { listCourses } from "@mw/backend";
import { CourseForm } from "@/features/admin/CourseForm";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;
  const courses = await listCourses().catch(() => []);
  const course = courses.find((c) => c.id === id);
  if (!course) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/courses" className="text-muted hover:text-text text-sm flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <ChevronLeft size={14} aria-hidden="true" />Courses
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-text truncate">{course.title}</span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-text">Edit Course</h1>
      <div className="bg-surface rounded-lg border border-border p-6">
        <CourseForm course={course} />
      </div>
    </div>
  );
}
