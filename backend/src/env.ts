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

let envData: Env;
const result = envSchema.safeParse(process.env);

if (!result.success) {
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
  if (isBuildPhase) {
    console.warn("⚠️ Warning: Invalid backend environment during build phase. Using fallback values.");
    envData = {
      BACKEND_DRIVER: 'supabase',
      BACKEND_API_URL: '',
      NEXT_PUBLIC_SUPABASE_URL: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
      SUPABASE_JWT_SECRET: '',
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: '',
      CLOUDINARY_API_KEY: '',
      CLOUDINARY_API_SECRET: '',
      CLOUDINARY_UPLOAD_PRESET: '',
      NEXT_PUBLIC_SITE_URL: 'https://masterwithin.org',
      SUBSTACK_FEED_URL: 'https://masterwithin.substack.com/feed',
      WHATSAPP_NUMBER: '919876543210',
      RESEND_API_KEY: '',
      REVALIDATE_SECRET: 'mock',
      CRON_SECRET: 'mock',
      ADMIN_SESSION_COOKIE_NAME: 'mw_session',
      ADMIN_SESSION_MAX_AGE_DAYS: 5,
      ADMIN_ALLOWLIST: ['admin@masterwithin.org'],
      ADMIN_BOOTSTRAP_EMAIL: 'admin@masterwithin.org',
    };
  } else {
    console.error("❌ Invalid backend environment configuration:", JSON.stringify(result.error.format(), null, 2));
    throw new Error("Invalid backend environment configuration");
  }
} else {
  envData = result.data;
}

export const env = envData;
export type Env = z.infer<typeof envSchema>;
