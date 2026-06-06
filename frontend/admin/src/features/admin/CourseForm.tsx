"use client";
import { useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { CourseSchema } from "@mw/types";
import type { Course } from "@mw/types";
import { upsertCourseAction } from "@/app/actions/courses.actions";
import { slugify } from "@mw/utils";

export function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<Course>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CourseSchema as any),
    defaultValues: course ?? {
      id: crypto.randomUUID(),
      slug: "",
      title: "",
      level: "beginner",
      description: "",
      whoItsFor: "",
      whatYoullGain: "",
      moduleOutline: [],
      enrollmentCtaLabel: "Enroll Now",
      enrollmentCtaUrl: "",
      published: false,
      order: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "moduleOutline" });
  const titleValue = watch("title");

  const submit = (data: Course) => {
    startTransition(async () => {
      const result = await upsertCourseAction(data);
      if (result.ok) { toast.success(course ? "Course updated" : "Course created"); router.push("/courses"); }
      else toast.error(result.error ?? "Failed");
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("id")} />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label htmlFor="c-title" className="block text-sm font-medium text-text mb-1.5">Title *</label>
          <input id="c-title" {...register("title")} onBlur={() => { if (!course) setValue("slug", slugify(titleValue)); }} className="field" />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="c-slug" className="block text-sm font-medium text-text mb-1.5">Slug</label>
          <input id="c-slug" {...register("slug")} className="field" />
          {errors.slug && <p className="field-error">{errors.slug.message}</p>}
        </div>
        <div>
          <label htmlFor="c-level" className="block text-sm font-medium text-text mb-1.5">Level</label>
          <select id="c-level" {...register("level")} className="field">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor="c-desc" className="block text-sm font-medium text-text mb-1.5">Description</label>
          <textarea id="c-desc" rows={3} {...register("description")} className="field resize-y" />
        </div>
        <div>
          <label htmlFor="c-who" className="block text-sm font-medium text-text mb-1.5">Who it&#39;s for</label>
          <textarea id="c-who" rows={3} {...register("whoItsFor")} className="field resize-y" />
        </div>
        <div>
          <label htmlFor="c-gain" className="block text-sm font-medium text-text mb-1.5">What you&#39;ll gain</label>
          <textarea id="c-gain" rows={3} {...register("whatYoullGain")} className="field resize-y" />
        </div>
        <div>
          <label htmlFor="c-cta-label" className="block text-sm font-medium text-text mb-1.5">CTA Label</label>
          <input id="c-cta-label" {...register("enrollmentCtaLabel")} className="field" />
        </div>
        <div>
          <label htmlFor="c-cta-url" className="block text-sm font-medium text-text mb-1.5">CTA URL</label>
          <input id="c-cta-url" type="url" {...register("enrollmentCtaUrl")} className="field" />
          {errors.enrollmentCtaUrl && <p className="field-error">{errors.enrollmentCtaUrl.message}</p>}
        </div>
        <div>
          <label htmlFor="c-order" className="block text-sm font-medium text-text mb-1.5">Sort order</label>
          <input id="c-order" type="number" {...register("order", { valueAsNumber: true })} className="field" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text">Module outline</span>
          <button type="button" onClick={() => append({ title: "", summary: "" })} className="text-xs text-primary hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
            <Plus size={12} />Add module
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input placeholder="Module title" {...register(`moduleOutline.${i}.title`)} className="field" />
                <input placeholder="Summary (optional)" {...register(`moduleOutline.${i}.summary`)} className="field" />
              </div>
              <button type="button" onClick={() => remove(i)} className="mt-2 text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="Remove module">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="c-pub" type="checkbox" {...register("published")} className="h-4 w-4 rounded border-border" />
        <label htmlFor="c-pub" className="text-sm text-text">Published</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.push("/courses")} className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
        <button type="submit" disabled={isPending} className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {isPending ? "Saving…" : course ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
