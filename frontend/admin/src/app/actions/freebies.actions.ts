"use server";
import { revalidatePath } from "next/cache";
import { upsertFreebie, deleteFreebie } from "@mw/backend";
import { FreebieSchema } from "@mw/types";
import { verifyOperator } from "@/lib/auth";
import type { Freebie } from "@mw/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertFreebieAction(data: unknown): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  const parsed = FreebieSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await upsertFreebie({ uid: operator.uid, email: operator.email }, parsed.data as Freebie);
    revalidatePath("/store");
    revalidatePath("/freebies");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}

export async function deleteFreebieAction(id: string): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    await deleteFreebie({ uid: operator.uid, email: operator.email }, id);
    revalidatePath("/store");
    revalidatePath("/freebies");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete" };
  }
}
