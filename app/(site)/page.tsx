import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CakeSlice,
  Check,
  Clock3,
  Heart,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { getCakeSizes, getCategories, getDeals, getProducts, getSettings } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { ProductCard } from "@/components/site/product-card";
import { buildWhatsAppLink } from "@/lib/constants";
import { formatDate, formatPKR } from "@/lib/utils";

export default async function HomePage() {
  const [settings, products, categories, sizes, deals] = await Promise.all([
    getSettings(),
    getProducts(),
    getCategories(),
    getCakeSizes(),
    getDeals(),
  ]);

  const featured = products.filter((product) => product.is_featured).slice(0, 6);
  const extras = products.filter((product) => product.pricing_type === "fixed");
  const featuredDeal = deals[0];

  return (
    <>
      <section className="relative overflow-hidden bg-cream-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_4%,rgba(232,199,195,0.55),transparent_34%),radial-gradient(circle_at_88%_80%,rgba(213,177,122,0.24),transparent_38%)]" />
        <div className="container-luxe relative grid min-h-[calc(100vh-110px)] items-center gap-12 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="relative z-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-chocolate/10 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-chocolate/65 backdrop-blur">
                <Sparkles className="size-3 text-gold-500" />
                Dera Ismail Khan&apos;s little patisserie
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-7 font-display text-[3.5rem] leading-[0.96] tracking-[-0.03em] text-chocolate sm:text-7xl lg:text-[5.4rem]">
                A little slice
                <br />
                of <em className="font-normal text-gold-500">joy,</em> baked
                <br />
                just for you.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 max-w-lg text-[15px] leading-7 text-chocolate/65 sm:text-base">
                Soft layers, silky frosting and flavours made for your happiest
                moments. From everyday treats to one-of-a-kind celebration cakes,
                everything is baked fresh to order.
              </p>
            </Reveal>

            <Reveal delay={230}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/cakes" className="btn-primary group">
                  Explore our cakes
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/custom-cakes" className="btn-outline bg-white/60">
                  Design your dream cake
                </Link>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-chocolate/10 pt-7">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["O", "C", "V"].map((letter, index) => (
                      <span
                        key={letter}
                        className="flex size-8 items-center justify-center rounded-full border-2 border-cream-100 bg-chocolate text-[9px] font-bold text-cream-50"
                        style={{ zIndex: 3 - index }}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5 text-gold-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="size-3 fill-current" />
                      ))}
                    </div>
                    <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-chocolate/50">
                      Baked fresh, every single day
                    </p>
                  </div>
                </div>
                <div className="h-9 w-px bg-chocolate/10" />
                <div>
                  <p className="font-display text-xl font-semibold text-chocolate">
                    48 hrs
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-chocolate/45">
                    Custom cake notice
                  </p>
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-chocolate">
                    PKR
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-chocolate/45">
                    Honest, local pricing
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150} className="relative">
            <div className="relative mx-auto max-w-[560px]">
              <div className="absolute -inset-3 -rotate-2 rounded-[2.8rem] border border-gold-300/40 sm:-inset-5" />
              <div className="relative aspect-[4/4.7] overflow-hidden rounded-[2.4rem] shadow-[0_35px_80px_-30px_rgba(73,53,45,0.45)]">
                <Image
                  src="/images/hero-cake.jpg"
                  alt="Elegant chocolate celebration cake by Laiba Bakes"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/40 via-transparent to-transparent" />
              </div>

              <div className="absolute -left-4 top-10 hidden animate-float-slow rounded-2xl border border-white/60 bg-white/90 p-4 shadow-soft backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-blush-100 text-blush-500">
                    <Heart className="size-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-chocolate/40">
                      Made with
                    </p>
                    <p className="font-display text-lg leading-tight text-chocolate">
                      Real butter & love
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -right-3 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-soft backdrop-blur sm:-right-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-gold-100 text-gold-500">
                    <CakeSlice className="size-5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-chocolate/40">
                      Cakes from
                    </p>
                    <p className="font-display text-lg font-semibold leading-tight text-chocolate">
                      {formatPKR(1100)}{" "}
                      <span className="font-sans text-[10px] font-medium text-chocolate/45">
                        / pound
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-chocolate/10 bg-white">
        <div className="container-luxe grid grid-cols-2 divide-x divide-chocolate/10 lg:grid-cols-4">
          {[
            { icon: CakeSlice, title: "Baked to order", text: "Nothing sits on a shelf" },
            { icon: Sparkles, title: "Custom designs", text: "Your idea, our craft" },
            { icon: Truck, title: "Delivery & pickup", text: "Across Dera Ismail Khan" },
            { icon: MessageCircle, title: "Easy ordering", text: "Online or WhatsApp" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 px-3 py-6 first:pl-0 last:pr-0 sm:px-6 lg:py-7"
            >
              <item.icon className="size-5 shrink-0 text-gold-500" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-chocolate">
                  {item.title}
                </p>
                <p className="mt-0.5 hidden text-[11px] text-chocolate/45 sm:block">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="container-luxe">
          <Reveal>
            <SectionHeading
              eyebrow="Our cake cabinet"
              title={
                <>
                  The cakes everyone
                  <br className="hidden sm:block" /> comes back for.
                </>
              }
              description="Six signature flavours, each baked in small batches with premium ingredients and finished by hand. Choose your size — we'll take care of the rest."
              action={{ href: "/cakes", label: "View all cakes" }}
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} sizes={sizes} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-chocolate-900 py-20 text-cream-50 lg:py-28">
        <div className="container-luxe grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-[540px]">
              <div className="absolute -inset-3 rotate-2 rounded-[2.5rem] border border-gold-300/30" />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/about-bakery.jpg"
                  alt="Fresh bakes at Laiba Bakes"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-5 rounded-2xl bg-cream-50 p-5 text-chocolate shadow-soft sm:left-8">
                <p className="font-display text-3xl font-semibold">100%</p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/45">
                  Made fresh to order
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <span className="eyebrow text-gold-200">Our story</span>
            <h2 className="mt-5 font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
              A home kitchen with
              <br />
              <em className="font-normal text-gold-200">really big dreams.</em>
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-7 text-cream-100/60">
              Laiba Bakes began with a simple belief: the cakes we share should
              feel as special as the moments they celebrate. Every sponge is
              mixed, every layer filled and every flower piped by hand in our
              Dera Ismail Khan kitchen.
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-cream-100/60">
              We keep our menu focused, our ingredients honest and our prices
              clear — so you can simply enjoy the sweet part.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Small-batch baking, never mass produced",
                "Premium butter, cream and real chocolate",
                "Custom designs for every celebration",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3 text-sm text-cream-100/75">
                  <span className="flex size-6 items-center justify-center rounded-full border border-gold-300/30 bg-gold-300/10">
                    <Check className="size-3 text-gold-200" />
                  </span>
                  {point}
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-gold-200 transition hover:text-gold-100"
            >
              Read our story
              <ArrowUpRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-luxe">
          <Reveal>
            <SectionHeading
              eyebrow="Cake categories"
              title="Find your kind of celebration."
              description="A cake for every table, every age and every reason to gather."
              align="center"
            />
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {categories.map((category, index) => {
              const categoryProducts = products.filter(
                (product) => product.category_id === category.id,
              );
              return (
                <Reveal key={category.id} delay={index * 80}>
                  <Link
                    href={`/cakes?category=${category.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem]"
                  >
                    {category.image_url ? (
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full bg-cream-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/85 via-chocolate-900/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-7">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gold-200">
                        {categoryProducts.length} {categoryProducts.length === 1 ? "cake" : "cakes"}
                      </p>
                      <h3 className="mt-2 font-display text-3xl text-cream-50">
                        {category.name}
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[11px] text-cream-100/55">
                          Explore the collection
                        </span>
                        <span className="flex size-9 items-center justify-center rounded-full border border-cream-100/25 text-cream-50 transition duration-300 group-hover:bg-gold-300 group-hover:text-chocolate-900">
                          <ArrowUpRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-blush-100 py-20 lg:py-24">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal className="relative">
            <div className="relative mx-auto aspect-[4/3] max-w-[560px] overflow-hidden rounded-[2rem] shadow-soft">
              <Image
                src="/images/custom-cake.jpg"
                alt="Custom celebration cake"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-2 hidden rounded-2xl bg-chocolate p-4 text-cream-50 shadow-soft sm:block">
              <p className="font-display text-xl">Have an idea?</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gold-200">
                Let&apos;s make it real
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <span className="eyebrow">Custom cake studio</span>
            <h2 className="section-title mt-4">
              Your imagination,
              <br />
              <em className="font-normal text-gold-500">beautifully baked.</em>
            </h2>
            <p className="prose-soft mt-5 max-w-lg">
              A birthday, a wedding, a quiet thank-you — tell us the occasion,
              share a reference picture and we&apos;ll design a cake that feels
              unmistakably yours.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Sparkles, text: "Fully customised design" },
                { icon: Heart, text: "Flavour & colour your way" },
                { icon: Clock3, text: "48-hour notice preferred" },
                { icon: MessageCircle, text: "Share inspo on WhatsApp" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2.5 rounded-xl bg-white/65 px-3.5 py-3 text-[12px] font-medium text-chocolate/70"
                >
                  <item.icon className="size-4 text-gold-500" />
                  {item.text}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/custom-cakes" className="btn-primary group">
                Start your custom cake
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
              <a
                href={buildWhatsAppLink(
                  settings.whatsapp,
                  "Assalam-o-Alaikum! I have a custom cake idea I'd love to discuss.",
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-outline border-chocolate/20 bg-white/50"
              >
                <MessageCircle className="size-4" />
                Send your idea
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-luxe">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <span className="eyebrow">Little treats</span>
              <h2 className="section-title mt-4">
                A small sweetness
                <br />
                for ordinary days.
              </h2>
              <p className="prose-soft mt-5">
                Not every craving needs a whole cake. Our glass cakes, cupcakes
                and fresh pastries are ready for a quiet tea break or a little
                office pick-me-up.
              </p>
              <Link href="/cakes#little-treats" className="btn-outline mt-7">
                Browse little treats
              </Link>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {extras.map((product, index) => (
                <Reveal key={product.id} delay={index * 60}>
                  <div className="group flex items-center gap-4 rounded-2xl border border-chocolate/10 bg-white p-3.5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg leading-tight text-chocolate">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-chocolate/45">
                        {formatPKR(product.price)} each
                      </p>
                      <Link
                        href={`/cakes/${product.slug}`}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600"
                      >
                        View treat
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {featuredDeal ? (
        <section className="bg-cream-200 py-20 lg:py-24">
          <div className="container-luxe">
            <Reveal className="overflow-hidden rounded-[2.25rem] bg-white shadow-soft">
              <div className="grid lg:grid-cols-2">
                <div className="relative min-h-[280px] overflow-hidden lg:min-h-[430px]">
                  <Image
                    src={featuredDeal.image_url ?? "/images/deals-cake.jpg"}
                    alt={featuredDeal.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute left-5 top-5 rounded-full bg-cream-50/95 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate">
                    Special deal
                  </div>
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-12">
                  <span className="eyebrow">A little thank you</span>
                  <h2 className="mt-4 font-display text-4xl leading-tight text-chocolate sm:text-5xl">
                    {featuredDeal.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-chocolate/60">
                    {featuredDeal.description}
                  </p>
                  <div className="mt-6 rounded-2xl border border-dashed border-gold-300 bg-gold-100/45 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/45">
                      Use code at checkout
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-display text-2xl font-semibold tracking-[0.08em] text-chocolate">
                        {featuredDeal.code}
                      </p>
                      <span className="text-[10px] font-semibold text-chocolate/50">
                        Min. order {formatPKR(featuredDeal.minimum_order)}
                      </span>
                    </div>
                  </div>
                  {featuredDeal.ends_at ? (
                    <p className="mt-3 text-[11px] text-chocolate/40">
                      Available until {formatDate(featuredDeal.ends_at)}
                    </p>
                  ) : null}
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/deals" className="btn-primary">
                      See all deals
                    </Link>
                    <Link href="/cakes" className="btn-outline">
                      Shop the cakes
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="py-20 lg:py-28">
        <div className="container-luxe">
          <Reveal>
            <SectionHeading
              eyebrow="The Laiba promise"
              title="Small details. Big difference."
              align="center"
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Freshly baked",
                text: "Every cake is made after you order — never pulled from a freezer or left on display for days.",
              },
              {
                number: "02",
                title: "Thoughtful design",
                text: "From the first sketch to the final piped detail, we design around your occasion and your taste.",
              },
              {
                number: "03",
                title: "Clear, fair pricing",
                text: "Flavour prices per pound, transparent extras and no surprise charges. What you see is what you pay.",
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-chocolate/10 bg-white p-7 shadow-card">
                  <span className="font-display text-5xl font-semibold text-gold-200">
                    {item.number}
                  </span>
                  <h3 className="mt-5 font-display text-2xl text-chocolate">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-chocolate/55">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-chocolate-900 py-16 text-cream-50 lg:py-20">
        <div className="absolute inset-0 opacity-[0.07]">
          <Image
            src="/images/hero-cake.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="container-luxe relative text-center">
          <Reveal>
            <span className="eyebrow justify-center text-gold-200">
              Let&apos;s celebrate
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
              Something sweet is
              <br />
              waiting to be made.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-cream-100/60">
              Order online for delivery or pickup, or send us a message and
              we&apos;ll help you choose the perfect cake.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/order" className="btn-gold group">
                Order online
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="btn border border-cream-50/20 text-cream-50 hover:bg-cream-50/10"
              >
                <Phone className="size-4" />
                Call {settings.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
