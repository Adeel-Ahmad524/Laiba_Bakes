"use client";

import { markWhatsAppOpened } from "@/app/actions/orders";

/**
 * Opens WhatsApp and quietly records that the customer started a confirmation
 * chat. The order status is never changed here — the bakery confirms manually.
 */
export function WhatsAppConfirmLink({
  token,
  href,
  className,
  children,
}: {
  token: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => {
        void markWhatsAppOpened(token);
      }}
    >
      {children}
    </a>
  );
}
