"use server";
import { revalidatePath } from "next/cache";
import { listContacts, deleteContact, updateContactStatus } from "@mw/backend";
import { verifyOperator } from "@/lib/auth";
import type { Contact, ContactStatus } from "@mw/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function listContactsAction(): Promise<Contact[]> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return [];
  try {
    return await listContacts();
  } catch {
    return [];
  }
}

export async function markContactStatusAction(
  id: string,
  status: ContactStatus
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };
  try {
    await updateContactStatus(id, status);
    revalidatePath("/contacts");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update status" };
  }
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };
  try {
    await deleteContact(id);
    revalidatePath("/contacts");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete contact" };
  }
}
