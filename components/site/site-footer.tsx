import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import type { PublicBusinessSettings } from "@/lib/types";
import { NAV_LINKS } from "@/lib/constants";
import { displayPhone } from "@/lib/utils";

export function SiteFooter({ settings }: { settings: PublicBusinessSettings }) {
  return (
    <footer className="relative overflow-hidden bg-chocolate-900 text-cream-100">
      <div className="absolute -right-32 -top-40 size-[420px] rounded-full border border-gold-300/10" />
      <div className="absolute -bottom-56 right-10 size-[500px] rounded-full border border-gold-300/10" />

      <div className="container-luxe relative py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr]">
          <div>
            <Logo name={settings.business_name} light />
            <p className="mt-6 max-w-xs text-sm leading-7 text-cream-100/60">
              {settings.tagline ||
                "Baked with love, made for your moments. Cakes and little treats, fresh from our kitchen in Dera Ismail Khan."}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-gold-300/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold-200">
                Freshly baked
              </span>
              <span className="rounded-full border border-gold-300/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold-200">
                Made to order
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.24em] text-gold-200">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream-100/60 transition hover:text-cream-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.24em] text-gold-200">
              Visit & call
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-cream-100/65">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-300" />
                <span>{settings.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-3 transition hover:text-cream-50"
                >
                  <Phone className="size-4 shrink-0 text-gold-300" />
                  {displayPhone(settings.phone)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 break-all transition hover:text-cream-50"
                >
                  <Mail className="size-4 shrink-0 text-gold-300" />
                  {settings.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold-300" />
                <span>{settings.opening_hours || "Open daily, 10am – 10pm"}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.24em] text-gold-200">
              Order & follow
            </h3>
            <p className="mt-5 text-sm leading-6 text-cream-100/60">
              Planning something special? Tell us your idea and we&apos;ll bake it
              to life.
            </p>
            <Link
              href="/custom-cakes"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-200 transition hover:text-gold-100"
            >
              Design a custom cake
              <ArrowUpRight className="size-4" />
            </Link>
            <div className="mt-6 flex gap-3">
              {settings.instagram_url ? (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 items-center rounded-full border border-cream-100/15 px-3 text-[10px] font-semibold uppercase tracking-wider text-cream-100/70 transition hover:border-gold-300/40 hover:text-gold-200"
                >
                  Instagram
                </a>
              ) : null}
              {settings.facebook_url ? (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 items-center rounded-full border border-cream-100/15 px-3 text-[10px] font-semibold uppercase tracking-wider text-cream-100/70 transition hover:border-gold-300/40 hover:text-gold-200"
                >
                  Facebook
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream-100/10 pt-7 text-[11px] text-cream-100/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.business_name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <span>Prices in PKR</span>
            <span>Baked fresh in Dera Ismail Khan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
