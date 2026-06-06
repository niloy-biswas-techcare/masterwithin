import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
});

const serverSchema = clientSchema.extend({
  BACKEND_DRIVER: z.enum(["supabase", "fastapi"]).default("supabase"),
  BACKEND_API_URL: z.string().url().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal("")),
  CLOUDINARY_UPLOAD_PRESET: z.string().default("mw_signed"),
  ADMIN_SESSION_COOKIE_NAME: z.string().default("mw_session"),
  ADMIN_SESSION_MAX_AGE_DAYS: z.coerce.number().default(5),
  ADMIN_ALLOWLIST: z
    .string()
    .default("")
    .transform((val) =>
      val
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    ),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional().or(z.literal("")),
  CRON_SECRET: z.string().optional().or(z.literal("")),
  REVALIDATE_SECRET: z.string().optional().or(z.literal("")),
});

const isServer = typeof window === "undefined";

function parseEnv() {
  if (isServer) {
    const result = serverSchema.safeParse(process.env);
    if (!result.success) {
      console.error(
        "❌ Invalid admin environment variables:",
        JSON.stringify(result.error.format(), null, 2)
      );
      throw new Error("Invalid admin environment variables");
    }
    return result.data;
  }
  const result = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
  if (!result.success) {
    console.error(
      "❌ Invalid admin client env variables:",
      JSON.stringify(result.error.format(), null, 2)
    );
    throw new Error("Invalid admin client environment variables");
  }
  return {
    ...result.data,
    BACKEND_DRIVER: undefined,
    BACKEND_API_URL: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
    CLOUDINARY_API_KEY: undefined,
    CLOUDINARY_API_SECRET: undefined,
    CLOUDINARY_UPLOAD_PRESET: undefined,
    ADMIN_SESSION_COOKIE_NAME: undefined,
    ADMIN_SESSION_MAX_AGE_DAYS: undefined,
    ADMIN_ALLOWLIST: undefined,
    ADMIN_BOOTSTRAP_EMAIL: undefined,
    CRON_SECRET: undefined,
    REVALIDATE_SECRET: undefined,
  } as unknown as z.infer<typeof serverSchema>;
}

export const env = parseEnv();
