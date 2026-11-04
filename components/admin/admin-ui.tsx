import Link from "next/link";
import { cn } from "@/lib/utils";
import { statusLabel, statusTone } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.4rem] border border-chocolate/10 bg-white shadow-[0_10px_35px_-24px_rgba(73,53,45,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-3xl leading-tight text-chocolate">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-chocolate/50">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-chocolate/40">
          {label}
        </p>
        {icon ? (
          <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-[1.65rem] font-semibold leading-none text-chocolate">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[10px] leading-4 text-chocolate/40">{hint}</p> : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="block rounded-[1.4rem] border border-chocolate/10 bg-white p-5 shadow-[0_10px_35px_-24px_rgba(73,53,45,0.35)] transition hover:-translate-y-0.5 hover:border-gold-300"
    >
      {body}
    </Link>
  ) : (
    <Panel className="p-5">{body}</Panel>
  );
}

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider",
        statusTone(status),
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon ? (
        <span className="flex size-12 items-center justify-center rounded-full bg-cream-100 text-chocolate/35">
          {icon}
        </span>
      ) : null}
      <p className="mt-4 font-display text-2xl text-chocolate">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[12px] leading-6 text-chocolate/45">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
