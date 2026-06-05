import { z } from "zod";

const envSchema = z.object({
  BACKEND_DRIVER: z.enum(["supabase", "fastapi"]),
  BACKEND_API_URL: z.string().url().optional().or(z.literal("")),
  
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().or(z.literal("")),
  SUPABASE_JWT_SECRET: z.string().optional().or(z.literal("")),
  
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal("")),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional().or(z.literal("")),
  
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  SUBSTACK_FEED_URL: z.string().url(),
  WHATSAPP_NUMBER: z.string(),
  RESEND_API_KEY: z.string().optional().or(z.literal("")),
  REVALIDATE_SECRET: z.string(),
  CRON_SECRET: z.string(),
  
  ADMIN_SESSION_COOKIE_NAME: z.string().default("mw_session"),
  ADMIN_SESSION_MAX_AGE_DAYS: z.coerce.number().default(5),
  ADMIN_ALLOWLIST: z.string().transform((val) => val.split(",").map((email) => email.trim())),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email(),
});

// safeParse to provide custom format output logging on failure
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid backend environment configuration:", JSON.stringify(result.error.format(), null, 2));
  throw new Error("Invalid backend environment configuration");
}

export const env = result.data;
export type Env = z.infer<typeof envSchema>;
