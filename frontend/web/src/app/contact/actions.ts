'use server';

import { submitContact } from '@mw/backend';
import { ContactSchema } from '@mw/types';
import { headers } from 'next/headers';

// Simple in-memory rate-limiting map
const rateLimitCache = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 5; // Allow max 5 submissions
  const windowMs = 60 * 1000; // Per 1 minute window

  const record = rateLimitCache.get(ip);
  if (!record) {
    rateLimitCache.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (now - record.lastReset > windowMs) {
    rateLimitCache.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}

export type ActionState = {
  success: boolean;
  message?: string;
  error?: string;
  errors?: {
    name?: string;
    email?: string;
    message?: string;
  };
};

export async function submitContactAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  // 1. Rate Limiting check
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || '127.0.0.1';

  if (checkRateLimit(ip)) {
    return {
      success: false,
      error: 'Too many contact requests from this IP. Please wait a minute and try again.',
    };
  }

  // 2. Extract fields
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    message: formData.get('message') as string,
    website: formData.get('website') as string, // Honeypot field
  };

  // 3. Zod validation
  const parsed = ContactSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
      },
    };
  }

  // 4. Save to DB and trigger email notification
  try {
    await submitContact(parsed.data);
    return {
      success: true,
      message: 'Thank you. Your inquiry has been sent successfully.',
    };
  } catch (err: unknown) {
    console.error('[contact-action] Failed to submit contact form:', err);
    const errMsg = err instanceof Error ? err.message : 'Failed to submit contact. Please try again.';
    return {
      success: false,
      error: errMsg,
    };
  }
}
