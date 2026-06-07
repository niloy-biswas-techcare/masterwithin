"use server";
import { revalidatePath } from "next/cache";
import { listOrders, updateOrderStatus, deleteOrder } from "@mw/backend";
import { verifyOperator } from "@/lib/auth";
import type { Order, OrderLifecycleUpdate } from "@mw/backend";

export type ActionResult = { ok: true; order?: Order } | { ok: false; error: string };

export async function listOrdersAction(): Promise<Order[]> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return [];
  try {
    return await listOrders();
  } catch {
    return [];
  }
}

export async function updateOrderStatusAction(
  id: string,
  update: OrderLifecycleUpdate
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };
  try {
    const order = await updateOrderStatus(id, update);
    revalidatePath("/orders");
    return { ok: true, order };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update order" };
  }
}

export async function deleteOrderAction(id: string): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };
  try {
    await deleteOrder(id);
    revalidatePath("/orders");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete order" };
  }
}
