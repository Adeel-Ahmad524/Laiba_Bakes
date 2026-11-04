"use client";

import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {error ? <p className="field-error">{error}</p> : null}
      {!error && hint ? (
        <p className="mt-1.5 text-[10px] leading-4 text-chocolate/40">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormAlert({
  message,
  ok,
}: {
  message?: string;
  ok?: boolean;
}) {
  if (!message) return null;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-[12px] leading-5",
        ok
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-rose-200 bg-rose-50 text-rose-800",
      )}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}

export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn("btn-primary px-6", className)}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending ? (pendingLabel ?? "Saving…") : label}
    </button>
  );
}

export function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-chocolate/10 bg-cream-50 px-4 py-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded border-chocolate/25 accent-chocolate"
      />
      <span>
        <span className="block text-[12px] font-semibold text-chocolate">{label}</span>
        <span className="mt-0.5 block text-[10px] leading-4 text-chocolate/45">
          {description}
        </span>
      </span>
    </label>
  );
}
