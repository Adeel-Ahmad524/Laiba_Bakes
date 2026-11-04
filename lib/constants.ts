import type { BusinessSettings, OrderStatus } from "./types";

export const ORDER_STATUSES: Array<{
  value: OrderStatus;
  label: string;
  description: string;
  tone: string;
}> = [
  {
    value: "new",
    label: "New",
    description: "Your order has been received and is awaiting confirmation.",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    description: "The bakery has confirmed your order.",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "preparing",
    label: "Preparing",
    description: "Your cake is being freshly prepared.",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "ready_for_pickup",
    label: "Ready for Pickup",
    description: "Your order is ready to collect from the bakery.",
    tone: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your order is on its way.",
    tone: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    value: "delivered",
    label: "Delivered",
    description: "Your order has been delivered. Thank you!",
    tone: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "This order was cancelled.",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
  },
];

export const STATUS_PROGRESS: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
];

export function statusLabel(status: OrderStatus) {
  return ORDER_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function statusTone(status: OrderStatus) {
  return (
    ORDER_STATUSES.find((item) => item.value === status)?.tone ??
    "bg-stone-50 text-stone-700 border-stone-200"
  );
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/cakes", label: "Our Cakes" },
  { href: "/categories", label: "Cake Categories" },
  { href: "/deals", label: "Special Deals" },
  { href: "/custom-cakes", label: "Custom Cake Orders" },
  { href: "/about", label: "About Us" },
  { href: "/my-orders", label: "My Orders" },
  { href: "/contact", label: "Contact Us" },
] as const;

export const DEFAULT_WHATSAPP = "0300-5477201";

export const BUSINESS = {
  name: "Laiba Bakes",
  address: "10 Civil Lines, Near Police Lines, Dera Ismail Khan, Pakistan",
  phone: "0300-5477201",
  whatsapp: "0300-5477201",
  email: "gullaiba049@gmail.com",
};

export function buildWhatsAppLink(
  phone: string,
  message = "Assalam-o-Alaikum Laiba Bakes! I would like to place an order.",
) {
  const digits = String(phone).replace(/\D/g, "");
  const international = digits.startsWith("92")
    ? digits
    : digits.startsWith("0")
      ? `92${digits.slice(1)}`
      : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

export function settingsWithFallback(
  settings: BusinessSettings | null,
): BusinessSettings {
  return (
    settings ?? {
      id: "fallback",
      business_name: BUSINESS.name,
      tagline: "Baked with love, made for your moments.",
      address: BUSINESS.address,
      phone: BUSINESS.phone,
      whatsapp: BUSINESS.whatsapp,
      email: BUSINESS.email,
      delivery_charge: 200,
      free_delivery_threshold: 5000,
      minimum_order: 500,
      profit_per_pound: 100,
      payment_methods: ["Cash on delivery", "Cash on pickup", "Bank transfer"],
      opening_hours: "Daily, 10:00 AM – 10:00 PM",
      announcement:
        "Freshly baked daily in Dera Ismail Khan · Custom cakes available 48 hours in advance",
      map_embed_url:
        "https://www.google.com/maps?q=10+Civil+Lines,+Near+Police+Lines,+Dera+Ismail+Khan,+Pakistan&output=embed",
      instagram_url: null,
      facebook_url: null,
    }
  );
}
