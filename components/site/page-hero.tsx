import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumb,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  image?: string;
  breadcrumb?: string;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-chocolate/10 bg-cream-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(232,199,195,0.45),transparent_40%),radial-gradient(circle_at_88%_85%,rgba(213,177,122,0.22),transparent_38%)]" />
      <div
        className={cn(
          "container-luxe relative grid items-center gap-10",
          image ? "lg:grid-cols-[1.1fr_0.9fr]" : "",
          compact ? "py-12 lg:py-16" : "py-16 lg:py-24",
        )}
      >
        <div className={cn(!image && "mx-auto max-w-3xl text-center")}>
          {breadcrumb ? (
            <div
              className={cn(
                "mb-5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-chocolate/40",
                !image && "justify-center",
              )}
            >
              <Link href="/" className="transition hover:text-chocolate">
                Home
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-gold-500">{breadcrumb}</span>
            </div>
          ) : null}
          <span className={cn("eyebrow", !image && "justify-center")}>{eyebrow}</span>
          <h1 className="display-title mt-4">{title}</h1>
          {description ? (
            <p
              className={cn(
                "prose-soft mt-5 max-w-xl",
                !image && "mx-auto",
              )}
            >
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-7">{children}</div> : null}
        </div>

        {image ? (
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rotate-2 rounded-[2.5rem] border border-gold-300/30" />
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                className="size-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/20 to-transparent" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
