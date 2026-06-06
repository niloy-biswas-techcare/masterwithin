import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { cookies } from "next/headers";
import { requireOperator } from "@mw/backend";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Issues short-lived signed upload credentials (§17.7) 🔒.
 * Auth-gated: returns 401 if no valid operator session.
 * Handles both Cloudinary (images) and Supabase Storage (files).
 */
export async function POST(req: NextRequest) {
  // Auth check (§17.3)
  const cookieStore = await cookies();
  const token = cookieStore.get(env.ADMIN_SESSION_COOKIE_NAME ?? "mw_session")?.value;
  try {
    await requireOperator(token, "editor");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { type: "image" | "file"; bucket?: string; folder?: string };

  if (body.type === "image") {
    // Cloudinary signed upload params
    cloudinary.config({
      cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET ?? "mw_signed";
    const folder = body.folder ?? "masterwithin/covers";
    const paramsToSign = { timestamp, upload_preset: uploadPreset, folder };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET ?? ""
    );

    return NextResponse.json({
      signature,
      timestamp,
      upload_preset: uploadPreset,
      folder,
      api_key: env.CLOUDINARY_API_KEY,
      cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  }

  if (body.type === "file") {
    // Supabase Storage signed upload URL
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const bucket = body.bucket ?? "freebies";
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Failed to sign" }, { status: 500 });
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
      bucket,
    });
  }

  return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
}
