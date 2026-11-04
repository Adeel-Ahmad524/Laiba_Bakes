"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
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
      className="inline-flex items-center gap-2 rounded-full border border-dashed border-gold-400 bg-gold-100/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-chocolate transition hover:bg-gold-100"
      aria-label={`Copy coupon code ${code}`}
    >
      {copied ? <Check className="size-3.5 text-green-700" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : code}
    </button>
  );
}
