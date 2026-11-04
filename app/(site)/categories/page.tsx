import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CakeSlice, Sparkles } from "lucide-react";
import { getCakeSizes, getCategories, getProducts } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { formatPKR } from "@/lib/utils";

export const metadata = {
  title: "Cake Categories",
  description:
    "Browse Laiba Bakes cake categories: signature cakes, celebration cakes and little treats. Custom cakes available for every occasion.",
};

export default async function CategoriesPage() {
  const [categories, products, sizes] = await Promise.all([
    getCategories(),
    getProducts(),
    getCakeSizes(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Explore the menu"
        title={
          <>
            A cake for every
            <br />
            <em className="font-normal text-gold-500">occasion.</em>
          </>
        }
        description="From the classics you crave to show-stopping celebration centrepieces, start with a category and make it yours."
        image="/images/birthday-cake.jpg"
        breadcrumb="Cake Categories"
      />

      <section className="py-16 lg:py-24">
        <div className="container-luxe space-y-8">
          {categories.map((category, index) => {
            const categoryProducts = products.filter(
              (product) => product.category_id === category.id,
            );
            const startingPrice = categoryProducts.length
              ? Math.min(...categoryProducts.map((product) => product.price))
              : 0;
            return (
              <Reveal key={category.id}>
                <div
                  className={`grid overflow-hidden rounded-[2rem] border border-chocolate/10 bg-white shadow-card lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative min-h-[300px] overflow-hidden bg-cream-200 lg:min-h-[430px]">
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <CakeSlice className="size-16 text-chocolate/15" />
                      </div>
                    )}
                    <span className="absolute left-5 top-5 rounded-full bg-cream-50/90 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate backdrop-blur">
                      {String(index + 1).padStart(2, "0")} · {category.name}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center p-7 sm:p-11 lg:p-14">
                    <span className="eyebrow">Category</span>
                    <h2 className="mt-4 font-display text-4xl leading-tight text-chocolate sm:text-5xl">
                      {category.name}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-chocolate/60">
                      {category.description}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-2">
                      {categoryProducts.slice(0, 4).map((product) => (
                        <Link
                          key={product.id}
                          href={`/cakes/${product.slug}`}
                          className="rounded-full border border-chocolate/10 bg-cream-50 px-3 py-1.5 text-[10px] font-semibold text-chocolate/65 transition hover:border-gold-300 hover:text-chocolate"
                        >
                          {product.name}
                        </Link>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-chocolate/10 pt-5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/35">
                          {categoryProducts.length} items · from
                        </p>
                        <p className="mt-0.5 font-display text-2xl font-semibold text-chocolate">
                          {startingPrice ? formatPKR(startingPrice) : "Ask us"}
                        </p>
                      </div>
                      <Link
                        href={`/cakes?category=${category.slug}`}
                        className="btn-primary group"
                      >
                        Explore category
                        <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="border-y border-chocolate/10 bg-cream-100 py-16 lg:py-20">
        <div className="container-luxe grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow">Something unique</span>
            <h2 className="section-title mt-4">
              Can&apos;t see exactly
              <br />
              what you imagined?
            </h2>
            <p className="prose-soft mt-5">
              That&apos;s our favourite kind of order. Tell us the occasion, the
              flavours you love and any design inspiration. We&apos;ll create a
              cake that belongs only to your celebration.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/custom-cakes" className="btn-primary">
                <Sparkles className="size-4" />
                Start a custom cake
              </Link>
              <Link href="/contact" className="btn-outline">
                Ask a question
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="overflow-hidden rounded-[1.75rem] border border-chocolate/10 bg-white shadow-card">
              <div className="border-b border-chocolate/8 px-6 py-5">
                <p className="font-display text-2xl text-chocolate">
                  Cake size reference
                </p>
                <p className="mt-1 text-[11px] text-chocolate/45">
                  A helpful guide — flavour prices apply at checkout.
                </p>
              </div>
              <div className="divide-y divide-chocolate/8">
                {sizes.map((size, index) => (
                  <div key={size.id} className="flex items-center gap-4 px-6 py-4">
                    <span className="flex size-10 items-center justify-center rounded-full bg-cream-100 font-display text-lg text-chocolate">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-chocolate">{size.label}</p>
                      <p className="text-[10px] text-chocolate/40">
                        Serves approx. {size.pounds * 6}–{size.pounds * 8} guests
                      </p>
                    </div>
                    <p className="font-display text-xl text-chocolate">
                      {formatPKR(size.reference_price)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="bg-cream-50 px-6 py-4 text-[10px] leading-4 text-chocolate/40">
                Reference prices are for the plain size guide only and are never
                added to flavour-specific pricing.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
