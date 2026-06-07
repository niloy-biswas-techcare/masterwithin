"use server";
import { revalidatePath } from "next/cache";
import { upsertBook, deleteBook } from "@mw/backend";
import { BookSchema } from "@mw/types";
import { verifyOperator } from "@/lib/auth";
import type { Book } from "@mw/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertBookAction(data: unknown): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  const parsed = BookSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await upsertBook({ uid: operator.uid, email: operator.email }, parsed.data as Book);
    revalidatePath("/store");
    revalidatePath("/books");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}

export async function deleteBookAction(id: string): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    await deleteBook({ uid: operator.uid, email: operator.email }, id);
    revalidatePath("/store");
    revalidatePath("/books");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete" };
  }
}
