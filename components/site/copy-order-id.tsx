"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyOrderId({
  value,
  label = "Copy ID",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-chocolate/10 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-chocolate/55 transition hover:border-gold-300 hover:text-chocolate",
        className,
      )}
      aria-label={`Copy order ID ${value}`}
    >
      {copied ? (
        <Check className="size-3.5 text-green-700" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
