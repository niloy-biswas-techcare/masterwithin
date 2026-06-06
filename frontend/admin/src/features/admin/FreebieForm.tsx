"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FreebieSchema } from "@mw/types";
import type { Freebie } from "@mw/types";
import { FileUploader } from "./FileUploader";
import { ImageUploader } from "./ImageUploader";
import { upsertFreebieAction } from "@/app/actions/freebies.actions";

export function FreebieForm({ freebie }: { freebie?: Freebie }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fileUrl, setFileUrl] = useState(freebie?.fileUrl ?? "");
  const [coverImage, setCoverImage] = useState(freebie?.coverImage ?? "");

  const { register, handleSubmit, formState: { errors } } = useForm<Freebie>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(FreebieSchema as any),
    defaultValues: freebie ?? { id: crypto.randomUUID(), title: "", description: "", fileUrl: "", published: false, order: 0 },
  });

  const submit = (data: Freebie) => {
    if (!fileUrl) { toast.error("Please upload a file"); return; }
    startTransition(async () => {
      const result = await upsertFreebieAction({ ...data, fileUrl, coverImage: coverImage || undefined });
      if (result.ok) { toast.success(freebie ? "Updated" : "Created"); router.push("/freebies"); }
      else toast.error(result.error ?? "Failed");
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("id")} />
      <div>
        <label htmlFor="f-title" className="block text-sm font-medium text-text mb-1.5">Title *</label>
        <input id="f-title" {...register("title")} className="field" aria-invalid={!!errors.title} />
        {errors.title && <p className="field-error">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="f-desc" className="block text-sm font-medium text-text mb-1.5">Description</label>
        <textarea id="f-desc" rows={3} {...register("description")} className="field resize-y" />
      </div>
      <div>
        <label htmlFor="f-order" className="block text-sm font-medium text-text mb-1.5">Sort order</label>
        <input id="f-order" type="number" {...register("order", { valueAsNumber: true })} className="field" />
      </div>
      <FileUploader value={fileUrl} onChange={setFileUrl} label="Downloadable file (PDF/ePub)" />
      <ImageUploader value={coverImage} onChange={setCoverImage} folder="masterwithin/freebies" label="Cover image (optional)" />
      <div className="flex items-center gap-2">
        <input id="f-pub" type="checkbox" {...register("published")} className="h-4 w-4 rounded border-border" />
        <label htmlFor="f-pub" className="text-sm text-text">Published</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.push("/freebies")} className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
        <button type="submit" disabled={isPending} className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {isPending ? "Saving…" : freebie ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
