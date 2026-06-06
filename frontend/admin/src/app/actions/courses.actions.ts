"use server";
import { revalidatePath } from "next/cache";
import { upsertCourse, writeAuditLog } from "@mw/backend";
import { CourseSchema } from "@mw/types";
import { verifyOperator } from "@/lib/auth";
import type { Course } from "@mw/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertCourseAction(data: unknown): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  const parsed = CourseSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    await upsertCourse({ uid: operator.uid, email: operator.email }, parsed.data as Course);
    await writeAuditLog({
      actorUid: operator.uid,
      actorEmail: operator.email,
      action: "update",
      entity: "course",
      entityId: parsed.data.id,
      diff: {},
    });
    revalidatePath("/courses");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}
