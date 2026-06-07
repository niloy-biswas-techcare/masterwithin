"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookSchema } from "@mw/types";
import type { Book } from "@mw/types";
import { ImageUploader } from "./ImageUploader";
import { upsertBookAction } from "@/app/actions/books.actions";

type BookFormData = Book;

interface BookFormProps {
  book?: Book;
}

export function BookForm({ book }: BookFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [coverImage, setCoverImage] = useState(book?.coverImage ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(BookSchema as any),
    defaultValues: book ?? {
      id: crypto.randomUUID(),
      title: "",
      author: "Souvik Ghosh",
      price: 0,
      coverImage: "",
      description: "",
      pages: undefined,
      available: true,
      order: 0,
    },
  });

  const handleCoverImageChange = (url: string) => {
    setCoverImage(url);
    setValue("coverImage", url, { shouldValidate: true });
  };

  const submit = (data: BookFormData) => {
    startTransition(async () => {
      const result = await upsertBookAction(data);
      if (result.ok) {
        toast.success(book ? "Book updated" : "Book created");
        router.push("/books");
      } else {
        toast.error(result.error ?? "Failed to save");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("id")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-text mb-1.5">
            Title <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input id="title" {...register("title")} className="field" aria-invalid={!!errors.title} />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-text mb-1.5">Author</label>
          <input id="author" {...register("author")} className="field" />
          {errors.author && <p className="field-error">{errors.author.message}</p>}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-text mb-1.5">
            Price (₹) <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <input id="price" type="number" min="0" {...register("price", { valueAsNumber: true })} className="field" />
          {errors.price && <p className="field-error">{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="pages" className="block text-sm font-medium text-text mb-1.5">Pages</label>
          <input id="pages" type="number" min="1" {...register("pages", { valueAsNumber: true })} className="field" />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-text mb-1.5">Sort order</label>
          <input id="order" type="number" {...register("order", { valueAsNumber: true })} className="field" />
        </div>

        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-text mb-1.5">Description</label>
          <textarea id="description" rows={4} {...register("description")} className="field resize-y" />
        </div>

        <div className="col-span-2">
          <ImageUploader
            value={coverImage}
            onChange={handleCoverImageChange}
            folder="masterwithin/covers"
            label="Cover image"
          />
          {errors.coverImage && <p className="field-error">{errors.coverImage.message}</p>}
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <input id="available" type="checkbox" {...register("available")} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
          <label htmlFor="available" className="text-sm text-text">Available for purchase</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/books")}
          className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Saving…" : book ? "Update Book" : "Create Book"}
        </button>
      </div>
    </form>
  );
}
