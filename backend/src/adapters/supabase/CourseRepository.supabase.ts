import type { Course, CourseRepository } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Course {
  const c: Course = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    level: row.level,
    description: row.description,
    whoItsFor: row.who_its_for,
    whatYoullGain: row.what_youll_gain,
    moduleOutline: row.module_outline || [],
    enrollmentCtaLabel: row.enrollment_cta_label,
    enrollmentCtaUrl: row.enrollment_cta_url,
    order: row.order,
    published: row.published,
  };
  if (row.cover_image !== null && row.cover_image !== undefined) {
    c.coverImage = row.cover_image;
  }
  return c;
}

function toRow(domain: Course): any {
  return {
    id: domain.id,
    slug: domain.slug,
    title: domain.title,
    level: domain.level,
    description: domain.description,
    who_its_for: domain.whoItsFor,
    what_youll_gain: domain.whatYoullGain,
    module_outline: domain.moduleOutline,
    enrollment_cta_label: domain.enrollmentCtaLabel,
    enrollment_cta_url: domain.enrollmentCtaUrl,
    cover_image: domain.coverImage ?? null,
    order: domain.order,
    published: domain.published,
  };
}

export class SupabaseCourseRepository implements CourseRepository {
  async list(): Promise<Course[]> {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async getBySlug(slug: string): Promise<Course | null> {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async getById(id: string): Promise<Course | null> {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(course: Course): Promise<Course> {
    const row = toRow(course);
    const { data, error } = await supabaseAdmin
      .from('courses')
      .upsert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }
}
