import Link from "next/link";
import { ArrowLeft, CakeSlice, Home } from "lucide-react";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-50 px-5 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,199,195,0.55),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(213,177,122,0.25),transparent_45%)]" />
      <div className="relative w-full max-w-lg rounded-[2rem] border border-chocolate/10 bg-white p-8 text-center shadow-soft sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream-100 text-gold-500">
          <CakeSlice className="size-7" />
        </span>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-500">
          404 · Page not found
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-chocolate sm:text-5xl">
          This slice has gone missing.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[13px] leading-6 text-chocolate/50">
          The page you are looking for may have moved, or the link is no longer
          available. Let&apos;s get you back to the cake cabinet.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/" className="btn-primary">
            <Home className="size-4" />
            Back to home
          </Link>
          <Link href="/cakes" className="btn-outline">
            <ArrowLeft className="size-4" />
            Browse our cakes
          </Link>
        </div>
        <p className="mt-8 text-[10px] text-chocolate/35">
          Need help?{" "}
          <Link href="/contact" className="font-semibold text-gold-500 hover:text-gold-600">
            Contact Laiba Bakes
          </Link>
        </p>
      </div>
    </main>
  );
}
