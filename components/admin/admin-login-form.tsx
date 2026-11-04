"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import {
  loginAdminAction,
  type AuthActionState,
} from "@/app/actions/auth";

const initial: AuthActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Signing in…
        </>
      ) : (
        <>
          <LockKeyhole className="size-4" />
          Sign in to dashboard
        </>
      )}
    </button>
  );
}

export function AdminLoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAdminAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <div>
        <label htmlFor="admin-email" className="field-label">
          Email address
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          placeholder="admin@example.com"
        />
        {state.errors?.email ? (
          <p className="field-error">{state.errors.email}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="admin-password" className="field-label">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          placeholder="••••••••"
        />
        {state.errors?.password ? (
          <p className="field-error">{state.errors.password}</p>
        ) : null}
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] leading-5 text-rose-700"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton />

      <p className="pt-2 text-center text-[10px] text-chocolate/35">
        Staff access only. Need help?{" "}
        <Link href="/contact" className="font-semibold text-chocolate/55 underline">
          Contact the site owner
        </Link>
        .
      </p>
      <p className="text-center text-[10px] text-chocolate/30">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-chocolate">
          Return to website
          <ArrowRight className="size-3" />
        </Link>
      </p>
    </form>
  );
}
