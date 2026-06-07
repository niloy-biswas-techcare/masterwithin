'use client';

import React, { useActionState, useState } from 'react';
import {
  submitEmailContactAction,
  submitWhatsAppContactAction,
} from './actions';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@mw/ui';

type Tab = 'email' | 'whatsapp';

function HoneypotField() {
  return (
    <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

function SuccessState({ message, onReset }: { message?: string; onReset: () => void }) {
  return (
    <div className="rounded-xl border border-success/30 bg-success/5 p-6 flex gap-3.5" role="alert">
      <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
      <div>
        <h3 className="font-display font-bold text-text text-base">Message Sent</h3>
        <p className="text-xs text-text/75 mt-2 leading-relaxed font-body">
          {message ?? 'Thank you for reaching out. We will get back to you shortly.'}
        </p>
        <button
          onClick={onReset}
          className="mt-4 text-xs font-semibold text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    </div>
  );
}

function ErrorBanner({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 flex gap-3 text-sm text-danger" role="alert">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <span>{error}</span>
    </div>
  );
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="text-xs text-danger font-medium mt-1" role="alert" aria-live="polite">
      {msg}
    </p>
  );
}

function EmailForm() {
  const [state, formAction, isPending] = useActionState(submitEmailContactAction, null);

  if (state?.success) {
    return <SuccessState message={state.message} onReset={() => window.location.reload()} />;
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <HoneypotField />
      <input type="hidden" name="channel" value="email" />

      {state?.error && <ErrorBanner error={state.error} />}

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email-name" className="text-sm font-semibold text-text">Name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
          <input
            type="text" id="email-name" name="name" required
            aria-describedby={state?.errors?.name ? 'email-name-error' : undefined}
            aria-invalid={state?.errors?.name ? 'true' : undefined}
            className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${state?.errors?.name ? 'border-danger/80' : 'border-border/60 focus:border-primary'}`}
            placeholder="Your name"
            disabled={isPending}
          />
        </div>
        <FieldError id="email-name-error" msg={state?.errors?.name} />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email-addr" className="text-sm font-semibold text-text">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
          <input
            type="email" id="email-addr" name="email" required
            aria-describedby={state?.errors?.email ? 'email-addr-error' : undefined}
            aria-invalid={state?.errors?.email ? 'true' : undefined}
            className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${state?.errors?.email ? 'border-danger/80' : 'border-border/60 focus:border-primary'}`}
            placeholder="your.email@example.com"
            disabled={isPending}
          />
        </div>
        <FieldError id="email-addr-error" msg={state?.errors?.email} />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email-msg" className="text-sm font-semibold text-text">Message</label>
        <div className="relative">
          <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
          <textarea
            id="email-msg" name="message" required rows={5}
            aria-describedby={state?.errors?.message ? 'email-msg-error' : undefined}
            aria-invalid={state?.errors?.message ? 'true' : undefined}
            className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${state?.errors?.message ? 'border-danger/80' : 'border-border/60 focus:border-primary'}`}
            placeholder="How can we assist you?"
            disabled={isPending}
          />
        </div>
        <FieldError id="email-msg-error" msg={state?.errors?.message} />
      </div>

      <Button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 py-3">
        {isPending ? (
          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Sending…</>
        ) : (
          <><Send className="h-4 w-4" /> Send your message</>
        )}
      </Button>
    </form>
  );
}

function WhatsAppForm({ businessWaNumber }: { businessWaNumber: string }) {
  const [state, formAction, isPending] = useActionState(submitWhatsAppContactAction, null);

  if (state?.success) {
    return <SuccessState message={state.message} onReset={() => window.location.reload()} />;
  }

  const chatUrl = businessWaNumber
    ? `https://wa.me/${businessWaNumber.replace(/\D/g, '')}?text=Hi%2C+I%27d+like+to+get+in+touch+with+Master+Within.`
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Direct chat shortcut */}
      {chatUrl && (
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#25D366] bg-[#25D366]/5 py-3.5 px-5 text-sm font-semibold text-[#128C7E] hover:bg-[#25D366]/10 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25D366]" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat directly on WhatsApp
          <ExternalLink className="h-3.5 w-3.5 opacity-60" />
        </a>
      )}

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border/40" />
        <span className="text-xs text-text/40 font-medium">or leave your details</span>
        <div className="flex-1 border-t border-border/40" />
      </div>

      <form action={formAction} className="flex flex-col gap-6" noValidate>
        <HoneypotField />
        <input type="hidden" name="channel" value="whatsapp" />

        {state?.error && <ErrorBanner error={state.error} />}

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wa-name" className="text-sm font-semibold text-text">Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
            <input
              type="text" id="wa-name" name="name" required
              aria-describedby={state?.errors?.name ? 'wa-name-error' : undefined}
              aria-invalid={state?.errors?.name ? 'true' : undefined}
              className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${state?.errors?.name ? 'border-danger/80' : 'border-border/60 focus:border-primary'}`}
              placeholder="Your name"
              disabled={isPending}
            />
          </div>
          <FieldError id="wa-name-error" msg={state?.errors?.name} />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wa-phone" className="text-sm font-semibold text-text">
            WhatsApp Number
            <span className="ml-2 text-xs font-normal text-text/50">international format, no + or spaces</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
            <input
              type="tel" id="wa-phone" name="phone" required
              aria-describedby={state?.errors?.phone ? 'wa-phone-error' : undefined}
              aria-invalid={state?.errors?.phone ? 'true' : undefined}
              className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${state?.errors?.phone ? 'border-danger/80' : 'border-border/60 focus:border-primary'}`}
              placeholder="919876543210"
              disabled={isPending}
            />
          </div>
          <FieldError id="wa-phone-error" msg={state?.errors?.phone} />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wa-msg" className="text-sm font-semibold text-text">Message</label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
            <textarea
              id="wa-msg" name="message" required rows={5}
              aria-describedby={state?.errors?.message ? 'wa-msg-error' : undefined}
              aria-invalid={state?.errors?.message ? 'true' : undefined}
              className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${state?.errors?.message ? 'border-danger/80' : 'border-border/60 focus:border-primary'}`}
              placeholder="How can we assist you?"
              disabled={isPending}
            />
          </div>
          <FieldError id="wa-msg-error" msg={state?.errors?.message} />
        </div>

        <Button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 py-3">
          {isPending ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Sending…</>
          ) : (
            <><Send className="h-4 w-4" /> Submit inquiry</>
          )}
        </Button>

        <p className="text-center text-xs text-text/50 leading-relaxed">
          We'll reach back to you on WhatsApp at the number you provide above.
        </p>
      </form>
    </div>
  );
}

export function ContactPageClient({ waNumber }: { waNumber: string }) {
  const [tab, setTab] = useState<Tab>('email');

  return (
    <div className="mx-auto max-w-xl px-5 sm:px-8 lg:px-10 py-16 md:py-24 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
          Inquiry
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text">Get in Touch</h1>
        <p className="mt-4 text-text/70 leading-relaxed font-body">
          Have questions about the curriculum, books, or custom research? Reach Souvik Ghosh directly via email or WhatsApp.
        </p>
      </div>

      {/* Channel Tabs */}
      <div className="flex rounded-lg border border-border bg-bg p-1 gap-1" role="tablist" aria-label="Contact channel">
        <button
          role="tab"
          aria-selected={tab === 'email'}
          onClick={() => setTab('email')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-colors ${
            tab === 'email'
              ? 'bg-surface text-text shadow-sm'
              : 'text-text/60 hover:text-text'
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          role="tab"
          aria-selected={tab === 'whatsapp'}
          onClick={() => setTab('whatsapp')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-colors ${
            tab === 'whatsapp'
              ? 'bg-surface text-text shadow-sm'
              : 'text-text/60 hover:text-text'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </button>
      </div>

      {/* Tab content */}
      {tab === 'email' ? (
        <EmailForm />
      ) : (
        <WhatsAppForm businessWaNumber={waNumber} />
      )}
    </div>
  );
}
