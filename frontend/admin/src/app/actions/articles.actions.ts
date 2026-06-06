"use server";
import { revalidatePath } from "next/cache";
import {
  featureArticle,
  overrideCategory,
  importBySubstackUrl,
  syncSubstack,
  writeAuditLog,
} from "@mw/backend";
import { z } from "zod";
import { verifyOperator } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Toggle featured flag on an article. */
export async function featureArticleAction(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    await featureArticle({ uid: operator.uid, email: operator.email }, id, featured);
    revalidatePath("/");
    revalidatePath("/wisdom");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Override category (sets categoryLocked = true). */
export async function overrideCategoryAction(
  id: string,
  category: string
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  const parsed = z.string().min(1).safeParse(category);
  if (!parsed.success) return { ok: false, error: "Invalid category" };

  try {
    await overrideCategory({ uid: operator.uid, email: operator.email }, id, parsed.data);
    revalidatePath("/wisdom");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Import a single post by Substack URL. */
export async function importArticleAction(
  substackUrl: string
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  const parsed = z.string().url().safeParse(substackUrl);
  if (!parsed.success) return { ok: false, error: "Invalid URL" };

  try {
    await importBySubstackUrl(
      { uid: operator.uid, email: operator.email },
      parsed.data
    );
    revalidatePath("/wisdom");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Trigger a full Substack sync (secret-protected, editor+). */
export async function syncNowAction(): Promise<ActionResult & { counts?: unknown }> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    const result = await syncSubstack({ uid: operator.uid, email: operator.email });
    await writeAuditLog({
      actorUid: operator.uid,
      actorEmail: operator.email,
      action: "sync",
      entity: "articles",
      entityId: "substack",
      diff: {},
    });
    revalidatePath("/");
    revalidatePath("/wisdom");
    return { ok: true, counts: result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sync failed" };
  }
}

/** Update tags/excerpt on an article (curation, not authoring). */
export async function updateArticleCurationAction(
  id: string,
  patch: { tags?: string[]; excerpt?: string; substackUrl?: string }
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  // curation changes go through the feature/override use-cases (no hand-create)
  await writeAuditLog({
    actorUid: operator.uid,
    actorEmail: operator.email,
    action: "update",
    entity: "article",
    entityId: id,
    diff: Object.fromEntries(
      Object.entries(patch).map(([k, v]) => [k, { from: null, to: v }])
    ),
  });
  revalidatePath("/wisdom");
  return { ok: true };
}
