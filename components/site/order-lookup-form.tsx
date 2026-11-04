"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  Check,
  Clock3,
  Loader2,
  LockKeyhole,
  Package,
  Search,
  Truck,
} from "lucide-react";
import type { LookupActionState } from "@/app/actions/orders";
import { lookupOrderAction } from "@/app/actions/orders";
import { STATUS_PROGRESS, statusLabel, statusTone } from "@/lib/constants";
import { formatDate, formatPKR } from "@/lib/utils";

const initial: LookupActionState = { ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Checking your order…
        </>
      ) : (
        <>
          <Search className="size-4" />
          Find my order
        </>
      )}
    </button>
  );
}

export function OrderLookupForm() {
  const [state, formAction] = useActionState(lookupOrderAction, initial);
  const order = state.order;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
      <div className="rounded-[2rem] border border-chocolate/10 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-4 text-gold-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-chocolate/45">
            Secure order lookup
          </p>
        </div>
        <h2 className="mt-4 font-display text-3xl text-chocolate">
          Track your order
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-chocolate/50">
          Enter your order ID and the phone number used when ordering. We verify
          both before showing anything.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="orderId" className="field-label">
              Order ID
            </label>
            <input
              id="orderId"
              name="orderId"
              className="field uppercase"
              placeholder="LB-YYMMDD-XXXXXX"
              autoComplete="off"
              required
              aria-describedby={state.errors?.orderId ? "orderId-error" : undefined}
            />
            {state.errors?.orderId ? (
              <p id="orderId-error" className="field-error">
                {state.errors.orderId}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="lookup-phone" className="field-label">
              Phone number
            </label>
            <input
              id="lookup-phone"
              name="phone"
              type="tel"
              className="field"
              placeholder="0300-5477201"
              autoComplete="tel"
              required
              aria-describedby={state.errors?.phone ? "phone-error" : undefined}
            />
            {state.errors?.phone ? (
              <p id="phone-error" className="field-error">
                {state.errors.phone}
              </p>
            ) : null}
          </div>

          {!state.ok && state.message ? (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] leading-5 text-rose-700"
            >
              {state.message}
            </p>
          ) : null}

          <SubmitButton />
        </form>

        <p className="mt-5 text-center text-[10px] leading-4 text-chocolate/35">
          Your phone number is only used to verify this order. It is never shown
          publicly.
        </p>
      </div>

      <div>
        {order ? (
          <div className="overflow-hidden rounded-[2rem] border border-chocolate/10 bg-white shadow-card">
            <div className="border-b border-chocolate/8 bg-cream-50 px-6 py-6 sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/40">
                    Order found
                  </p>
                  <h3 className="mt-1 font-display text-3xl text-chocolate">
                    {order.order_number}
                  </h3>
                  <p className="mt-1 text-[11px] text-chocolate/45">
                    Placed {formatDate(order.created_at, true)} ·{" "}
                    {order.customer_name}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${statusTone(order.status)}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {order.status === "cancelled" ? (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] leading-5 text-rose-700">
                  This order was cancelled. If this doesn&apos;t look right,
                  please contact the bakery on WhatsApp.
                </div>
              ) : (
                <div className="mb-7">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/35">
                    Order progress
                  </p>
                  <div className="mt-4 flex items-start">
                    {STATUS_PROGRESS.filter((step) =>
                      order.delivery_type === "pickup"
                        ? step !== "out_for_delivery"
                        : step !== "ready_for_pickup",
                    ).map((step, index, array) => {
                      const currentIndex = array.indexOf(order.status);
                      const done = currentIndex >= index;
                      return (
                        <div key={step} className="flex flex-1 flex-col items-center">
                          <div className="flex w-full items-center">
                            <div
                              className={`h-0.5 flex-1 ${index === 0 ? "bg-transparent" : done ? "bg-gold-300" : "bg-chocolate/10"}`}
                            />
                            <span
                              className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold transition ${
                                done
                                  ? "border-gold-400 bg-gold-300 text-chocolate"
                                  : "border-chocolate/15 bg-white text-chocolate/30"
                              }`}
                            >
                              {done ? <Check className="size-3.5" /> : index + 1}
                            </span>
                            <div
                              className={`h-0.5 flex-1 ${index === array.length - 1 ? "bg-transparent" : done ? "bg-gold-300" : "bg-chocolate/10"}`}
                            />
                          </div>
                          <p
                            className={`mt-2 text-center text-[8px] font-bold uppercase leading-3 tracking-wide ${
                              done ? "text-chocolate" : "text-chocolate/30"
                            }`}
                          >
                            {statusLabel(step)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-cream-50 p-4">
                  <div className="flex items-center gap-2">
                    {order.delivery_type === "delivery" ? (
                      <Truck className="size-4 text-gold-500" />
                    ) : (
                      <Package className="size-4 text-gold-500" />
                    )}
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                      {order.delivery_type === "delivery"
                        ? "Delivery"
                        : "Pickup"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-chocolate">
                    {formatDate(order.required_date)}
                  </p>
                  <p className="text-[11px] text-chocolate/45">
                    at {order.required_time}
                  </p>
                </div>
                <div className="rounded-2xl bg-cream-50 p-4">
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-gold-500" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                      Payment
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-chocolate">
                    {order.payment_method}
                  </p>
                  <p className="text-[11px] capitalize text-chocolate/45">
                    {order.payment_status}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/35">
                  Items
                </p>
                <div className="mt-2 divide-y divide-chocolate/8">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.product_name}-${index}`}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-chocolate">{item.product_name}</p>
                        <p className="text-[10px] text-chocolate/40">
                          {item.pounds ? `${item.pounds} lb · ` : ""}Qty{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-chocolate">
                        {formatPKR(item.line_total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-chocolate/10 pt-4 text-sm">
                <div className="flex justify-between text-chocolate/50">
                  <span>Cakes</span>
                  <span>{formatPKR(order.subtotal)}</span>
                </div>
                {Number(order.additional_total) > 0 ? (
                  <div className="flex justify-between text-chocolate/50">
                    <span>Little treats</span>
                    <span>{formatPKR(order.additional_total)}</span>
                  </div>
                ) : null}
                {Number(order.decoration_charge) > 0 ? (
                  <div className="flex justify-between text-chocolate/50">
                    <span>Decoration</span>
                    <span>{formatPKR(order.decoration_charge)}</span>
                  </div>
                ) : null}
                {Number(order.delivery_charge) > 0 ? (
                  <div className="flex justify-between text-chocolate/50">
                    <span>Delivery</span>
                    <span>{formatPKR(order.delivery_charge)}</span>
                  </div>
                ) : null}
                {Number(order.discount) > 0 ? (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>−{formatPKR(order.discount)}</span>
                  </div>
                ) : null}
                <div className="flex items-end justify-between border-t border-chocolate/10 pt-3">
                  <span className="font-semibold text-chocolate">Total</span>
                  <span className="font-display text-2xl font-semibold text-chocolate">
                    {formatPKR(order.total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact" className="btn-outline flex-1">
                  Contact bakery
                </Link>
                <Link href="/cakes" className="btn-primary flex-1">
                  Order again
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-chocolate/15 bg-cream-50 p-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-cream-200">
              <Package className="size-6 text-chocolate/40" />
            </span>
            <h3 className="mt-5 font-display text-2xl text-chocolate">
              Your order details will appear here
            </h3>
            <p className="mt-2 max-w-sm text-[13px] leading-6 text-chocolate/45">
              Enter the order ID from your confirmation page along with the phone
              number you used. For your privacy, both are required.
            </p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-gold-500">
              Order ID example · LB-260103-A1B2C3
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
