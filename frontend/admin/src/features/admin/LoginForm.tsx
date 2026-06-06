"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/session.actions";
import type { LoginActionResult } from "@/app/actions/session.actions";

const initial: LoginActionResult = { ok: false, error: "" };

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<LoginActionResult, FormData>(
    loginAction,
    initial
  );

  useEffect(() => {
    if (state.ok) {
      router.replace("/");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-text mb-1.5"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full h-11 rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          placeholder="ops@masterwithin.org"
          aria-describedby={state.ok === false && state.error ? "login-error" : undefined}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-text mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full h-11 rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        />
      </div>

      {state.ok === false && state.error && (
        <p
          id="login-error"
          role="alert"
          aria-live="assertive"
          className="text-sm text-danger"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
