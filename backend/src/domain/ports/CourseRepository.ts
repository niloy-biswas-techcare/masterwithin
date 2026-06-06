import type { Course } from '../entities';

/**
 * CourseRepository port (§9, §16). Course listings & detail (§7.6).
 */
export interface CourseRepository {
  /** List courses by manual `order` weight (ascending). */
  list(): Promise<Course[]>;
  /** Fetch one course by its immutable slug, or null. */
  getBySlug(slug: string): Promise<Course | null>;
  /** Fetch one course by id, or null. */
  getById(id: string): Promise<Course | null>;
  /** Create or update a course by id. */
  upsert(course: Course): Promise<Course>;
}
