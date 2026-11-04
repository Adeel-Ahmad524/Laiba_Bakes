"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CakeSlice,
  ChevronRight,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { logoutAdminAction } from "@/app/actions/auth";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: CakeSlice },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/deals", label: "Deals", icon: Tag },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/reports", label: "Sales & profit", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/deals": "Special deals",
  "/admin/messages": "Messages",
  "/admin/reports": "Sales & profit",
  "/admin/settings": "Business settings",
};

function getTitle(pathname: string) {
  if (pathname.startsWith("/admin/orders/")) return "Order detail";
  if (pathname.startsWith("/admin/products/new")) return "New product";
  if (pathname.startsWith("/admin/products/")) return "Edit product";
  if (pathname.startsWith("/admin/categories/")) return "Edit category";
  if (pathname.startsWith("/admin/deals/")) return "Edit deal";
  return TITLES[pathname] ?? "Admin";
}

export function AdminShell({
  children,
  name,
  email,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F7F2EA]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-chocolate-900 text-cream-100 lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-cream-100/10 px-6">
          <span className="flex size-10 items-center justify-center rounded-full border border-gold-300/50 bg-cream-50/5 font-display text-lg font-semibold text-cream-50">
            LB
          </span>
          <div>
            <p className="font-display text-xl font-semibold leading-none text-cream-50">
              Laiba Bakes
            </p>
            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-gold-200">
              Admin studio
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition",
                  active
                    ? "bg-cream-50/10 text-cream-50"
                    : "text-cream-100/55 hover:bg-cream-50/5 hover:text-cream-50",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-gold-300" : "text-cream-100/35",
                  )}
                />
                {item.label}
                {active ? (
                  <ChevronRight className="ml-auto size-3 text-gold-300" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-cream-100/10 p-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-cream-100/50 transition hover:bg-cream-50/5 hover:text-cream-50"
          >
            <ExternalLink className="size-3.5" />
            View live website
          </Link>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-cream-50/5 px-3 py-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-gold-300 text-[10px] font-bold text-chocolate-900">
              {initials(name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-cream-50">{name}</p>
              <p className="truncate text-[9px] text-cream-100/40">{email}</p>
            </div>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="text-cream-100/35 transition hover:text-rose-300"
                aria-label="Sign out"
              >
                <LogOut className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-chocolate/10 bg-[#F7F2EA]/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex size-9 items-center justify-center rounded-full border border-chocolate/10 bg-white lg:hidden"
                aria-label="Open admin menu"
              >
                <Menu className="size-4" />
              </button>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/35">
                  Admin
                </p>
                <h1 className="font-display text-xl leading-tight text-chocolate">
                  {getTitle(pathname)}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="hidden items-center gap-1.5 rounded-full border border-chocolate/10 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-chocolate/55 transition hover:border-gold-300 hover:text-chocolate sm:flex"
              >
                <ExternalLink className="size-3" />
                Website
              </Link>
              <Link
                href="/admin/orders?status=new"
                className="flex items-center gap-2 rounded-full bg-chocolate px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-cream-50 transition hover:bg-chocolate-900"
              >
                <Package className="size-3" />
                New orders
              </Link>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-7 lg:p-8">{children}</main>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[60] transition lg:hidden",
          open ? "visible" : "invisible",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-chocolate-900/50 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-[280px] bg-chocolate-900 p-4 text-cream-100 shadow-2xl transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-2 py-2">
            <div>
              <p className="font-display text-xl text-cream-50">Laiba Bakes</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-gold-200">
                Admin studio
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex size-9 items-center justify-center rounded-full border border-cream-100/15"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>
          <nav className="mt-5 space-y-1">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium",
                    active
                      ? "bg-cream-50/10 text-cream-50"
                      : "text-cream-100/55",
                  )}
                >
                  <item.icon className="size-4 text-gold-300" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action={logoutAdminAction} className="mt-6">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl border border-cream-100/10 px-3.5 py-3 text-[12px] text-cream-100/55"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
