'use server';

import { submitContact } from '@mw/backend';
import { ContactEmailSchema, ContactWhatsAppSchema } from '@mw/types';
import { headers } from 'next/headers';

// Simple in-memory rate-limiting map
const rateLimitCache = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 5;
  const windowMs = 60 * 1000;

  const record = rateLimitCache.get(ip);
  if (!record) {
    rateLimitCache.set(ip, { count: 1, lastReset: now });
    return false;
  }
  if (now - record.lastReset > windowMs) {
    rateLimitCache.set(ip, { count: 1, lastReset: now });
    return false;
  }
  if (record.count >= limit) return true;
  record.count += 1;
  return false;
}

export type ActionState = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string | undefined>;
};

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return headerList.get('x-forwarded-for') ?? '127.0.0.1';
}

export async function submitEmailContactAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp();
  if (checkRateLimit(ip)) {
    return { success: false, error: 'Too many requests from this IP. Please wait a minute and try again.' };
  }

  const raw = {
    channel: 'email' as const,
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    message: formData.get('message') as string,
    website: formData.get('website') as string,
  };

  const parsed = ContactEmailSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        name: fe.name?.[0],
        email: fe.email?.[0],
        message: fe.message?.[0],
      },
    };
  }

  try {
    await submitContact(parsed.data);
    return { success: true, message: 'Thank you. Your inquiry has been sent. We will reply to your email shortly.' };
  } catch (err) {
    console.error('[contact-action] email submit failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit. Please try again.' };
  }
}

export async function submitWhatsAppContactAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp();
  if (checkRateLimit(ip)) {
    return { success: false, error: 'Too many requests from this IP. Please wait a minute and try again.' };
  }

  const raw = {
    channel: 'whatsapp' as const,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    message: formData.get('message') as string,
    website: formData.get('website') as string,
  };

  const parsed = ContactWhatsAppSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        name: fe.name?.[0],
        phone: fe.phone?.[0],
        message: fe.message?.[0],
      },
    };
  }

  try {
    await submitContact(parsed.data);
    return { success: true, message: 'Thank you. We received your WhatsApp number and will reach out to you shortly.' };
  } catch (err) {
    console.error('[contact-action] whatsapp submit failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit. Please try again.' };
  }
}
