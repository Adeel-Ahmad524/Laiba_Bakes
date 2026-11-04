import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  name = "Laiba Bakes",
  className,
  light = false,
}: {
  name?: string;
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "relative flex size-11 shrink-0 items-center justify-center rounded-full border transition-transform duration-500 group-hover:rotate-6",
          light
            ? "border-gold-300/60 bg-cream-50/5 text-cream-50"
            : "border-gold-300/70 bg-cream-50 text-chocolate",
        )}
      >
        <span className="font-display text-lg font-semibold tracking-tight">LB</span>
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-gold-300" />
      </span>
      <span className="flex flex-col">
        <span
          className={cn(
            "font-display text-[1.35rem] font-semibold leading-none tracking-tight",
            light ? "text-cream-50" : "text-chocolate",
          )}
        >
          {name}
        </span>
        <span
          className={cn(
            "mt-1 text-[8.5px] font-bold uppercase tracking-[0.34em]",
            light ? "text-gold-200" : "text-gold-500",
          )}
        >
          Patisserie & Bakes
        </span>
      </span>
    </Link>
  );
}
