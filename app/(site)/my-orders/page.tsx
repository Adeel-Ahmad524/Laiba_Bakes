import Link from "next/link";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { MyOrdersClient } from "@/components/site/my-orders-client";
import { PageHero } from "@/components/site/page-hero";
import { getSettings } from "@/lib/data";
import { buildWhatsAppLink } from "@/lib/constants";

export const metadata = {
  title: "My Orders",
  description:
    "Securely check your Laiba Bakes order status using your order ID and phone number.",
};

export default async function MyOrdersPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Order status"
        title={
          <>
            Where&apos;s my cake?
            <br />
            <em className="font-normal text-gold-500">Let&apos;s check.</em>
          </>
        }
        description="Use the order ID from your confirmation page to see your order progress, payment status and details."
        breadcrumb="My Orders"
        compact
      />

      <section className="py-12 lg:py-16">
        <div className="container-luxe">
          <MyOrdersClient whatsapp={settings.whatsapp} />
        </div>
      </section>

      <section className="border-t border-chocolate/10 bg-cream-100 py-10">
        <div className="container-luxe flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-500" />
            <div>
              <p className="text-sm font-semibold text-chocolate">
                Lost your order ID?
              </p>
              <p className="mt-0.5 text-[12px] text-chocolate/50">
                Message us on WhatsApp with the name and phone number used to
                order, and we&apos;ll help.
              </p>
            </div>
          </div>
          <a
            href={buildWhatsAppLink(
              settings.whatsapp,
              "Assalam-o-Alaikum! I need help finding my order ID.",
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp shrink-0"
          >
            <MessageCircle className="size-4" />
            WhatsApp us
          </a>
        </div>
      </section>
    </>
  );
}
