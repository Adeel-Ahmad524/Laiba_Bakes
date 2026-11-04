import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CakeSlice,
  Heart,
  Leaf,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";
import { getSettings } from "@/lib/data";
import { Reveal } from "@/components/site/reveal";
import { buildWhatsAppLink } from "@/lib/constants";

export const metadata = {
  title: "About Us",
  description:
    "The story behind Laiba Bakes — a small-batch patisserie in Dera Ismail Khan creating beautifully baked cakes and treats for life's sweet moments.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <section className="relative overflow-hidden bg-cream-100 py-16 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(232,199,195,0.55),transparent_38%),radial-gradient(circle_at_10%_90%,rgba(213,177,122,0.2),transparent_40%)]" />
        <div className="container-luxe relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <span className="eyebrow">Our story</span>
            <h1 className="display-title mt-5">
              Baked with love,
              <br />
              <em className="font-normal text-gold-500">in our home town.</em>
            </h1>
            <p className="prose-soft mt-6 max-w-lg">
              Laiba Bakes is a small-batch bakery in the heart of Dera Ismail
              Khan. We make cakes the way we believe they should be: fresh,
              thoughtful, generous and made for real people and real moments.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cakes" className="btn-primary">
                See our cakes
                <ArrowRight className="size-4" />
              </Link>
              <a
                href={buildWhatsAppLink(
                  settings.whatsapp,
                  "Assalam-o-Alaikum! I'd love to know more about Laiba Bakes.",
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-outline bg-white/50"
              >
                <MessageCircle className="size-4" />
                Say hello
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative mx-auto max-w-[500px]">
              <div className="absolute -inset-4 rotate-2 rounded-[2.5rem] border border-gold-300/40" />
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2rem] shadow-soft">
                <Image
                  src="/images/about-bakery.jpg"
                  alt="Baking at Laiba Bakes"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -left-3 bottom-8 rounded-2xl bg-white p-4 shadow-soft sm:-left-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-blush-100">
                    <Heart className="size-5 text-blush-500" />
                  </span>
                  <div>
                    <p className="font-display text-lg leading-tight text-chocolate">
                      Made by hand
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-chocolate/40">
                      In Dera Ismail Khan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-luxe grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal>
            <span className="eyebrow">Why we bake</span>
            <h2 className="section-title mt-4">
              Every cake should
              <br />
              feel like an occasion.
            </h2>
          </Reveal>
          <Reveal delay={80} className="space-y-5 text-[15px] leading-8 text-chocolate/65">
            <p>
              It started with a simple cake for a family birthday — and the
              realization that a really good cake can change the feeling of a
              whole room. That&apos;s the feeling we chase every time we turn on
              the oven.
            </p>
            <p>
              We keep our batches small so we can pay attention. We weigh our
              ingredients, taste our fillings and finish every edge by hand. No
              shortcuts, no day-old stock, no cake that looks better than it
              tastes.
            </p>
            <p>
              Our menu is intentionally focused: the flavours we know and love,
              made exceptionally well. For everything else, there is the custom
              cake studio — where your ideas become the brief.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-gold-100">
                <Star className="size-5 text-gold-500" />
              </span>
              <div>
                <p className="font-display text-xl text-chocolate">
                  The Laiba Bakes promise
                </p>
                <p className="text-[11px] text-chocolate/45">
                  Fresh, honest and made with care.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-chocolate/10 bg-chocolate-900 py-16 text-cream-50 lg:py-24">
        <div className="container-luxe">
          <Reveal className="text-center">
            <span className="eyebrow justify-center text-gold-200">What we value</span>
            <h2 className="mt-4 font-display text-4xl text-cream-50 sm:text-5xl">
              Small bakery. Big care.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: CakeSlice,
                title: "Freshness first",
                text: "Everything is baked to order, so what reaches you is at its softest, most delicious best.",
              },
              {
                icon: Leaf,
                title: "Honest ingredients",
                text: "Real butter, cream and chocolate. We choose quality over shortcuts, every time.",
              },
              {
                icon: Sparkles,
                title: "Thoughtful design",
                text: "From piped details to the ribbon on the box, we care about how the whole thing feels.",
              },
            ].map((value, index) => (
              <Reveal key={value.title} delay={index * 70}>
                <div className="h-full rounded-[1.75rem] border border-cream-100/10 bg-cream-50/5 p-7">
                  <span className="flex size-11 items-center justify-center rounded-full border border-gold-300/25 bg-gold-300/10">
                    <value.icon className="size-5 text-gold-200" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl text-cream-50">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-cream-100/55">
                    {value.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-luxe">
          <Reveal>
            <div className="grid overflow-hidden rounded-[2.25rem] border border-chocolate/10 bg-white shadow-card lg:grid-cols-2">
              <div className="relative min-h-[300px] overflow-hidden lg:min-h-[440px]">
                <Image
                  src="/images/vanilla-cake.jpg"
                  alt="Vanilla cake detail"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
                <span className="eyebrow">Visit the bakery</span>
                <h2 className="mt-4 font-display text-4xl leading-tight text-chocolate sm:text-5xl">
                  Come by for
                  <br />
                  something sweet.
                </h2>
                <p className="mt-4 text-sm leading-7 text-chocolate/55">
                  Pickups are welcome from our kitchen at{" "}
                  <strong className="font-semibold text-chocolate">
                    {settings.address}
                  </strong>
                  . Call ahead to make sure your order is ready and waiting.
                </p>
                <div className="mt-6 space-y-2 text-sm text-chocolate/60">
                  <p>
                    <span className="font-semibold text-chocolate">Hours:</span>{" "}
                    {settings.opening_hours}
                  </p>
                  <p>
                    <span className="font-semibold text-chocolate">Phone:</span>{" "}
                    {settings.phone}
                  </p>
                  <p>
                    <span className="font-semibold text-chocolate">Email:</span>{" "}
                    {settings.email}
                  </p>
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary">
                    Get directions
                  </Link>
                  <Link href="/custom-cakes" className="btn-outline">
                    Design a cake
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
