"use client";

import { OrderLookupForm } from "./order-lookup-form";
import { buildWhatsAppLink } from "@/lib/constants";

export function MyOrdersClient({ whatsapp }: { whatsapp: string }) {
  return (
    <>
      <OrderLookupForm />
      <p className="mt-6 text-center text-[11px] text-chocolate/35">
        Need help?{" "}
        <a
          href={buildWhatsAppLink(whatsapp, "Assalam-o-Alaikum! I need help tracking my order.")}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-chocolate/55 underline decoration-gold-300 underline-offset-4 hover:text-chocolate"
        >
          Message the bakery on WhatsApp
        </a>
      </p>
    </>
  );
}
