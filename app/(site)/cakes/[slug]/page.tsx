import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { getCakeSizes, getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { ProductOrderPanel } from "@/components/site/product-order-panel";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { buildWhatsAppLink } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Cake not found" };
  return {
    title: product.name,
    description:
      product.description ??
      `Order ${product.name} online from Laiba Bakes in Dera Ismail Khan.`,
    openGraph: {
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, sizes, products, settings] = await Promise.all([
    getProductBySlug(slug),
    getCakeSizes(),
    getProducts(),
    getSettings(),
  ]);

  if (!product) notFound();

  const related = products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.pricing_type === product.pricing_type &&
        item.category_id === product.category_id,
    )
    .slice(0, 3);

  return (
    <>
      <section className="bg-cream-100 py-8">
        <div className="container-luxe">
          <Link
            href="/cakes"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-chocolate/50 transition hover:text-chocolate"
          >
            <ArrowLeft className="size-3.5" />
            Back to all cakes
          </Link>
        </div>
      </section>

      <section className="py-10 lg:py-16">
        <div className="container-luxe grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/4.3] overflow-hidden rounded-[2rem] bg-cream-200 shadow-soft">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : null}
              <span className="absolute left-5 top-5 rounded-full bg-cream-50/90 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate backdrop-blur">
                {product.category?.name ?? "Fresh bake"}
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <span className="eyebrow">{product.flavor ?? "Laiba Bakes"}</span>
            <h1 className="display-title mt-4">{product.name}</h1>
            <p className="mt-4 text-[15px] leading-7 text-chocolate/65">
              {product.description}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 border-y border-chocolate/10 py-4 text-center">
              <div>
                <Clock3 className="mx-auto size-4 text-gold-500" />
                <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-chocolate/50">
                  48hr custom notice
                </p>
              </div>
              <div>
                <Check className="mx-auto size-4 text-gold-500" />
                <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-chocolate/50">
                  Freshly baked
                </p>
              </div>
              <div>
                <ShieldCheck className="mx-auto size-4 text-gold-500" />
                <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider text-chocolate/50">
                  Quality ingredients
                </p>
              </div>
            </div>

            <div className="mt-6">
              <ProductOrderPanel product={product} sizes={sizes} />
            </div>

            <a
              href={buildWhatsAppLink(
                settings.whatsapp,
                `Assalam-o-Alaikum! I'd like to ask about the ${product.name}.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-chocolate/50 transition hover:text-[#1f9d55]"
            >
              <MessageCircle className="size-3.5" />
              Questions about this cake? Message us on WhatsApp
            </a>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-chocolate/10 bg-cream-100 py-14">
        <div className="container-luxe">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-display text-xl text-chocolate">What&apos;s inside</p>
              <p className="mt-2 text-[13px] leading-6 text-chocolate/55">
                {product.flavor
                  ? `A ${product.flavor.toLowerCase()} cake made with premium ingredients, layered and finished by hand.`
                  : "Baked fresh in small batches with real butter and quality ingredients."}
              </p>
            </div>
            <div>
              <p className="font-display text-xl text-chocolate">Allergens</p>
              <p className="mt-2 text-[13px] leading-6 text-chocolate/55">
                Contains wheat, dairy and eggs. May contain traces of nuts. Tell
                us about allergies in your order notes.
              </p>
            </div>
            <div>
              <p className="font-display text-xl text-chocolate">Storage</p>
              <p className="mt-2 text-[13px] leading-6 text-chocolate/55">
                Keep refrigerated and bring to room temperature 20–30 minutes
                before serving for the softest crumb.
              </p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="py-16 lg:py-20">
          <div className="container-luxe">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">You may also love</span>
                <h2 className="section-title mt-3">More from the cabinet.</h2>
              </div>
              <Link
                href="/cakes"
                className="hidden text-sm font-semibold text-chocolate/60 hover:text-chocolate sm:block"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.id} delay={index * 60}>
                  <ProductCard product={item} sizes={sizes} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
