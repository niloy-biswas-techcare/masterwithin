'use client';

import React, { useActionState } from 'react';
import { submitContactAction } from './actions';
import { Mail, User, MessageSquare, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@mw/ui';

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactAction, null);

  return (
    <div className="mx-auto max-w-xl px-6 py-16 md:py-24 flex flex-col gap-10">
      {/* Header */}
      <div className="text-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
          Inquiry
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text">
          Get in Touch
        </h1>
        <p className="mt-4 text-text/70 leading-relaxed font-body">
          Have questions about the curriculum, books, or custom research? Complete the form below to contact Souvik Ghosh directly.
        </p>
      </div>

      {/* Action States feedback */}
      {state?.success ? (
        <div className="rounded-xl border border-success/30 bg-success/5 p-6 flex gap-3.5" role="alert">
          <CheckCircle2 className="h-6 w-6 text-success shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-text text-base">Message Sent</h3>
            <p className="text-xs text-text/75 mt-2 leading-relaxed font-body">
              {state.message || 'Thank you for reaching out. We will get back to you shortly.'}
            </p>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Send another message
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-6" noValidate>
          
          {/* Honeypot Spam Prevention field (§18) 🔒 */}
          <div className="absolute -left-2499.75 -top-2499.75 opacity-0 pointer-events-none" aria-hidden="true">
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Global Form Error (e.g. rate-limit or database failure) */}
          {state?.error && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 flex gap-3 text-sm text-danger" role="alert">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-text">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
              <input
                type="text"
                id="name"
                name="name"
                required
                aria-required="true"
                aria-describedby={state?.errors?.name ? 'name-error' : undefined}
                aria-invalid={state?.errors?.name ? 'true' : undefined}
                className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                  state?.errors?.name
                    ? 'border-danger/80 focus:border-danger'
                    : 'border-border/60 focus:border-primary'
                }`}
                placeholder="Your name"
                disabled={isPending}
              />
            </div>
            {state?.errors?.name && (
              <p id="name-error" className="text-xs text-danger font-medium mt-1" role="alert" aria-live="polite">
                {state.errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-text">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
              <input
                type="email"
                id="email"
                name="email"
                required
                aria-required="true"
                aria-describedby={state?.errors?.email ? 'email-error' : undefined}
                aria-invalid={state?.errors?.email ? 'true' : undefined}
                className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                  state?.errors?.email
                    ? 'border-danger/80 focus:border-danger'
                    : 'border-border/60 focus:border-primary'
                }`}
                placeholder="your.email@example.com"
                disabled={isPending}
              />
            </div>
            {state?.errors?.email && (
              <p id="email-error" className="text-xs text-danger font-medium mt-1" role="alert" aria-live="polite">
                {state.errors.email}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-semibold text-text">
              Message
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-text/40" aria-hidden="true" />
              <textarea
                id="message"
                name="message"
                required
                aria-required="true"
                aria-describedby={state?.errors?.message ? 'message-error' : undefined}
                aria-invalid={state?.errors?.message ? 'true' : undefined}
                rows={5}
                className={`w-full rounded-lg border bg-surface pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary ${
                  state?.errors?.message
                    ? 'border-danger/80 focus:border-danger'
                    : 'border-border/60 focus:border-primary'
                }`}
                placeholder="How can we assist you?"
                disabled={isPending}
              />
            </div>
            {state?.errors?.message && (
              <p id="message-error" className="text-xs text-danger font-medium mt-1" role="alert" aria-live="polite">
                {state.errors.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div className="mt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3"
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending your message…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send your message
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
