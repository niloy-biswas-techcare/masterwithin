import { z } from 'zod';

export const ContactEmailSchema = z.object({
  channel: z.literal('email'),
  name: z.string().min(1, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(1, 'Please enter a message.'),
  /** Honeypot: must stay empty. */
  website: z.string().max(0).optional(),
});

export const ContactWhatsAppSchema = z.object({
  channel: z.literal('whatsapp'),
  name: z.string().min(1, 'Please enter your name.'),
  phone: z
    .string()
    .min(7, 'Please enter a valid WhatsApp number (7–15 digits, no spaces).')
    .max(15, 'Phone number too long.'),
  message: z.string().min(1, 'Please enter a message.'),
  /** Honeypot: must stay empty. */
  website: z.string().max(0).optional(),
});

/** Unified submission schema — discriminated on `channel`. */
export const ContactSchema = z.discriminatedUnion('channel', [
  ContactEmailSchema,
  ContactWhatsAppSchema,
]);

export type ContactEmailInput = z.infer<typeof ContactEmailSchema>;
export type ContactWhatsAppInput = z.infer<typeof ContactWhatsAppSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type ContactChannel = 'email' | 'whatsapp';
export type ContactStatus = 'unread' | 'read' | 'replied' | 'forwarded';

/** A persisted contact record. */
export const ContactSchemaRecord = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string(),
  channel: z.enum(['email', 'whatsapp']).default('email'),
  status: z.enum(['unread', 'read', 'replied', 'forwarded']).default('unread'),
  repliedAt: z.string().optional(),
  createdAt: z.string(), // ISO
});

export type Contact = z.infer<typeof ContactSchemaRecord>;
