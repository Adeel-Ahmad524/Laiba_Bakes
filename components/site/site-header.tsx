"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Phone,
  ShoppingBag,
  X,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "./cart-provider";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface HeaderProps {
  businessName: string;
  phone: string;
  announcement: string | null;
  address: string;
}

export function SiteHeader({
  businessName,
  phone,
  announcement,
  address,
}: HeaderProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="relative z-50 hidden bg-chocolate-900 text-cream-100 lg:block">
        <div className="container-luxe flex h-9 items-center justify-between text-[11px] tracking-wide">
          <p className="flex items-center gap-2 text-cream-100/70">
            <MapPin className="size-3 text-gold-300" />
            {address}
          </p>
          <div className="flex items-center gap-6">
            <p className="text-cream-100/60">{announcement}</p>
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-1.5 font-semibold text-gold-200 transition hover:text-gold-100"
            >
              <Phone className="size-3" />
              {phone}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "border-chocolate/10 bg-cream-50/95 shadow-[0_8px_30px_-20px_rgba(73,53,45,0.4)] backdrop-blur-xl"
            : "border-transparent bg-cream-50/85 backdrop-blur-md",
        )}
      >
        <div className="container-luxe flex h-[74px] items-center justify-between gap-4">
          <Logo name={businessName} />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative whitespace-nowrap py-2 text-[12.5px] font-semibold tracking-wide transition-colors",
                    active
                      ? "text-chocolate"
                      : "text-chocolate/60 hover:text-chocolate",
                  )}
                >
                  {link.label}
                  {active ? (
                    <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-4 rounded-full bg-gold-400" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/order"
              className="relative flex size-11 items-center justify-center rounded-full border border-chocolate/10 bg-white text-chocolate transition hover:border-gold-300 hover:bg-cream-100"
              aria-label={`Basket with ${itemCount} items`}
            >
              <ShoppingBag className="size-[18px]" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-chocolate text-[10px] font-bold text-cream-50">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/order"
              className="hidden rounded-full bg-chocolate px-6 py-3 text-xs font-bold tracking-wide text-cream-50 shadow-soft transition hover:-translate-y-0.5 hover:bg-chocolate-900 sm:inline-flex"
            >
              Order now
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex size-11 items-center justify-center rounded-full border border-chocolate/10 bg-white text-chocolate lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[70] transition lg:hidden",
          open ? "visible" : "invisible",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-chocolate-900/45 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(88vw,390px)] flex-col bg-cream-50 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-chocolate/10 px-6 py-5">
            <Logo name={businessName} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-10 items-center justify-center rounded-full border border-chocolate/10 bg-white"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between border-b border-chocolate/5 px-3 py-4 font-display text-[1.35rem] transition",
                    active ? "text-gold-500" : "text-chocolate hover:text-gold-500",
                  )}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="size-4 text-chocolate/30" />
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-chocolate/10 bg-cream-100 p-6">
            <Link
              href="/order"
              onClick={() => setOpen(false)}
              className="btn-primary w-full"
            >
              <ShoppingBag className="size-4" />
              Start your order {itemCount > 0 ? `(${itemCount})` : ""}
            </Link>
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-chocolate/60"
            >
              <Phone className="size-3.5 text-gold-500" />
              Call {phone}
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
