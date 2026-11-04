"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/constants";

export function WhatsAppFloat({ phone }: { phone: string }) {
  return (
    <a
      href={buildWhatsAppLink(phone)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Laiba Bakes on WhatsApp"
      className="group fixed bottom-5 right-5 z-[60] flex items-center gap-0 rounded-full bg-[#1f9d55] p-3.5 text-white shadow-[0_14px_40px_-10px_rgba(31,157,85,0.7)] transition-all duration-300 hover:gap-2 hover:pr-5 sm:bottom-7 sm:right-7"
    >
      <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-[#1f9d55]/40" />
      <MessageCircle className="size-6 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[9rem]">
        Chat with us
      </span>
    </a>
  );
}
