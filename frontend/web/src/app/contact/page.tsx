import { env } from '@/lib/env';
import { ContactPageClient } from './ContactPageClient';

export default function ContactPage() {
  const waNumber = env.WHATSAPP_NUMBER ?? '';
  return <ContactPageClient waNumber={waNumber} />;
}
