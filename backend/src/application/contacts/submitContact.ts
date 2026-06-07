import { env } from '../../env';
import type { ContactRepository, Contact } from '../../domain';
import { ValidationError } from '../errors';
import { ContactSchema } from '@mw/types';
import type { ContactInput } from '@mw/types';

export type EmailSender = (contact: {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  channel: 'email' | 'whatsapp';
}) => Promise<void>;

export type SubmitContact = (input: ContactInput) => Promise<Contact>;

async function sendNotificationEmail(contact: {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  channel: 'email' | 'whatsapp';
}): Promise<void> {
  if (process.env.NODE_ENV === 'test' || !env.RESEND_API_KEY) {
    return;
  }

  const isWhatsApp = contact.channel === 'whatsapp';
  const contactLine = isWhatsApp
    ? `<p><strong>WhatsApp:</strong> ${contact.phone}</p>`
    : `<p><strong>Email:</strong> ${contact.email}</p>`;

  const channelBadge = isWhatsApp
    ? `<span style="background:#25D366;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">WhatsApp</span>`
    : `<span style="background:#2563EB;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">Email</span>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Master Within Website <website@masterwithin.org>',
        to: [env.ADMIN_BOOTSTRAP_EMAIL],
        subject: `[${isWhatsApp ? 'WhatsApp' : 'Email'}] New contact from ${contact.name}`,
        html: `
          <p>${channelBadge} You have a new contact submission:</p>
          <p><strong>Name:</strong> ${contact.name}</p>
          ${contactLine}
          <p><strong>Message:</strong></p>
          <blockquote style="border-left:4px solid #ccc;padding-left:10px;margin-left:0;">
            ${contact.message.replace(/\n/g, '<br/>')}
          </blockquote>
          ${isWhatsApp ? `<p><a href="https://wa.me/${contact.phone?.replace(/\D/g, '')}?text=Hi+${encodeURIComponent(contact.name)}%2C+thank+you+for+reaching+out+to+Master+Within." style="background:#25D366;color:#fff;padding:8px 16px;border-radius:4px;text-decoration:none;">Reply on WhatsApp</a></p>` : ''}
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
    // 1. Zod Validation (discriminated union — channel required)
    const parsed = ContactSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError('Invalid contact submission', parsed.error.flatten().fieldErrors);
    }

    // 2. Honeypot Anti-Spam Check 🔒
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      console.warn('[backend] Spam submission blocked via honeypot field');
      throw new ValidationError('Spam detected');
    }

    const { channel, name, website: _hp, ...rest } = parsed.data;

    const email = 'email' in rest ? rest.email : undefined;
    const phone = 'phone' in rest ? rest.phone : undefined;
    const { message } = rest;

    // 3. Save to Repository
    const saved = await contacts.create({ name, email, phone, message, channel });

    // 4. Send notification email to admin
    await sendEmail({ name, email, phone, message, channel });

    return saved;
  };
}
