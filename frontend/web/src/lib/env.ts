import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://masterwithin.org"),
});

const serverSchema = clientSchema.extend({
  BACKEND_DRIVER: z.enum(["supabase", "fastapi"]).default("supabase"),
  BACKEND_API_URL: z.string().url().optional().or(z.literal("")),
  WHATSAPP_NUMBER: z.string().optional().or(z.literal("")),
  REVALIDATE_SECRET: z.string().optional().or(z.literal("")),
});

const isServer = typeof window === "undefined";

const parseEnv = () => {
  if (isServer) {
    const result = serverSchema.safeParse(process.env);
    if (!result.success) {
      console.error("❌ Invalid server environment variables:", JSON.stringify(result.error.format(), null, 2));
      throw new Error("Invalid server environment variables");
    }
    return result.data;
  } else {
    const result = clientSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    });
    if (!result.success) {
      console.error("❌ Invalid client environment variables:", JSON.stringify(result.error.format(), null, 2));
      throw new Error("Invalid client environment variables");
    }
    return {
      ...result.data,
      BACKEND_DRIVER: undefined,
      BACKEND_API_URL: undefined,
      WHATSAPP_NUMBER: undefined,
      REVALIDATE_SECRET: undefined,
    } as unknown as z.infer<typeof serverSchema>;
  }
};

export const env = parseEnv();
