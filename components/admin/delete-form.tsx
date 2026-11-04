"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function DeleteButton({
  label,
  compact,
}: {
  label: string;
  compact?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60",
        compact
          ? "size-8"
          : "px-3.5 py-2 text-[10px] uppercase tracking-wider",
      )}
      aria-label={label}
      title={label}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
      {compact ? null : pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteForm({
  id,
  action,
  label = "Delete",
  confirmMessage = "Delete this record? This cannot be undone.",
  compact = false,
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
  compact?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteButton label={label} compact={compact} />
    </form>
  );
}
