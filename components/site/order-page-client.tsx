"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { CartItem, CakeSize, Deal, DecorationOption, Product, BusinessSettings } from "@/lib/types";
import {
  placeOrderAction,
  type OrderActionState,
} from "@/app/actions/orders";
import {
  calculateCartTotals,
  calculateDeliveryCharge,
  calculateDiscount,
  calculateLineTotal,
  calculateOrderTotal,
} from "@/lib/pricing";
import { buildWhatsAppLink } from "@/lib/constants";
import { cn, formatPKR, plusDaysISO, todayISO } from "@/lib/utils";
import { useCart } from "./cart-provider";

const initial: OrderActionState = { ok: false };

const TIME_SLOTS = [
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
];

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary w-full py-4"
      disabled={pending || disabled}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Placing your order…
        </>
      ) : (
        <>
          Place order
          <ArrowRight className="size-4" />
        </>
      )}
    </button>
  );
}

function SectionCard({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-chocolate/10 bg-white p-5 shadow-card sm:p-7">
      <div className="flex gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-chocolate font-display text-sm text-cream-50">
          {number}
        </span>
        <div>
          <h2 className="font-display text-2xl leading-tight text-chocolate">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[11px] leading-5 text-chocolate/45">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function OrderPageClient({
  products,
  sizes,
  decorations,
  deals,
  settings,
  presetProductSlug,
  presetPounds,
  initialType,
}: {
  products: Product[];
  sizes: CakeSize[];
  decorations: DecorationOption[];
  deals: Deal[];
  settings: BusinessSettings;
  presetProductSlug?: string;
  presetPounds?: number;
  initialType: "standard" | "custom";
}) {
  const {
    items,
    hydrated,
    addItem,
    removeItem,
    updateQuantity,
    totals: cartTotals,
  } = useCart();
  const [state, formAction] = useActionState(placeOrderAction, initial);
  const seeded = useRef(false);

  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [decorationId, setDecorationId] = useState(decorations[0]?.id ?? "");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [orderType] = useState<"standard" | "custom">(initialType);
  const startedAt = useRef(Date.now());

  const today = todayISO();
  const defaultDate = plusDaysISO(2);

  useEffect(() => {
    if (!hydrated || seeded.current) return;
    seeded.current = true;

    if (presetProductSlug) {
      const product = products.find((item) => item.slug === presetProductSlug);
      if (product) {
        const pounds = product.pricing_type === "per_pound" ? presetPounds ?? sizes[0]?.pounds ?? 1 : null;
        const key = product.pricing_type === "per_pound" ? `${product.id}:${pounds}` : product.id;
        if (!items.some((item) => item.key === key)) {
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image_url,
            pricingType: product.pricing_type,
            unitPrice: product.price,
            pounds,
            quantity: 1,
          });
        }
      }
    }

    try {
      const draftRaw = sessionStorage.getItem("laiba-bakes-custom-draft");
      if (draftRaw) {
        const draft = JSON.parse(draftRaw) as {
          decorationId?: string;
          cakeColour?: string;
          cakeMessage?: string;
          designDescription?: string;
        };
        if (draft.decorationId) setDecorationId(draft.decorationId);
        const colourInput = document.getElementById("cakeColour") as HTMLInputElement | null;
        const messageInput = document.getElementById("cakeMessage") as HTMLInputElement | null;
        const designInput = document.getElementById("designDescription") as HTMLTextAreaElement | null;
        if (colourInput && draft.cakeColour) colourInput.value = draft.cakeColour;
        if (messageInput && draft.cakeMessage) messageInput.value = draft.cakeMessage;
        if (designInput && draft.designDescription) designInput.value = draft.designDescription;
      }
    } catch {
      // Ignore unavailable storage.
    }
  }, [hydrated, presetProductSlug, presetPounds, products, sizes, items, addItem]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const decoration =
    decorations.find((option) => option.id === decorationId) ?? decorations[0] ?? null;
  const decorationCharge = decoration?.charge ?? 0;
  const goodsTotal = cartTotals.subtotal;
  const deliveryCharge = calculateDeliveryCharge({
    deliveryType,
    goodsTotal,
    deliveryCharge: settings.delivery_charge,
    freeDeliveryThreshold: settings.free_delivery_threshold,
  });

  const appliedDeal = useMemo(
    () =>
      appliedCode
        ? deals.find(
            (deal) =>
              deal.code?.toUpperCase() === appliedCode.toUpperCase() &&
              (!deal.minimum_order || goodsTotal >= deal.minimum_order),
          ) ?? null
        : null,
    [appliedCode, deals, goodsTotal],
  );

  const discount = appliedDeal
    ? calculateDiscount({
        goodsTotal,
        discountType: appliedDeal.discount_type,
        discountValue: appliedDeal.discount_value,
        minimumOrder: appliedDeal.minimum_order,
      })
    : 0;

  const total = calculateOrderTotal({
    cakeSubtotal: cartTotals.cakeSubtotal,
    additionalTotal: cartTotals.additionalTotal,
    decorationCharge,
    deliveryCharge,
    discount,
  });

  const belowMinimum = goodsTotal < settings.minimum_order;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code first.");
      setAppliedCode("");
      return;
    }
    const deal = deals.find(
      (entry) => entry.code?.toUpperCase() === code && entry.is_active,
    );
    if (!deal) {
      setCouponError("That code is not valid.");
      setAppliedCode("");
      return;
    }
    if (deal.minimum_order > goodsTotal) {
      setCouponError(
        `This code needs a minimum order of ${formatPKR(deal.minimum_order)}.`,
      );
      setAppliedCode("");
      return;
    }
    setAppliedCode(code);
    setCouponError("");
    toast.success(`${code} applied`);
  };

  const addQuickItem = (product: Product) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image_url,
      pricingType: product.pricing_type,
      unitPrice: product.price,
      pounds:
        product.pricing_type === "per_pound" ? sizes[0]?.pounds ?? 1 : null,
      quantity: 1,
    });
    toast.success(`${product.name} added`);
  };

  const handleFile = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setSelectedFileName("");
      setPreviewUrl(null);
      return;
    }
    setSelectedFileName(file.name);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const whatsappDesignMessage = useMemo(() => {
    const names = items.map((item) => {
      if (item.pricingType === "per_pound") {
        return `${item.name} (${item.pounds} lb × ${item.quantity})`;
      }
      return `${item.name} (× ${item.quantity})`;
    });
    return [
      `Assalam-o-Alaikum Laiba Bakes! I'm placing a ${orderType} cake order.`,
      names.length ? `Items: ${names.join(", ")}` : "",
      decoration ? `Decoration: ${decoration.name}` : "",
      `Delivery: ${deliveryType === "delivery" ? "Delivery" : "Pickup"}`,
      "I'd like to share a reference picture and design details for my cake.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [items, decoration, deliveryType, orderType]);

  const itemsJson = JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      pounds: item.pounds,
      quantity: item.quantity,
    })),
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="container-luxe py-10 lg:py-14">
      <Link
        href="/cakes"
        className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-chocolate/45 transition hover:text-chocolate"
      >
        <ArrowLeft className="size-3.5" />
        Continue shopping
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">
            {orderType === "custom" ? "Custom cake order" : "Online order"}
          </span>
          <h1 className="display-title mt-3">Complete your order.</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-chocolate/50">
            No account needed. Fill in your details, choose delivery or pickup,
            and our team will confirm your order personally.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-chocolate/10 bg-white px-4 py-2 text-[10px] font-semibold text-chocolate/50">
          <ShieldCheck className="size-3.5 text-gold-500" />
          Secure server-validated pricing
        </div>
      </div>

      <form
        action={formAction}
        className="mt-8 grid gap-6 lg:grid-cols-[1.16fr_0.84fr] lg:items-start"
      >
        <input type="hidden" name="items" value={itemsJson} />
        <input type="hidden" name="orderType" value={orderType} />
        <input type="hidden" name="couponCode" value={appliedCode} />
        <input type="hidden" name="startedAt" value={startedAt.current} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] size-px opacity-0"
          aria-hidden="true"
        />

        <div className="space-y-5">
          <SectionCard
            number="01"
            title="Your details"
            description="We'll use these to confirm your order and arrange delivery."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="field-label">
                  Full name *
                </label>
                <input
                  id="name"
                  name="name"
                  className="field"
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  maxLength={80}
                  aria-invalid={Boolean(state.errors?.name)}
                />
                {state.errors?.name ? (
                  <p className="field-error">{state.errors.name}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="phone" className="field-label">
                  Phone number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="field"
                  placeholder="0300-5477201"
                  required
                  autoComplete="tel"
                  aria-invalid={Boolean(state.errors?.phone)}
                />
                {state.errors?.phone ? (
                  <p className="field-error">{state.errors.phone}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="whatsapp" className="field-label">
                  WhatsApp number *
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  className="field"
                  placeholder="0300-5477201"
                  required
                  aria-invalid={Boolean(state.errors?.whatsapp)}
                />
                {state.errors?.whatsapp ? (
                  <p className="field-error">{state.errors.whatsapp}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="email" className="field-label">
                  Email <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="field"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(state.errors?.email)}
                />
                {state.errors?.email ? (
                  <p className="field-error">{state.errors.email}</p>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number="02"
            title="Your basket"
            description="Review your cakes and treats. You can adjust quantities here."
          >
            {items.length === 0 ? (
              <div>
                <div className="rounded-2xl border border-dashed border-chocolate/15 bg-cream-50 p-6 text-center">
                  <ShoppingBag className="mx-auto size-7 text-chocolate/25" />
                  <p className="mt-3 font-display text-xl text-chocolate">
                    Your basket is empty
                  </p>
                  <p className="mt-1 text-[11px] text-chocolate/40">
                    Add something sweet to get started.
                  </p>
                </div>
                <div className="mt-5">
                  <p className="field-label">Popular right now</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {products.slice(0, 6).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addQuickItem(product)}
                        className="flex items-center gap-3 rounded-xl border border-chocolate/10 bg-white p-2.5 text-left transition hover:border-gold-300 hover:bg-cream-50"
                      >
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-semibold text-chocolate">
                            {product.name}
                          </p>
                          <p className="text-[9px] text-chocolate/40">
                            {formatPKR(product.price)}
                            {product.pricing_type === "per_pound" ? "/lb" : " each"}
                          </p>
                        </div>
                        <Plus className="size-3.5 text-gold-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <CartRow
                    key={item.key}
                    item={item}
                    onQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
                <div className="rounded-xl bg-cream-50 px-4 py-3 text-[10px] text-chocolate/40">
                  Want a different cake size? Remove the item and choose again
                  from the cake page, or mention it in your order notes.
                </div>
              </div>
            )}
            {state.errors?.items ? (
              <p className="field-error">{state.errors.items}</p>
            ) : null}
          </SectionCard>

          <SectionCard
            number="03"
            title="Delivery or pickup"
            description="Choose how you'd like to receive your order."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                  deliveryType === "delivery"
                    ? "border-chocolate bg-cream-50 ring-1 ring-chocolate"
                    : "border-chocolate/10 bg-white hover:border-gold-300",
                )}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={deliveryType === "delivery"}
                  onChange={() => setDeliveryType("delivery")}
                  className="mt-1 accent-[#49352D]"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-chocolate">
                    <Truck className="size-4 text-gold-500" />
                    Delivery
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-chocolate/45">
                    {settings.free_delivery_threshold > 0
                      ? `Free on orders over ${formatPKR(settings.free_delivery_threshold)}. Otherwise ${formatPKR(settings.delivery_charge)}.`
                      : `${formatPKR(settings.delivery_charge)} within Dera Ismail Khan.`}
                  </span>
                </span>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                  deliveryType === "pickup"
                    ? "border-chocolate bg-cream-50 ring-1 ring-chocolate"
                    : "border-chocolate/10 bg-white hover:border-gold-300",
                )}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={deliveryType === "pickup"}
                  onChange={() => setDeliveryType("pickup")}
                  className="mt-1 accent-[#49352D]"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-chocolate">
                    <Store className="size-4 text-gold-500" />
                    Pickup
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-chocolate/45">
                    Collect free from {settings.address.split(",")[0]}.
                  </span>
                </span>
              </label>
            </div>

            {deliveryType === "delivery" ? (
              <div className="mt-4">
                <label htmlFor="address" className="field-label">
                  Delivery address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="field min-h-24 resize-y"
                  placeholder="House / street, area, landmark, city"
                  required
                  maxLength={400}
                  aria-invalid={Boolean(state.errors?.address)}
                />
                {state.errors?.address ? (
                  <p className="field-error">{state.errors.address}</p>
                ) : null}
              </div>
            ) : (
              <input type="hidden" name="address" value="" />
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="requiredDate" className="field-label">
                  Required date *
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-chocolate/30" />
                  <input
                    id="requiredDate"
                    name="requiredDate"
                    type="date"
                    min={today}
                    defaultValue={defaultDate}
                    className="field pl-11"
                    required
                    aria-invalid={Boolean(state.errors?.requiredDate)}
                  />
                </div>
                {state.errors?.requiredDate ? (
                  <p className="field-error">{state.errors.requiredDate}</p>
                ) : null}
              </div>
              <div>
                <label htmlFor="requiredTime" className="field-label">
                  Required time *
                </label>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-chocolate/30" />
                  <select
                    id="requiredTime"
                    name="requiredTime"
                    className="field appearance-none pl-11"
                    defaultValue="05:00 PM"
                    required
                    aria-invalid={Boolean(state.errors?.requiredTime)}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                {state.errors?.requiredTime ? (
                  <p className="field-error">{state.errors.requiredTime}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-gold-100/50 px-3.5 py-3 text-[10px] leading-4 text-chocolate/50">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-500" />
              {settings.opening_hours}. Custom cakes need at least 48 hours where
              possible.
            </div>
          </SectionCard>

          <SectionCard
            number="04"
            title="Cake details & design"
            description="These details apply to the cake items in your basket."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="decorationSelect" className="field-label">
                  Decoration finish
                </label>
                <select
                  id="decorationSelect"
                  name="decorationId"
                  className="field"
                  value={decorationId}
                  onChange={(event) => setDecorationId(event.target.value)}
                >
                  {decorations.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                      {option.charge > 0 ? ` — +${formatPKR(option.charge)}` : ""}
                    </option>
                  ))}
                </select>
                {decoration?.description ? (
                  <p className="mt-1.5 text-[10px] text-chocolate/40">
                    {decoration.description}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="cakeColour" className="field-label">
                  Colour theme
                </label>
                <input
                  id="cakeColour"
                  name="cakeColour"
                  className="field"
                  placeholder="e.g. ivory, blush & gold"
                  maxLength={80}
                />
              </div>
              <div>
                <label htmlFor="cakeMessage" className="field-label">
                  Message on cake
                </label>
                <input
                  id="cakeMessage"
                  name="cakeMessage"
                  className="field"
                  placeholder="e.g. Happy Birthday, Ayesha"
                  maxLength={140}
                />
              </div>
              <div>
                <label htmlFor="referenceImage" className="field-label">
                  Reference image <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <label
                  htmlFor="referenceImage"
                  className="flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-chocolate/20 bg-cream-50 px-4 py-3 text-xs text-chocolate/50 transition hover:border-gold-300 hover:bg-cream-100"
                >
                  <UploadCloud className="size-4 text-gold-500" />
                  <span className="truncate">
                    {selectedFileName || "Upload JPG, PNG or WebP (max 5 MB)"}
                  </span>
                </label>
                <input
                  id="referenceImage"
                  name="referenceImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                />
                {previewUrl ? (
                  <div className="relative mt-2 inline-block">
                    <Image
                      src={previewUrl}
                      alt="Reference preview"
                      width={80}
                      height={80}
                      unoptimized
                      className="size-20 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleFile(null);
                        const input = document.getElementById(
                          "referenceImage",
                        ) as HTMLInputElement | null;
                        if (input) input.value = "";
                      }}
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-chocolate text-cream-50"
                      aria-label="Remove selected image"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : null}
                {state.errors?.referenceImage ? (
                  <p className="field-error">{state.errors.referenceImage}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="designDescription" className="field-label">
                Design description{" "}
                {orderType === "custom" ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  <span className="normal-case tracking-normal">(optional)</span>
                )}
              </label>
              <textarea
                id="designDescription"
                name="designDescription"
                className="field min-h-24 resize-y"
                placeholder="Tell us about the occasion, theme, flowers, colours or any special details…"
                maxLength={2000}
                aria-invalid={Boolean(state.errors?.designDescription)}
              />
              {state.errors?.designDescription ? (
                <p className="field-error">{state.errors.designDescription}</p>
              ) : null}
            </div>

            <div className="mt-4">
              <label htmlFor="specialInstructions" className="field-label">
                Special instructions
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                className="field min-h-20 resize-y"
                placeholder="Allergies, eggless request, delivery notes, anything else…"
                maxLength={1500}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-gold-300/40 bg-gold-100/40 p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold-500" />
                <div>
                  <p className="text-[12px] font-semibold leading-5 text-chocolate">
                    If you want a precise cake design, please send your reference
                    picture and design details directly to our WhatsApp number:{" "}
                    {settings.whatsapp}.
                  </p>
                  <a
                    href={buildWhatsAppLink(settings.whatsapp, whatsappDesignMessage)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#1f9d55] px-4 py-2 text-[11px] font-bold text-white transition hover:bg-[#188a49]"
                  >
                    <MessageCircle className="size-3.5" />
                    Send design on WhatsApp
                  </a>
                  <p className="mt-2 text-[9px] leading-4 text-chocolate/40">
                    Opening WhatsApp does not confirm your order. Our team will
                    review and confirm it separately.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            number="05"
            title="Payment method"
            description="Pay when you receive your order or collect it from the bakery."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {settings.payment_methods.map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-chocolate/10 bg-white px-4 py-3 text-[12px] font-medium text-chocolate/70 transition hover:border-gold-300 has-[:checked]:border-chocolate has-[:checked]:bg-cream-50"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    required
                    defaultChecked={method === settings.payment_methods[0]}
                    className="accent-[#49352D]"
                  />
                  {method}
                </label>
              ))}
            </div>
            {state.errors?.paymentMethod ? (
              <p className="field-error">{state.errors.paymentMethod}</p>
            ) : null}
          </SectionCard>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-[1.75rem] border border-chocolate/10 bg-white shadow-soft">
            <div className="border-b border-chocolate/8 bg-chocolate-900 px-6 py-5 text-cream-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold-200">
                    Order summary
                  </p>
                  <h2 className="mt-1 font-display text-2xl">Your sweet list</h2>
                </div>
                <ShoppingBag className="size-5 text-gold-300" />
              </div>
            </div>

            <div className="p-6">
              {items.length === 0 ? (
                <p className="py-5 text-center text-[12px] text-chocolate/40">
                  Add a cake to see your summary.
                </p>
              ) : (
                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.key} className="flex justify-between gap-3 text-[12px]">
                      <div>
                        <p className="font-semibold text-chocolate">{item.name}</p>
                        <p className="text-[10px] text-chocolate/40">
                          {item.pounds ? `${item.pounds} lb × ` : ""}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-chocolate">
                        {formatPKR(calculateLineTotal({
                          pricingType: item.pricingType,
                          unitPrice: item.unitPrice,
                          pounds: item.pounds,
                          quantity: item.quantity,
                        }))}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-2 border-t border-chocolate/10 pt-4 text-[12px]">
                <div className="flex justify-between text-chocolate/55">
                  <span>Cakes subtotal</span>
                  <span>{formatPKR(cartTotals.cakeSubtotal)}</span>
                </div>
                {cartTotals.additionalTotal > 0 ? (
                  <div className="flex justify-between text-chocolate/55">
                    <span>Little treats</span>
                    <span>{formatPKR(cartTotals.additionalTotal)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-chocolate/55">
                  <span>Decoration</span>
                  <span>{formatPKR(decorationCharge)}</span>
                </div>
                <div className="flex justify-between text-chocolate/55">
                  <span>Delivery</span>
                  <span>
                    {deliveryType === "pickup"
                      ? "Free pickup"
                      : deliveryCharge === 0
                        ? "Free"
                        : formatPKR(deliveryCharge)}
                  </span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between font-semibold text-green-700">
                    <span>Discount ({appliedDeal?.code})</span>
                    <span>−{formatPKR(discount)}</span>
                  </div>
                ) : null}
                <div className="flex items-end justify-between border-t border-chocolate/10 pt-3">
                  <span className="font-semibold text-chocolate">Total payable</span>
                  <span className="font-display text-3xl font-semibold text-chocolate">
                    {formatPKR(total)}
                  </span>
                </div>
                <p className="text-[9px] leading-4 text-chocolate/35">
                  {deliveryType === "delivery" && settings.free_delivery_threshold > 0
                    ? goodsTotal >= settings.free_delivery_threshold
                      ? "You've unlocked free delivery."
                      : `Add ${formatPKR(settings.free_delivery_threshold - goodsTotal)} more for free delivery.`
                    : "All prices are in Pakistani Rupees."}
                </p>
              </div>

              <div className="mt-5 border-t border-chocolate/10 pt-4">
                <label htmlFor="coupon" className="field-label">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <BadgePercent className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-chocolate/30" />
                    <input
                      id="coupon"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value);
                        if (appliedCode) setAppliedCode("");
                        setCouponError("");
                      }}
                      className="field py-3 pl-10 uppercase"
                      placeholder="Enter code"
                      maxLength={40}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="rounded-xl bg-cream-200 px-4 text-[10px] font-bold uppercase tracking-wider text-chocolate transition hover:bg-cream-300"
                  >
                    Apply
                  </button>
                </div>
                {couponError ? (
                  <p className="field-error">{couponError}</p>
                ) : null}
                {state.errors?.couponCode ? (
                  <p className="field-error">{state.errors.couponCode}</p>
                ) : null}
                {appliedCode && !couponError ? (
                  <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-green-700">
                    <CheckCircle2 className="size-3" />
                    {appliedCode} applied
                  </p>
                ) : null}
              </div>

              {belowMinimum ? (
                <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-700">
                  Minimum order is {formatPKR(settings.minimum_order)}. Add{" "}
                  {formatPKR(settings.minimum_order - goodsTotal)} more.
                </p>
              ) : null}

              {!state.ok && state.message ? (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[11px] leading-5 text-rose-700"
                >
                  {state.message}
                </p>
              ) : null}

              <div className="mt-5">
                <label className="flex cursor-pointer items-start gap-2.5 text-[10px] leading-4 text-chocolate/50">
                  <input
                    type="checkbox"
                    name="terms"
                    required
                    className="mt-0.5 accent-[#49352D]"
                  />
                  <span>
                    I understand my order is a request and is confirmed only after
                    the bakery contacts me. I agree to be contacted about this
                    order.
                  </span>
                </label>
                {state.errors?.terms ? (
                  <p className="field-error">{state.errors.terms}</p>
                ) : null}
              </div>

              <div className="mt-5">
                <SubmitButton
                  disabled={items.length === 0 || belowMinimum}
                />
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-chocolate/35">
                <ShieldCheck className="size-3" />
                Your information is stored securely and never sold.
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-chocolate/10 bg-cream-100 p-4">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-chocolate/50">
              <Package className="size-3.5 text-gold-500" />
              Need a hand?
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-chocolate/45">
              Call or WhatsApp{" "}
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="font-semibold text-chocolate"
              >
                {settings.phone}
              </a>{" "}
              and we&apos;ll place it with you.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function CartRow({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  onQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}) {
  const lineTotal = calculateLineTotal({
    pricingType: item.pricingType,
    unitPrice: item.unitPrice,
    pounds: item.pounds,
    quantity: item.quantity,
  });

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-chocolate/8 bg-cream-50/70 p-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream-200">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-chocolate">
          {item.name}
        </p>
        <p className="text-[10px] text-chocolate/40">
          {item.pounds ? `${item.pounds} lb · ` : ""}
          {formatPKR(item.unitPrice)}
          {item.pricingType === "per_pound" ? "/lb" : " each"}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center rounded-full border border-chocolate/10 bg-white">
            <button
              type="button"
              onClick={() => onQuantity(item.key, item.quantity - 1)}
              className="flex size-7 items-center justify-center text-chocolate/50"
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus className="size-3" />
            </button>
            <span className="w-6 text-center text-[11px] font-bold">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(item.key, item.quantity + 1)}
              className="flex size-7 items-center justify-center text-chocolate/50"
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus className="size-3" />
            </button>
          </div>
          <p className="text-sm font-semibold text-chocolate">
            {formatPKR(lineTotal)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.key)}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-chocolate/25 transition hover:bg-rose-50 hover:text-rose-600"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
