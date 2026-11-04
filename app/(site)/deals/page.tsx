import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, CalendarDays, Sparkles } from "lucide-react";
import { getDeals, getSettings } from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { CopyCode } from "@/components/site/copy-code";
import { formatDate, formatPKR } from "@/lib/utils";

export const metadata = {
  title: "Special Deals",
  description:
    "Current Laiba Bakes special deals and coupon codes. Save on celebration cakes, cupcakes and bakery treats in Dera Ismail Khan.",
};

export default async function DealsPage() {
  const [deals, settings] = await Promise.all([getDeals(), getSettings()]);

  return (
    <>
      <PageHero
        eyebrow="A little extra sweetness"
        title={
          <>
            Special deals,
            <br />
            <em className="font-normal text-gold-500">made to share.</em>
          </>
        }
        description="A few sweet ways to make your celebration go a little further. Apply the code at checkout — no fine print, just cake."
        image="/images/deals-cake.jpg"
        breadcrumb="Special Deals"
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-white/70">
            <BadgePercent className="size-3 text-gold-500" />
            Live offers
          </span>
          <span className="chip bg-white/70">Applied at checkout</span>
        </div>
      </PageHero>

      <section className="py-16 lg:py-24">
        <div className="container-luxe">
          {deals.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-chocolate/20 bg-cream-100 p-12 text-center">
              <Sparkles className="mx-auto size-8 text-gold-500" />
              <h2 className="mt-5 font-display text-3xl text-chocolate">
                A new offer is being whisked up
              </h2>
              <p className="mt-3 text-sm leading-6 text-chocolate/55">
                There are no active deals right now, but our full menu is always
                available. Follow us or message us to hear about the next one.
              </p>
              <Link href="/cakes" className="btn-primary mt-6">
                Browse the cakes
              </Link>
            </div>
          ) : (
            <div className="grid gap-8">
              {deals.map((deal, index) => (
                <Reveal key={deal.id} delay={index * 60}>
                  <article className="grid overflow-hidden rounded-[2rem] border border-chocolate/10 bg-white shadow-card lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative min-h-[260px] overflow-hidden bg-cream-200 lg:min-h-[390px]">
                      <Image
                        src={deal.image_url ?? "/images/deals-cake.jpg"}
                        alt={deal.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/30 to-transparent" />
                      <span className="absolute left-5 top-5 rounded-full bg-cream-50/90 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate backdrop-blur">
                        {deal.discount_type === "percentage"
                          ? `${deal.discount_value}% off`
                          : `${formatPKR(deal.discount_value)} off`}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center p-7 sm:p-11 lg:p-14">
                      <span className="eyebrow">Laiba Bakes offer</span>
                      <h2 className="mt-4 font-display text-4xl leading-tight text-chocolate sm:text-5xl">
                        {deal.title}
                      </h2>
                      <p className="mt-4 text-sm leading-7 text-chocolate/60">
                        {deal.description}
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-chocolate/45">
                        <span className="flex items-center gap-1.5">
                          <BadgePercent className="size-3.5 text-gold-500" />
                          Min. order {formatPKR(deal.minimum_order)}
                        </span>
                        {deal.ends_at ? (
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5 text-gold-500" />
                            Until {formatDate(deal.ends_at)}
                          </span>
                        ) : (
                          <span>Available while the offer lasts</span>
                        )}
                      </div>

                      <div className="mt-7 flex flex-wrap items-center gap-4">
                        {deal.code ? <CopyCode code={deal.code} /> : null}
                        <Link href="/cakes" className="btn-primary group">
                          Order now
                          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-14 grid gap-5 rounded-[2rem] border border-chocolate/10 bg-cream-100 p-7 sm:grid-cols-3 sm:p-9">
            {[
              {
                number: "01",
                title: "Add to basket",
                text: "Choose your cakes and little treats, then head to the online order form.",
              },
              {
                number: "02",
                title: "Enter the code",
                text: "Pop the coupon code into the order summary section before submitting.",
              },
              {
                number: "03",
                title: "We confirm",
                text: "Your discount is validated on our server. Our team then confirms your order.",
              },
            ].map((step) => (
              <div key={step.number}>
                <span className="font-display text-3xl text-gold-400">{step.number}</span>
                <p className="mt-2 font-display text-xl text-chocolate">{step.title}</p>
                <p className="mt-1.5 text-[12px] leading-5 text-chocolate/50">{step.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] leading-5 text-chocolate/35">
            Offers cannot be combined unless stated. Deals apply to the goods
            subtotal and exclude delivery charges. Questions? Call{" "}
            <a
              href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
              className="font-semibold text-chocolate/55 hover:text-chocolate"
            >
              {settings.phone}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
