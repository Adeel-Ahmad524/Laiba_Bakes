/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CakeSlice,
  MapPin,
  MessageCircle,
  Phone,
  ReceiptText,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import { getAdminOrderById } from "@/lib/admin-data";
import { AdminError, AdminSuccess } from "@/components/admin/admin-banners";
import { CopyOrderId } from "@/components/site/copy-order-id";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Panel, StatusPill } from "@/components/admin/admin-ui";
import { buildWhatsAppLink } from "@/lib/constants";
import { displayPhone, formatDate, formatPKR } from "@/lib/utils";

export const metadata = { title: "Order detail" };

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getAdminOrderById(id);
  if (!result) notFound();

  const { order, items, customization, referenceSignedUrl } = result;
  const customer = order.customer;
  const whatsappMessage = `Assalam-o-Alaikum ${customer.name}! This is Laiba Bakes regarding your order ${order.order_number}. We would like to confirm the details with you.`;

  return (
    <div className="space-y-5">
      {query.updated ? <AdminSuccess>Order updated successfully.</AdminSuccess> : null}
      {query.error ? (
        <AdminError>That update could not be saved. Please check the values and try again.</AdminError>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-chocolate/40 transition hover:text-chocolate"
          >
            <ArrowLeft className="size-3" />
            All orders
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-3xl leading-tight text-chocolate">
              {order.order_number}
            </h2>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-1 text-[11px] text-chocolate/45">
            Placed {formatDate(order.created_at, true)} ·{" "}
            {order.order_type === "custom" ? "Custom cake order" : "Standard order"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyOrderId value={order.order_number} />
          <a
            href={buildWhatsAppLink(customer.whatsapp || customer.phone, whatsappMessage)}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp min-h-10 px-5 text-[11px]"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp customer
          </a>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-start">
        <div className="space-y-5">
          <Panel className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
                <ReceiptText className="size-4" />
              </span>
              <h3 className="font-display text-xl text-chocolate">Items ordered</h3>
            </div>

            <div className="mt-4 divide-y divide-chocolate/8">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-chocolate">
                      {item.product_name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-chocolate/40">
                      {item.pounds ? `${item.pounds} lb · ` : ""}Qty {item.quantity} ·{" "}
                      {item.pricing_type === "per_pound"
                        ? `${formatPKR(item.unit_price)}/lb`
                        : `${formatPKR(item.unit_price)} each`}
                    </p>
                  </div>
                  <p className="text-[12px] font-semibold text-chocolate">
                    {formatPKR(item.line_total)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2 border-t border-chocolate/10 pt-4 text-[12px]">
              <div className="flex justify-between text-chocolate/50">
                <span>Cakes subtotal</span>
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
                <span className="font-semibold text-chocolate">Order total</span>
                <span className="font-display text-2xl font-semibold text-chocolate">
                  {formatPKR(order.total)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gold-100/60 px-3 py-2 text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-chocolate/55">
                  <Sparkles className="size-3.5 text-gold-500" />
                  Estimated profit (private)
                </span>
                <span className="font-semibold text-chocolate">
                  {formatPKR(order.estimated_profit)}
                </span>
              </div>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
                <CakeSlice className="size-4" />
              </span>
              <h3 className="font-display text-xl text-chocolate">Cake & design details</h3>
            </div>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Decoration finish", value: order.decoration_style },
                { label: "Colour theme", value: order.cake_colour },
                { label: "Message on cake", value: order.cake_message },
                { label: "Flavour", value: customization?.flavour },
                { label: "Weight", value: customization?.weight },
                { label: "Quantity", value: customization?.quantity?.toString() },
              ].map((entry) => (
                <div key={entry.label}>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                    {entry.label}
                  </dt>
                  <dd className="mt-1 text-[12px] text-chocolate/70">
                    {entry.value || "—"}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  Design description
                </p>
                <p className="mt-1 whitespace-pre-line text-[12px] leading-6 text-chocolate/65">
                  {order.design_description || customization?.design_description || "—"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  Customer notes
                </p>
                <p className="mt-1 whitespace-pre-line text-[12px] leading-6 text-chocolate/65">
                  {order.customer_notes || customization?.special_instructions || "—"}
                </p>
              </div>
            </div>

            {referenceSignedUrl ? (
              <div className="mt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-chocolate/35">
                  Reference image
                </p>
                <a
                  href={referenceSignedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block overflow-hidden rounded-2xl border border-chocolate/10"
                >
                  <img
                    src={referenceSignedUrl}
                    alt="Customer reference"
                    className="max-h-80 w-full object-cover"
                  />
                </a>
                <p className="mt-1.5 text-[9px] text-chocolate/35">
                  Private link expires after one hour.
                </p>
              </div>
            ) : null}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
                <UserRound className="size-4" />
              </span>
              <h3 className="font-display text-xl text-chocolate">Customer</h3>
            </div>
            <p className="mt-4 text-[13px] font-semibold text-chocolate">{customer.name}</p>
            <div className="mt-3 space-y-2 text-[11px] text-chocolate/60">
              <a
                href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center gap-2 hover:text-chocolate"
              >
                <Phone className="size-3.5 text-gold-500" />
                {displayPhone(customer.phone)}
              </a>
              {customer.whatsapp ? (
                <a
                  href={buildWhatsAppLink(customer.whatsapp, whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-chocolate"
                >
                  <MessageCircle className="size-3.5 text-gold-500" />
                  WhatsApp {displayPhone(customer.whatsapp)}
                </a>
              ) : null}
              {customer.email ? (
                <a
                  href={`mailto:${customer.email}`}
                  className="flex items-center gap-2 break-all hover:text-chocolate"
                >
                  <ReceiptText className="size-3.5 text-gold-500" />
                  {customer.email}
                </a>
              ) : null}
            </div>
            {customer.address ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-cream-50 px-3 py-2.5 text-[11px] leading-5 text-chocolate/55">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-500" />
                {customer.address}
              </div>
            ) : null}
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
                {order.delivery_type === "delivery" ? (
                  <Truck className="size-4" />
                ) : (
                  <CalendarClock className="size-4" />
                )}
              </span>
              <h3 className="font-display text-xl text-chocolate">
                {order.delivery_type === "delivery" ? "Delivery" : "Pickup"}
              </h3>
            </div>
            <p className="mt-3 text-[13px] font-semibold text-chocolate">
              {formatDate(order.required_date)} at {order.required_time}
            </p>
            <p className="mt-1 text-[11px] text-chocolate/45">
              Payment: {order.payment_method} ·{" "}
              <span className="capitalize">{order.payment_status}</span>
            </p>
            <p className="mt-1 text-[10px] text-chocolate/35">
              WhatsApp opened by customer: {order.whatsapp_opened ? "Yes" : "No"}
            </p>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <h3 className="font-display text-xl text-chocolate">Update order</h3>
            <p className="mt-1 text-[10px] leading-4 text-chocolate/40">
              Changing the status does not notify the customer automatically. Use
              WhatsApp or a phone call to keep them updated.
            </p>
            <div className="mt-4">
              <OrderStatusForm
                id={order.id}
                status={order.status}
                paymentStatus={order.payment_status}
                internalNotes={order.internal_notes ?? null}
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
