import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getSettings } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { buildWhatsAppLink } from "@/lib/constants";
import { displayPhone } from "@/lib/utils";

export const metadata = {
  title: "Contact Us",
  description:
    "Contact Laiba Bakes in Dera Ismail Khan. Call, WhatsApp, email or send us a message. Find our address and opening hours.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const mapUrl =
    settings.map_embed_url ||
    "https://www.google.com/maps?q=10+Civil+Lines,+Near+Police+Lines,+Dera+Ismail+Khan,+Pakistan&output=embed";

  return (
    <>
      <PageHero
        eyebrow="Let's talk cake"
        title={
          <>
            We&apos;d love to
            <br />
            <em className="font-normal text-gold-500">hear from you.</em>
          </>
        }
        description="Planning a celebration, chasing an order, or simply craving something sweet? Call, message or send us a note below."
        breadcrumb="Contact Us"
        compact
      />

      <section className="py-14 lg:py-20">
        <div className="container-luxe">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                label: "Visit us",
                value: settings.address,
                href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`,
                external: true,
                action: "Open in maps",
              },
              {
                icon: Phone,
                label: "Call us",
                value: displayPhone(settings.phone),
                href: `tel:${settings.phone.replace(/[^\d+]/g, "")}`,
                action: "Click to call",
              },
              {
                icon: MessageCircle,
                label: "WhatsApp",
                value: displayPhone(settings.whatsapp),
                href: buildWhatsAppLink(settings.whatsapp),
                external: true,
                action: "Start a chat",
              },
              {
                icon: Mail,
                label: "Email us",
                value: settings.email,
                href: `mailto:${settings.email}`,
                action: "Write an email",
              },
            ].map((card, index) => (
              <Reveal key={card.label} delay={index * 60}>
                <a
                  href={card.href}
                  target={card.external ? "_blank" : undefined}
                  rel={card.external ? "noreferrer" : undefined}
                  className="group flex h-full flex-col rounded-[1.5rem] border border-chocolate/10 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-cream-100">
                    <card.icon className="size-[18px] text-gold-500" />
                  </span>
                  <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/35">
                    {card.label}
                  </p>
                  <p className="mt-1.5 flex-1 text-[13px] font-semibold leading-5 text-chocolate">
                    {card.value}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold-500">
                    {card.action}
                    <ArrowUpRight className="size-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <Reveal>
              <div className="rounded-[2rem] border border-chocolate/10 bg-cream-100 p-6 sm:p-8">
                <span className="eyebrow">Opening hours</span>
                <h2 className="mt-3 font-display text-3xl text-chocolate">
                  Pop in for a treat.
                </h2>
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4">
                  <Clock3 className="size-5 text-gold-500" />
                  <div>
                    <p className="text-sm font-semibold text-chocolate">
                      {settings.opening_hours || "Daily, 10:00 AM – 10:00 PM"}
                    </p>
                    <p className="text-[10px] text-chocolate/40">
                      Custom cake consultations by message
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-chocolate/10 bg-white">
                  <iframe
                    src={mapUrl}
                    title={`${settings.business_name} location map`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="mt-3 text-[11px] leading-5 text-chocolate/45">
                  {settings.address}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={buildWhatsAppLink(settings.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp flex-1"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </a>
                  <Link href="/custom-cakes" className="btn-outline flex-1">
                    Custom cake
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="rounded-[2rem] border border-chocolate/10 bg-white p-6 shadow-card sm:p-8">
                <span className="eyebrow">Send a message</span>
                <h2 className="mt-3 font-display text-3xl text-chocolate">
                  How can we help?
                </h2>
                <p className="mt-2 text-[13px] text-chocolate/50">
                  Fill in the form and our team will get back to you as soon as we
                  can. For urgent orders, please call or WhatsApp.
                </p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
