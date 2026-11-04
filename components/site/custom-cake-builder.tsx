"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { CakeSize, DecorationOption, Product } from "@/lib/types";
import { calculateLineTotal } from "@/lib/pricing";
import { buildWhatsAppLink } from "@/lib/constants";
import { formatPKR, cn } from "@/lib/utils";
import { useCart } from "./cart-provider";

export function CustomCakeBuilder({
  cakes,
  sizes,
  decorations,
  whatsapp,
}: {
  cakes: Product[];
  sizes: CakeSize[];
  decorations: DecorationOption[];
  whatsapp: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [productId, setProductId] = useState(cakes[0]?.id ?? "");
  const [pounds, setPounds] = useState(sizes[0]?.pounds ?? 1);
  const [colour, setColour] = useState("");
  const [message, setMessage] = useState("");
  const [design, setDesign] = useState("");
  const [decorationId, setDecorationId] = useState(decorations[0]?.id ?? "");

  const product = cakes.find((item) => item.id === productId) ?? cakes[0];
  const decoration =
    decorations.find((item) => item.id === decorationId) ?? decorations[0];

  const total = useMemo(
    () =>
      product &&
      calculateLineTotal({
        pricingType: product.pricing_type,
        unitPrice: product.price,
        pounds,
        quantity: 1,
      }),
    [product, pounds],
  );

  const whatsappMessage = useMemo(() => {
    return [
      "Assalam-o-Alaikum Laiba Bakes! I'd like a custom cake.",
      product ? `Flavour: ${product.name}` : "",
      `Size: ${pounds} pound`,
      colour ? `Colour theme: ${colour}` : "",
      message ? `Message on cake: ${message}` : "",
      decoration ? `Finish: ${decoration.name}` : "",
      design ? `Design idea: ${design}` : "",
      "I'll share a reference picture here on WhatsApp.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [product, pounds, colour, message, decoration, design]);

  if (!product) {
    return (
      <div className="rounded-[2rem] border border-chocolate/10 bg-white p-8 text-center">
        <p className="font-display text-2xl text-chocolate">
          Our cake menu is being updated
        </p>
        <p className="mt-2 text-sm text-chocolate/50">
          Please message us on WhatsApp and we&apos;ll help you place a custom
          order.
        </p>
        <a
          href={buildWhatsAppLink(whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="btn-whatsapp mt-5"
        >
          Message us
        </a>
      </div>
    );
  }

  const continueToOrder = () => {
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
    try {
      sessionStorage.setItem(
        "laiba-bakes-custom-draft",
        JSON.stringify({
          cakeColour: colour,
          cakeMessage: message,
          designDescription: design,
          decorationId,
        }),
      );
    } catch {
      // Draft prefill is a convenience; checkout still works without it.
    }
    toast.success("Your cake is in the basket — add the finishing details next.");
    router.push(
      `/order?type=custom&product=${encodeURIComponent(product.slug)}&pounds=${pounds}`,
    );
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-chocolate/10 bg-white shadow-soft">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-6 sm:p-9 lg:p-10">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-chocolate/50">
              Build your custom cake
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="custom-flavour" className="field-label">
                Cake flavour
              </label>
              <select
                id="custom-flavour"
                className="field"
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                {cakes.map((cake) => (
                  <option key={cake.id} value={cake.id}>
                    {cake.name} — {formatPKR(cake.price)}/lb
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="field-label">Choose your size</p>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setPounds(size.pounds)}
                    className={cn(
                      "rounded-xl border px-2 py-3 text-center text-[11px] font-bold transition",
                      pounds === size.pounds
                        ? "border-chocolate bg-chocolate text-cream-50"
                        : "border-chocolate/10 bg-cream-50 text-chocolate/60 hover:border-gold-300",
                    )}
                    aria-pressed={pounds === size.pounds}
                  >
                    {size.label}
                    <span className="mt-0.5 block text-[9px] font-medium opacity-60">
                      {formatPKR(product.price * size.pounds)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="custom-colour" className="field-label">
                  Colour theme
                </label>
                <input
                  id="custom-colour"
                  value={colour}
                  onChange={(event) => setColour(event.target.value)}
                  className="field"
                  placeholder="e.g. blush pink & gold"
                  maxLength={80}
                />
              </div>
              <div>
                <label htmlFor="custom-message" className="field-label">
                  Message on cake
                </label>
                <input
                  id="custom-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="field"
                  placeholder="e.g. Happy Birthday, Sara"
                  maxLength={140}
                />
              </div>
            </div>

            <div>
              <label htmlFor="custom-decoration" className="field-label">
                Decoration finish
              </label>
              <select
                id="custom-decoration"
                value={decorationId}
                onChange={(event) => setDecorationId(event.target.value)}
                className="field"
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
              <label htmlFor="custom-design" className="field-label">
                Tell us your design idea
              </label>
              <textarea
                id="custom-design"
                value={design}
                onChange={(event) => setDesign(event.target.value)}
                className="field min-h-28 resize-y"
                placeholder="The occasion, colours, flowers, theme, anything you'd love us to include…"
                maxLength={2000}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between bg-chocolate-900 p-6 text-cream-50 sm:p-9 lg:p-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-200">
              Your cake, your way
            </p>
            <h3 className="mt-3 font-display text-3xl leading-tight text-cream-50">
              {product.name}
            </h3>
            <p className="mt-2 text-sm text-cream-100/55">
              {pounds} pound · {decoration?.name ?? "Classic finish"}
            </p>

            <div className="mt-7 space-y-3 border-y border-cream-100/10 py-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-cream-100/55">Cake ({pounds} lb)</span>
                <span>{formatPKR(total ?? 0)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-cream-100/55">Decoration</span>
                <span>
                  {decoration && decoration.charge > 0
                    ? formatPKR(decoration.charge)
                    : "Included"}
                </span>
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream-100/40">
                Estimated total
              </span>
              <span className="font-display text-3xl text-gold-200">
                {formatPKR((total ?? 0) + (decoration?.charge ?? 0))}
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-cream-100/35">
              Delivery charges, extra items and discounts are calculated at
              checkout. Final total is confirmed by our team.
            </p>

            <button
              type="button"
              onClick={continueToOrder}
              className="btn-gold mt-7 w-full"
            >
              Continue to order details
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-gold-300/20 bg-cream-50/5 p-4">
            <p className="text-[11px] leading-5 text-cream-100/60">
              Want a precise design? Send your reference picture and design
              details directly to our WhatsApp number{" "}
              <span className="font-bold text-gold-200">{whatsapp}</span>.
            </p>
            <a
              href={buildWhatsAppLink(whatsapp, whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#54d98c] transition hover:text-[#7ce6a9]"
            >
              <MessageCircle className="size-4" />
              Send design on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
