"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { CakeSize, Product } from "@/lib/types";
import { calculateLineTotal } from "@/lib/pricing";
import { formatPKR, cn } from "@/lib/utils";
import { useCart } from "./cart-provider";

export function ProductOrderPanel({
  product,
  sizes,
}: {
  product: Product;
  sizes: CakeSize[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const isCake = product.pricing_type === "per_pound";
  const [pounds, setPounds] = useState(sizes[0]?.pounds ?? 1);
  const [quantity, setQuantity] = useState(1);

  const total = useMemo(
    () =>
      calculateLineTotal({
        pricingType: product.pricing_type,
        unitPrice: product.price,
        pounds: isCake ? pounds : null,
        quantity,
      }),
    [product.pricing_type, product.price, isCake, pounds, quantity],
  );

  const add = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image_url,
      pricingType: product.pricing_type,
      unitPrice: product.price,
      pounds: isCake ? pounds : null,
      quantity,
    });
    toast.success(`${product.name} added to your basket`);
  };

  const buyNow = () => {
    add();
    router.push(
      `/order?product=${encodeURIComponent(product.slug)}${isCake ? `&pounds=${pounds}` : ""}`,
    );
  };

  return (
    <div className="rounded-[1.75rem] border border-chocolate/10 bg-cream-50 p-5 sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/40">
            {isCake ? "Price per pound" : "Price each"}
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-chocolate">
            {formatPKR(product.price)}
            <span className="ml-1 font-sans text-[11px] font-medium text-chocolate/40">
              {isCake ? "/ lb" : "each"}
            </span>
          </p>
        </div>
        <span className="chip">Baked to order</span>
      </div>

      {isCake ? (
        <div className="mt-6">
          <p className="field-label">Choose your size</p>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                onClick={() => setPounds(size.pounds)}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  pounds === size.pounds
                    ? "border-chocolate bg-chocolate text-cream-50"
                    : "border-chocolate/10 bg-white text-chocolate hover:border-gold-300",
                )}
                aria-pressed={pounds === size.pounds}
              >
                <span className="block text-[11px] font-bold">{size.label}</span>
                <span
                  className={cn(
                    "mt-0.5 block text-[10px]",
                    pounds === size.pounds ? "text-cream-100/60" : "text-chocolate/40",
                  )}
                >
                  {formatPKR(product.price * size.pounds)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="field-label mb-0">Quantity</p>
          <div className="mt-2 inline-flex items-center rounded-full border border-chocolate/10 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex size-9 items-center justify-center text-chocolate/60"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(50, value + 1))}
              className="flex size-9 items-center justify-center text-chocolate/60"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/40">
            Your total
          </p>
          <p className="mt-1 font-display text-3xl font-semibold text-chocolate">
            {formatPKR(total)}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-2">
        <button type="button" onClick={buyNow} className="btn-primary w-full">
          Order this now
          <ArrowRight className="size-4" />
        </button>
        <button type="button" onClick={add} className="btn-outline w-full">
          <ShoppingBag className="size-4" />
          Add to basket
        </button>
      </div>

      <p className="mt-4 text-center text-[10px] leading-4 text-chocolate/40">
        Custom messages, colours, decorations and reference images can be added
        on the next step.
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-chocolate/10 pt-4 text-[10px] text-chocolate/45">
        <span>Need help choosing?</span>
        <Link
          href="/contact"
          className="font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600"
        >
          Talk to us
        </Link>
      </div>
    </div>
  );
}
