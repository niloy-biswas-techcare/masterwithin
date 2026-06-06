"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EbookSchema } from "@mw/types";
import type { Ebook } from "@mw/types";
import { ImageUploader } from "./ImageUploader";
import { upsertEbookAction } from "@/app/actions/ebooks.actions";

export function EbookForm({ ebook }: { ebook?: Ebook }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [coverImage, setCoverImage] = useState(ebook?.coverImage ?? "");

  const { register, handleSubmit, formState: { errors } } = useForm<Ebook>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(EbookSchema as any),
    defaultValues: ebook ?? { id: crypto.randomUUID(), title: "", coverImage: "", description: "", available: true, order: 0 },
  });

  const submit = (data: Ebook) => {
    startTransition(async () => {
      const result = await upsertEbookAction({ ...data, coverImage });
      if (result.ok) { toast.success(ebook ? "eBook updated" : "eBook created"); router.push("/ebooks"); }
      else toast.error(result.error ?? "Failed to save");
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("id")} />
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">Title *</label>
        <input id="title" {...register("title")} className="field" aria-invalid={!!errors.title} />
        {errors.title && <p className="field-error">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-text mb-1.5">Price (₹)</label>
          <input id="price" type="number" min="0" {...register("price", { valueAsNumber: true })} className="field" />
        </div>
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-text mb-1.5">Sort order</label>
          <input id="order" type="number" {...register("order", { valueAsNumber: true })} className="field" />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text mb-1.5">Description</label>
        <textarea id="description" rows={3} {...register("description")} className="field resize-y" />
      </div>
      <div>
        <label htmlFor="playStoreUrl" className="block text-sm font-medium text-text mb-1.5">Google Play URL</label>
        <input id="playStoreUrl" type="url" {...register("playStoreUrl")} className="field" placeholder="https://play.google.com/…" />
      </div>
      <div>
        <label htmlFor="kindleUrl" className="block text-sm font-medium text-text mb-1.5">Kindle URL</label>
        <input id="kindleUrl" type="url" {...register("kindleUrl")} className="field" placeholder="https://amazon.com/…" />
      </div>
      <ImageUploader value={coverImage} onChange={setCoverImage} folder="masterwithin/ebooks" label="Cover image" />
      <div className="flex items-center gap-2">
        <input id="available" type="checkbox" {...register("available")} className="h-4 w-4 rounded border-border" />
        <label htmlFor="available" className="text-sm text-text">Available</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.push("/ebooks")} className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
        <button type="submit" disabled={isPending} className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {isPending ? "Saving…" : ebook ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
