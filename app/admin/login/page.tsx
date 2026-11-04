import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { getSafeRedirectPath } from "@/lib/redirects";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; setup?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured && isSupabaseAdminConfigured;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
      <div className="relative hidden overflow-hidden bg-chocolate-900 lg:block">
        <Image
          src="/images/chocolate-fudge.jpg"
          alt=""
          fill
          sizes="50vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900 via-chocolate-900/45 to-chocolate-900/10" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full border border-gold-300/50 bg-cream-50/5 font-display text-lg text-cream-50">
              LB
            </span>
            <div>
              <p className="font-display text-xl text-cream-50">Laiba Bakes</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-gold-200">
                Patisserie & bakes
              </p>
            </div>
          </Link>
          <div className="max-w-md">
            <span className="eyebrow text-gold-200">The admin studio</span>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-cream-50">
              Every cake,
              <br />
              every order,
              <br />
              in one place.
            </h1>
            <p className="mt-5 text-sm leading-7 text-cream-100/55">
              Manage your menu, orders, offers and business details from one
              beautifully simple dashboard.
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-cream-100/25">
            10 Civil Lines · Dera Ismail Khan
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream-50 px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-chocolate/40 transition hover:text-chocolate"
          >
            <ArrowLeft className="size-3.5" />
            Back to website
          </Link>

          <div className="mt-10 flex size-12 items-center justify-center rounded-full bg-chocolate text-cream-50">
            <LockKeyhole className="size-5" />
          </div>
          <h2 className="mt-6 font-display text-4xl text-chocolate">
            Welcome back.
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-chocolate/50">
            Sign in with your administrator account to manage Laiba Bakes.
          </p>

          {!configured ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[12px] leading-5 text-amber-800">
              <div className="flex gap-2">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">Supabase setup required</p>
                  <p className="mt-1">
                    Add the environment variables from{" "}
                    <code className="rounded bg-amber-100 px-1">.env.example</code>{" "}
                    and run the migrations. Then create an admin account with{" "}
                    <code className="rounded bg-amber-100 px-1">
                      npm run create-admin
                    </code>
                    .
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {params.error === "not_admin" ? (
            <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] leading-5 text-rose-700">
              That account does not have administrator access.
            </p>
          ) : null}

          {params.setup === "required" ? (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-700">
              Configure Supabase before signing in.
            </p>
          ) : null}

          <div className="mt-7">
            <AdminLoginForm
              next={getSafeRedirectPath(params.next, "/admin")}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-chocolate/10 bg-cream-100 p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
              Security note
            </p>
            <p className="mt-1 text-[10px] leading-5 text-chocolate/45">
              Admin access is protected by Supabase Authentication and
              server-side membership checks. Customer accounts are not required
              or supported.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
