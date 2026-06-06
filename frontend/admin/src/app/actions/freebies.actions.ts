"use server";
import { revalidatePath } from "next/cache";
import { upsertFreebie, writeAuditLog } from "@mw/backend";
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
    await writeAuditLog({
      actorUid: operator.uid,
      actorEmail: operator.email,
      action: "update",
      entity: "freebie",
      entityId: parsed.data.id,
      diff: {},
    });
    revalidatePath("/store");
    revalidatePath("/freebies");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}
