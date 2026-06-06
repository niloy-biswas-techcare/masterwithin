"use server";
import { revalidatePath } from "next/cache";
import {
  updateSiteConfig,
  updateStartHere,
  writeAuditLog,
} from "@mw/backend";
import { SiteConfigSchema, StartHereConfigSchema } from "@mw/types";
import { verifyOperator } from "@/lib/auth";
import type { SiteConfig, StartHereConfig } from "@mw/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateSiteConfigAction(
  data: unknown
): Promise<ActionResult> {
  const operator = await verifyOperator("admin").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized — requires admin role" };

  const parsed = SiteConfigSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    const config: SiteConfig = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
      updatedBy: operator.uid,
    };
    await updateSiteConfig({ uid: operator.uid, email: operator.email }, config);
    await writeAuditLog({
      actorUid: operator.uid,
      actorEmail: operator.email,
      action: "update",
      entity: "site_config",
      entityId: "main",
      diff: {},
    });
    revalidatePath("/");
    revalidatePath("/store");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}

export async function updateStartHereAction(
  data: unknown
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  const parsed = StartHereConfigSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await updateStartHere(
      { uid: operator.uid, email: operator.email },
      parsed.data as StartHereConfig
    );
    await writeAuditLog({
      actorUid: operator.uid,
      actorEmail: operator.email,
      action: "update",
      entity: "start_here",
      entityId: "config",
      diff: {},
    });
    revalidatePath("/start-here");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}
