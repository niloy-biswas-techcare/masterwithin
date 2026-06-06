import type { CourseRepository, Course } from '../../domain';

export type ListCourses = () => Promise<Course[]>;

export function makeListCourses(courses: CourseRepository): ListCourses {
  return async () => {
    return courses.list();
  };
}
