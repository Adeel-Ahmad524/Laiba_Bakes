"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import {
  submitContactAction,
  type ContactActionState,
} from "@/app/actions/contact";

const initial: ContactActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Sending…
        </>
      ) : (
        <>
          <Send className="size-4" />
          Send message
        </>
      )}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactAction, initial);
  const startedAt = useRef(Date.now());

  if (state.ok) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-green-200 bg-green-50 p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
          <CheckCircle2 className="size-8 text-green-600" />
        </span>
        <h3 className="mt-5 font-display text-3xl text-chocolate">
          Message received
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-chocolate/55">
          {state.message}
        </p>
        <p className="mt-4 text-[11px] text-chocolate/40">
          For urgent orders, WhatsApp is usually fastest.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] size-px opacity-0"
        aria-hidden="true"
      />
      <input type="hidden" name="startedAt" value={startedAt.current} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            className="field"
            placeholder="Your full name"
            required
            minLength={2}
            maxLength={80}
            aria-describedby={state.errors?.name ? "contact-name-error" : undefined}
          />
          {state.errors?.name ? (
            <p id="contact-name-error" className="field-error">
              {state.errors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="field"
            placeholder="you@example.com"
            required
            maxLength={120}
            aria-describedby={state.errors?.email ? "contact-email-error" : undefined}
          />
          {state.errors?.email ? (
            <p id="contact-email-error" className="field-error">
              {state.errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="field-label">
            Phone <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            className="field"
            placeholder="0300-5477207"
            maxLength={20}
            aria-describedby={state.errors?.phone ? "contact-phone-error" : undefined}
          />
          {state.errors?.phone ? (
            <p id="contact-phone-error" className="field-error">
              {state.errors.phone}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-subject" className="field-label">
            Subject
          </label>
          <select id="contact-subject" name="subject" className="field">
            <option>General enquiry</option>
            <option>Custom cake</option>
            <option>Existing order</option>
            <option>Business & collaboration</option>
            <option>Feedback</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="field-label">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="field min-h-36 resize-y"
          placeholder="Tell us how we can help…"
          required
          minLength={10}
          maxLength={3000}
          aria-describedby={state.errors?.message ? "contact-message-error" : undefined}
        />
        {state.errors?.message ? (
          <p id="contact-message-error" className="field-error">
            {state.errors.message}
          </p>
        ) : null}
      </div>

      {!state.ok && state.message ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] leading-5 text-rose-700"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] leading-4 text-chocolate/35">
          By sending this message you agree to be contacted about your enquiry.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
