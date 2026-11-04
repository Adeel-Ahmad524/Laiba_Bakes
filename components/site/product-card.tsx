"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { CakeSize, Product } from "@/lib/types";
import { formatPKR, cn } from "@/lib/utils";
import { calculateLineTotal } from "@/lib/pricing";
import { useCart } from "./cart-provider";

export function ProductCard({
  product,
  sizes,
  className,
}: {
  product: Product;
  sizes: CakeSize[];
  className?: string;
}) {
  const { addItem } = useCart();
  const isCake = product.pricing_type === "per_pound";
  const [pounds, setPounds] = useState(sizes[0]?.pounds ?? 1);
  const [quantity, setQuantity] = useState(1);

  const lineTotal = useMemo(
    () =>
      calculateLineTotal({
        pricingType: product.pricing_type,
        unitPrice: product.price,
        pounds: isCake ? pounds : null,
        quantity,
      }),
    [product.pricing_type, product.price, isCake, pounds, quantity],
  );

  const addToBasket = () => {
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
    toast.success(`${product.name} added to your basket`, {
      description: isCake
        ? `${pounds} lb · ${quantity} ${quantity === 1 ? "cake" : "cakes"}`
        : `${quantity} × ${formatPKR(product.price)}`,
    });
  };

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.65rem] border border-chocolate/10 bg-white shadow-card transition duration-500 hover:-translate-y-1 hover:shadow-soft",
        className,
      )}
    >
      <div className="relative aspect-[4/3.4] overflow-hidden bg-cream-200">
        <Link href={`/cakes/${product.slug}`} className="image-zoom block size-full">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-cream-200 font-display text-4xl text-chocolate/20">
              LB
            </div>
          )}
        </Link>
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {product.is_featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-cream-50/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate backdrop-blur">
              <Sparkles className="size-2.5 text-gold-500" />
              Loved
            </span>
          ) : null}
        </div>
        <span className="absolute bottom-4 right-4 rounded-full bg-chocolate-900/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cream-50 backdrop-blur">
          {isCake ? `${formatPKR(product.price)} / lb` : `${formatPKR(product.price)} each`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold-500">
              {product.category?.name ?? (isCake ? "Signature cake" : "Bakery treat")}
            </p>
            <h3 className="mt-1.5 font-display text-[1.45rem] leading-tight text-chocolate">
              <Link href={`/cakes/${product.slug}`} className="hover:text-gold-500">
                {product.name}
              </Link>
            </h3>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-chocolate/55">
          {product.description}
        </p>

        <div className="mt-5 space-y-4 border-t border-chocolate/8 pt-4">
          {isCake ? (
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                Choose size
              </p>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setPounds(size.pounds)}
                    className={cn(
                      "flex-1 rounded-xl border px-1 py-2 text-[10px] font-bold uppercase tracking-wide transition",
                      pounds === size.pounds
                        ? "border-chocolate bg-chocolate text-cream-50"
                        : "border-chocolate/10 bg-cream-50 text-chocolate/60 hover:border-gold-300",
                    )}
                    aria-pressed={pounds === size.pounds}
                  >
                    {size.label.replace(" Pounds", " lb").replace(" Pound", " lb")}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center rounded-full border border-chocolate/10 bg-cream-50">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex size-8 items-center justify-center rounded-full text-chocolate/60 transition hover:text-chocolate"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(50, value + 1))}
                className="flex size-8 items-center justify-center rounded-full text-chocolate/60 transition hover:text-chocolate"
                aria-label="Increase quantity"
              >
                <Plus className="size-3" />
              </button>
            </div>
            <p className="font-display text-xl font-semibold text-chocolate">
              {formatPKR(lineTotal)}
            </p>
          </div>

          <button
            type="button"
            onClick={addToBasket}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-chocolate py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-cream-50 transition hover:bg-chocolate-900"
          >
            <ShoppingBag className="size-3.5" />
            Add to basket
          </button>
        </div>
      </div>
    </article>
  );
}
