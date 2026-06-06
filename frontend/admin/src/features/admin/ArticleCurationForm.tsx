"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { Article, Category } from "@mw/types";
import {
  featureArticleAction,
  overrideCategoryAction,
} from "@/app/actions/articles.actions";

const CurationSchema = z.object({
  category: z.string().min(1),
  tags: z.string(), // comma-separated
  excerpt: z.string(),
  substackUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean(),
});

type CurationData = z.infer<typeof CurationSchema>;

interface Props {
  article: Article;
  categories: readonly Category[];
}

export function ArticleCurationForm({ article, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit } = useForm<CurationData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CurationSchema as any),
    defaultValues: {
      category: article.category,
      tags: article.tags.join(", "),
      excerpt: article.excerpt,
      substackUrl: article.substackUrl,
      featured: article.featured,
    },
  });

  const submit = (data: CurationData) => {
    startTransition(async () => {
      const results = await Promise.allSettled([
        data.category !== article.category
          ? overrideCategoryAction(article.id, data.category)
          : Promise.resolve({ ok: true }),
        data.featured !== article.featured
          ? featureArticleAction(article.id, data.featured)
          : Promise.resolve({ ok: true }),
      ]);
      const failed = results.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)
      );
      if (failed.length === 0) {
        toast.success("Article updated");
        router.push("/articles");
      } else {
        toast.error("Some updates failed");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <div>
        <p className="text-sm font-medium text-text mb-1">{article.title}</p>
        <p className="text-xs text-muted">
          Published: {new Date(article.publishedAt).toLocaleDateString("en-IN")}
          {article.categoryLocked && (
            <span className="ml-2 text-warning">🔒 Category locked</span>
          )}
        </p>
      </div>

      <div>
        <label htmlFor="cat" className="block text-sm font-medium text-text mb-1.5">
          Category
          {article.categoryLocked && <span className="ml-1 text-xs text-warning">(locked — override will reset lock)</span>}
        </label>
        <select id="cat" {...register("category")} className="field">
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-text mb-1.5">Tags</label>
        <input id="tags" {...register("tags")} className="field" placeholder="comma-separated" />
        <p className="mt-1 text-xs text-muted">Comma-separated. Saved on next sync trigger.</p>
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-text mb-1.5">Excerpt</label>
        <textarea id="excerpt" rows={3} {...register("excerpt")} className="field resize-y" />
      </div>

      <div>
        <label htmlFor="sub-url" className="block text-sm font-medium text-text mb-1.5">Substack URL</label>
        <input id="sub-url" type="url" {...register("substackUrl")} className="field" />
      </div>

      <div className="flex items-center gap-2">
        <input id="featured" type="checkbox" {...register("featured")} className="h-4 w-4 rounded border-border" />
        <label htmlFor="featured" className="text-sm text-text">Featured on homepage</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.push("/articles")} className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
        <button type="submit" disabled={isPending} className="h-9 px-5 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {isPending ? "Saving…" : "Save Curation"}
        </button>
      </div>
    </form>
  );
}
