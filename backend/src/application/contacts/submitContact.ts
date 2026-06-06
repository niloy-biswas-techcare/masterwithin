import { env } from '../../env';
import type { ContactRepository, Contact, ContactInput } from '../../domain';
import { ValidationError } from '../errors';
import { ContactSchema } from '@mw/types';

export type EmailSender = (contact: {
  name: string;
  email: string;
  message: string;
}) => Promise<void>;

export type SubmitContact = (input: ContactInput) => Promise<Contact>;

/**
 * Sends a notification email via Resend's REST API.
 */
async function sendNotificationEmail(contact: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  if (process.env.NODE_ENV === 'test' || !env.RESEND_API_KEY) {
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/body',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Master Within Website <website@masterwithin.org>',
        to: [env.ADMIN_BOOTSTRAP_EMAIL],
        subject: `New Contact Submission from ${contact.name}`,
        html: `
          <p>You have received a new contact submission:</p>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0;">
            ${contact.message.replace(/\n/g, '<br/>')}
          </blockquote>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[backend] Resend notification failed: ${res.status} ${errText}`);
    }
  } catch (err) {
    console.error(`[backend] Failed sending contact notification email:`, err);
  }
}

export function makeSubmitContact(
  contacts: ContactRepository,
  customEmailSender?: EmailSender
): SubmitContact {
  const sendEmail = customEmailSender || sendNotificationEmail;

  return async (input) => {
    // 1. Zod Validation
    const parsed = ContactSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError('Invalid contact submission', parsed.error.flatten().fieldErrors);
    }

    const { name, email, message, website } = parsed.data;

    // 2. Honeypot Anti-Spam Check (§18) 🔒
    if (website && website.trim().length > 0) {
      console.warn('[backend] Spam submission blocked via honeypot field');
      throw new ValidationError('Spam detected');
    }

    // 3. Save to Repository
    const saved = await contacts.create({ name, email, message });

    // 4. Send Email Notification
    await sendEmail({ name, email, message });

    return saved;
  };
}
