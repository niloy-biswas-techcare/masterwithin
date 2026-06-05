import { z } from 'zod';

/**
 * Contact submission (§7.9). Validated by the contact server action before being
 * persisted via the `contacts` use-case and emailed via Resend. The `website` field
 * is a honeypot — it must be empty for a human (§18); bots that fill it are rejected.
 */
export const ContactSchema = z.object({
  name: z.string().min(1, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(1, 'Please enter a message.'),
  /** Honeypot: must stay empty. */
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

/** A persisted contact record (§16). */
export const ContactSchemaRecord = ContactSchema.omit({ website: true }).extend({
  id: z.string(),
  createdAt: z.string(), // ISO
});

export type Contact = z.infer<typeof ContactSchemaRecord>;
