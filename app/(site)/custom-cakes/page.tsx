import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Clock3,
  Heart,
  MessageCircle,
  Palette,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  getCakeSizes,
  getDecorations,
  getProducts,
  getSettings,
} from "@/lib/data";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { CustomCakeBuilder } from "@/components/site/custom-cake-builder";
import { buildWhatsAppLink } from "@/lib/constants";

export const metadata = {
  title: "Custom Cake Orders",
  description:
    "Design a custom cake with Laiba Bakes in Dera Ismail Khan. Choose your flavour, size, colours and decoration, upload a reference image or send it on WhatsApp.",
};

export default async function CustomCakesPage() {
  const [products, sizes, decorations, settings] = await Promise.all([
    getProducts(),
    getCakeSizes(),
    getDecorations(),
    getSettings(),
  ]);

  const cakes = products.filter((product) => product.pricing_type === "per_pound");

  return (
    <>
      <PageHero
        eyebrow="The custom cake studio"
        title={
          <>
            A cake that could
            <br />
            <em className="font-normal text-gold-500">only be yours.</em>
          </>
        }
        description="Tell us the moment you're celebrating, the flavours you love and the feeling you want to create. We'll design the rest, by hand."
        image="/images/custom-cake.jpg"
        breadcrumb="Custom Cake Orders"
      >
        <div className="flex flex-wrap gap-2">
          <span className="chip bg-white/70">
            <Clock3 className="size-3 text-gold-500" />
            48-hour notice preferred
          </span>
          <span className="chip bg-white/70">
            <Palette className="size-3 text-gold-500" />
            Custom colours & finishes
          </span>
          <span className="chip bg-white/70">
            <Upload className="size-3 text-gold-500" />
            Reference image upload
          </span>
        </div>
      </PageHero>

      <section className="py-16 lg:py-24">
        <div className="container-luxe">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <Reveal className="lg:sticky lg:top-28">
              <span className="eyebrow">How it works</span>
              <h2 className="section-title mt-4">
                From a thought
                <br />
                to a celebration.
              </h2>
              <p className="prose-soft mt-4">
                Start with one of our signature flavours, then make it personal.
                There are no limits on imagination — only on how much cake one
                table can hold.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    number: "01",
                    title: "Choose your base",
                    text: "Pick a flavour and size to set your starting price.",
                  },
                  {
                    number: "02",
                    title: "Make it personal",
                    text: "Colours, message, decoration and a design description.",
                  },
                  {
                    number: "03",
                    title: "Share your inspiration",
                    text: "Upload a reference picture at checkout or on WhatsApp.",
                  },
                  {
                    number: "04",
                    title: "We confirm everything",
                    text: "Our team reviews your order and contacts you to confirm.",
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold-300 bg-gold-100 font-display text-sm font-semibold text-chocolate">
                      {step.number}
                    </span>
                    <div>
                      <p className="font-display text-xl text-chocolate">
                        {step.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-chocolate/50">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-gold-300/40 bg-gold-100/40 p-5">
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 size-5 shrink-0 text-gold-500" />
                  <div>
                    <p className="text-sm font-semibold text-chocolate">
                      Seeking a precise design?
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-chocolate/55">
                      Send your reference picture and design details directly to
                      our WhatsApp number{" "}
                      <strong className="text-chocolate">{settings.whatsapp}</strong>.
                    </p>
                    <a
                      href={buildWhatsAppLink(
                        settings.whatsapp,
                        "Assalam-o-Alaikum! I'd like to share a reference picture for a custom cake design.",
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#188a49] hover:text-[#116b38]"
                    >
                      <MessageCircle className="size-4" />
                      Send design on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <CustomCakeBuilder
                cakes={cakes}
                sizes={sizes}
                decorations={decorations}
                whatsapp={settings.whatsapp}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-chocolate/10 bg-cream-100 py-16 lg:py-20">
        <div className="container-luxe grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative aspect-[4/3.3] overflow-hidden rounded-[2rem] shadow-soft">
            <Image
              src="/images/birthday-cake.jpg"
              alt="Custom birthday cake design"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 rounded-2xl bg-cream-50/95 px-4 py-3 backdrop-blur">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                Made for the moment
              </p>
              <p className="mt-0.5 font-display text-xl text-chocolate">
                Your story, in cake.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <span className="eyebrow">Good to know</span>
            <h2 className="section-title mt-4">
              A few little details
              <br />
              before we bake.
            </h2>
            <div className="mt-7 space-y-4">
              {[
                {
                  title: "Notice time",
                  text: "We recommend at least 48 hours for custom designs. Need it sooner? Message us — we'll always try.",
                },
                {
                  title: "Design requests",
                  text: "Reference pictures help us understand the look you love. We'll always recreate the feeling, not copy another baker's work exactly.",
                },
                {
                  title: "Flavours & allergens",
                  text: "Eggless and allergy-friendly options may be available on request. Please tell us in your order notes.",
                },
                {
                  title: "Confirmation",
                  text: "Your order is confirmed only after our team reviews it and contacts you. Sending a WhatsApp message alone does not confirm it.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-chocolate text-cream-50">
                    <Check className="size-3" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-chocolate">{item.title}</p>
                    <p className="mt-1 text-[12px] leading-5 text-chocolate/50">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/order?type=custom" className="btn-primary">
                <Sparkles className="size-4" />
                Start your order
              </Link>
              <Link href="/contact" className="btn-outline">
                <Heart className="size-4" />
                Ask us anything
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
