import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { getCakeSizes, getCategories, getProducts } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { formatPKR, cn } from "@/lib/utils";

export const metadata = {
  title: "Our Cakes",
  description:
    "Explore Laiba Bakes signature cakes, celebration cakes, cupcakes, pastries and glass cakes. Prices in PKR, baked fresh to order in Dera Ismail Khan.",
};

export default async function CakesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [products, categories, sizes] = await Promise.all([
    getProducts(),
    getCategories(),
    getCakeSizes(),
  ]);

  const activeCategory = categories.find(
    (category) => category.slug === params.category,
  );
  const search = (params.q ?? "").trim().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesCategory = activeCategory
      ? product.category_id === activeCategory.id
      : true;
    const matchesSearch = search
      ? `${product.name} ${product.description} ${product.flavor}`
          .toLowerCase()
          .includes(search)
      : true;
    return matchesCategory && matchesSearch;
  });

  const cakes = filtered.filter((product) => product.pricing_type === "per_pound");
  const extras = filtered.filter((product) => product.pricing_type === "fixed");

  return (
    <>
      <PageHero
        eyebrow="The cake cabinet"
        title={
          <>
            Cakes for every
            <br />
            <em className="font-normal text-gold-500">kind of happy.</em>
          </>
        }
        description="Six signature flavours, baked fresh in small batches. Choose your size and let us handle the finishing touches."
        image="/images/chocolate-fudge.jpg"
        breadcrumb="Our Cakes"
      >
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <span key={size.id} className="chip bg-white/70">
              {size.label}
            </span>
          ))}
          <span className="chip bg-white/70">Custom sizes on request</span>
        </div>
      </PageHero>

      <section className="py-14 lg:py-20">
        <div className="container-luxe">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/cakes"
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition",
                  !activeCategory
                    ? "border-chocolate bg-chocolate text-cream-50"
                    : "border-chocolate/10 bg-white text-chocolate/60 hover:border-gold-300",
                )}
              >
                All items
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/cakes?category=${category.slug}`}
                  className={cn(
                    "rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition",
                    activeCategory?.id === category.id
                      ? "border-chocolate bg-chocolate text-cream-50"
                      : "border-chocolate/10 bg-white text-chocolate/60 hover:border-gold-300",
                  )}
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <form action="/cakes" className="relative w-full lg:w-72">
              {activeCategory ? (
                <input type="hidden" name="category" value={activeCategory.slug} />
              ) : null}
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-chocolate/30" />
              <input
                type="search"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search cakes & treats"
                className="field py-3 pl-11"
                aria-label="Search cakes"
              />
            </form>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-b border-chocolate/10 pb-4">
            <p className="text-xs font-semibold text-chocolate/50">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
              {activeCategory ? ` in ${activeCategory.name}` : ""}
            </p>
            <p className="hidden items-center gap-1.5 text-[11px] text-chocolate/40 sm:flex">
              <SlidersHorizontal className="size-3.5" />
              All prices include our signature finish
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-3xl text-chocolate">
                No cakes found
              </p>
              <p className="mt-2 text-sm text-chocolate/50">
                Try another search or view the full collection.
              </p>
              <Link href="/cakes" className="btn-primary mt-6">
                View all cakes
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cakes.map((product, index) => (
                  <Reveal key={product.id} delay={index * 50}>
                    <ProductCard product={product} sizes={sizes} />
                  </Reveal>
                ))}
              </div>

              {extras.length > 0 ? (
                <div id="little-treats" className="mt-20 scroll-mt-28">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="eyebrow">Little treats</span>
                      <h2 className="section-title mt-3">Small bakes, big smiles.</h2>
                    </div>
                    <p className="hidden max-w-xs text-right text-xs leading-5 text-chocolate/45 sm:block">
                      Add any of these to your cake order, or order a boxful on
                      their own.
                    </p>
                  </div>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {extras.map((product, index) => (
                      <Reveal key={product.id} delay={index * 50}>
                        <ProductCard product={product} sizes={sizes} />
                      </Reveal>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section className="border-t border-chocolate/10 bg-cream-100 py-14">
        <div className="container-luxe">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="eyebrow">Size & pricing guide</span>
              <h2 className="section-title mt-3">How our cake pricing works.</h2>
              <p className="prose-soft mt-3">
                Each flavour has its own per-pound price. Simply choose the
                flavour and size — the price is calculated as flavour price ×
                weight. Size guide prices below are a reference only and are not
                added to the flavour price.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-chocolate/10 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-chocolate text-cream-50">
                  <tr>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider">
                      Reference price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chocolate/8">
                  {sizes.map((size) => (
                    <tr key={size.id}>
                      <td className="px-5 py-3.5 font-semibold text-chocolate">
                        {size.label}
                      </td>
                      <td className="px-5 py-3.5 text-chocolate/55">
                        {size.pounds} lb
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-chocolate">
                        {formatPKR(size.reference_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-chocolate/8 bg-cream-50 px-5 py-3 text-[10px] leading-4 text-chocolate/40">
                Flavour-specific prices shown on each cake apply at checkout. The
                reference guide is just a helpful starting point.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
