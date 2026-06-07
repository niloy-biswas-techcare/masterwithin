"use server";
import { revalidatePath } from "next/cache";
import {
  featureVideo,
  hideVideo,
  overrideVideoCategory,
  featurePlaylist,
  hidePlaylist,
  syncYoutube,
} from "@mw/backend";
import { z } from "zod";
import { verifyOperator } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function featureVideoAction(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    await featureVideo(id, featured, { uid: operator.uid, email: operator.email });
    revalidatePath("/");
    revalidatePath("/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function hideVideoAction(
  id: string,
  hidden: boolean
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    await hideVideo(id, hidden, { uid: operator.uid, email: operator.email });
    revalidatePath("/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function overrideVideoCategoryAction(
  id: string,
  category: string
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  const parsed = z.string().min(1).safeParse(category);
  if (!parsed.success) return { ok: false, error: "Invalid category" };

  try {
    await overrideVideoCategory(id, parsed.data, { uid: operator.uid, email: operator.email });
    revalidatePath("/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function featurePlaylistAction(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    await featurePlaylist(id, featured, { uid: operator.uid, email: operator.email });
    revalidatePath("/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function hidePlaylistAction(
  id: string,
  hidden: boolean
): Promise<ActionResult> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    await hidePlaylist(id, hidden, { uid: operator.uid, email: operator.email });
    revalidatePath("/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export type SyncResult = {
  totalNew: number;
  totalUpdated: number;
  totalFetched: number;
  channels: number;
};

export async function syncYoutubeAction(): Promise<
  ActionResult & { summary?: SyncResult }
> {
  const operator = await verifyOperator("editor").catch(() => null);
  if (!operator) return { ok: false, error: "Unauthorized" };

  try {
    const result = await syncYoutube({ uid: operator.uid, email: operator.email });

    if (result.channels.length === 0) {
      const errMsg = result.errors[0] ?? "No YouTube channels configured. Add channel IDs in Settings.";
      return { ok: false, error: errMsg };
    }

    revalidatePath("/");
    revalidatePath("/media");
    return {
      ok: true,
      summary: {
        totalNew: result.totalNew,
        totalUpdated: result.totalUpdated,
        totalFetched: result.totalFetched,
        channels: result.channels.length,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sync failed" };
  }
}
