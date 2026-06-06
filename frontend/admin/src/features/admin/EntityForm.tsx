"use client";
import { useForm, type FieldValues, type DefaultValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import type { ZodSchema } from "zod";

export interface FieldConfig<T> {
  name: Path<T>;
  label: string;
  type?: "text" | "number" | "url" | "textarea" | "checkbox" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  description?: string;
}

interface EntityFormProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  fields: FieldConfig<T>[];
  onSubmit: (data: T) => Promise<{ ok: boolean; error?: string }>;
  submitLabel?: string;
  extraActions?: ReactNode;
}

export function EntityForm<T extends FieldValues>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  submitLabel = "Save",
  extraActions,
}: EntityFormProps<T>) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<T>({ resolver: zodResolver(schema as any), defaultValues });

  const submit = (data: T) => {
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.ok) {
        toast.success("Saved successfully");
      } else {
        toast.error(result.error ?? "Failed to save");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {fields.map((field) => {
        const error = errors[field.name]?.message as string | undefined;
        const fieldId = `field-${field.name as string}`;
        const errorId = `${fieldId}-error`;
        const descId = `${fieldId}-desc`;

        return (
          <div key={field.name as string}>
            {field.type !== "checkbox" && (
              <label
                htmlFor={fieldId}
                className="block text-sm font-medium text-text mb-1.5"
              >
                {field.label}
                {field.required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
              </label>
            )}

            {field.type === "textarea" ? (
              <textarea
                id={fieldId}
                {...register(field.name)}
                rows={4}
                placeholder={field.placeholder}
                aria-describedby={[error ? errorId : "", field.description ? descId : ""].filter(Boolean).join(" ") || undefined}
                aria-required={field.required}
                aria-invalid={!!error}
                className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            ) : field.type === "select" ? (
              <select
                id={fieldId}
                {...register(field.name)}
                aria-describedby={error ? errorId : undefined}
                aria-required={field.required}
                aria-invalid={!!error}
                className="w-full h-11 rounded-md border border-border bg-bg px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <label
                htmlFor={fieldId}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id={fieldId}
                  type="checkbox"
                  {...register(field.name)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text">{field.label}</span>
              </label>
            ) : (
              <input
                id={fieldId}
                type={field.type ?? "text"}
                {...register(field.name, {
                  valueAsNumber: field.type === "number",
                })}
                placeholder={field.placeholder}
                aria-describedby={[error ? errorId : "", field.description ? descId : ""].filter(Boolean).join(" ") || undefined}
                aria-required={field.required}
                aria-invalid={!!error}
                className="w-full h-11 rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}

            {field.description && (
              <p id={descId} className="mt-1 text-xs text-muted">
                {field.description}
              </p>
            )}
            {error && (
              <p
                id={errorId}
                role="alert"
                aria-live="polite"
                className="mt-1 text-xs text-danger"
              >
                {error}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-3 pt-2">
        {extraActions}
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
