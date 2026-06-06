import type { CourseRepository, Course, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper, buildDiff } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { ValidationError } from '../errors';
import { CourseSchema } from '@mw/types';

export type UpsertCourse = (
  actor: { uid: string; email: string },
  course: Course
) => Promise<Course>;

export function makeUpsertCourse(
  courses: CourseRepository,
  auditLogs: AuditLogRepository
): UpsertCourse {
  return async (actor, course) => {
    const parsed = CourseSchema.safeParse(course);
    if (!parsed.success) {
      throw new ValidationError('Invalid course data', parsed.error.flatten().fieldErrors);
    }

    const existing = await courses.getById(course.id);
    const updated = await courses.upsert(parsed.data);

    const diff = buildDiff(existing as any, updated as any);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: existing ? 'update' : 'create',
      entity: 'course',
      entityId: updated.id,
      diff,
    });

    await revalidatePath('/courses');
    await revalidatePath(`/courses/${updated.slug}`);
    if (existing && existing.slug !== updated.slug) {
      await revalidatePath(`/courses/${existing.slug}`);
    }

    return updated;
  };
}
