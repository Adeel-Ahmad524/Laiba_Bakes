import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ReceiptText,
  Truck,
} from "lucide-react";
import { getOrderByToken } from "@/app/actions/orders";
import { ClearCartOnMount } from "@/components/site/clear-cart-on-mount";
import { CopyOrderId } from "@/components/site/copy-order-id";
import { WhatsAppConfirmLink } from "@/components/site/whatsapp-confirm-link";
import { getSettings } from "@/lib/data";
import { buildWhatsAppLink, statusLabel } from "@/lib/constants";
import { formatDate, formatPKR } from "@/lib/utils";

export const metadata = {
  title: "Order received",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const [order, settings] = await Promise.all([
    token ? getOrderByToken(token) : Promise.resolve(null),
    getSettings(),
  ]);

  if (!order) {
    return (
      <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-cream-200">
          <ReceiptText className="size-7 text-chocolate/40" />
        </span>
        <h1 className="mt-6 font-display text-4xl text-chocolate">
          We couldn&apos;t find that order
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-chocolate/50">
          This confirmation link may have expired or is incomplete. If you have
          your order ID, you can track it from the My Orders page.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/my-orders" className="btn-primary">
            Track my order
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  const customer = order.customer;
  const items = order.order_items ?? [];
  const whatsappMessage = `Assalam-o-Alaikum Laiba Bakes! I've just placed order ${order.order_number}. Total: ${formatPKR(order.total)}. I'd like to confirm a few details.`;

  return (
    <>
      <ClearCartOnMount />
      <section className="relative overflow-hidden bg-cream-100 py-12 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,199,195,0.5),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(213,177,122,0.2),transparent_40%)]" />
        <div className="container-luxe relative text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-8 text-green-700" />
          </span>
          <span className="eyebrow mt-6 justify-center">Order received</span>
          <h1 className="display-title mt-4">
            Thank you, {customer?.name?.split(" ")[0] || "friend"}.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-chocolate/55">
            Your order request has been saved. Our team will review it and contact
            you to confirm the details. Your order is not confirmed until then.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-wrap items-center justify-center gap-3 rounded-2xl border border-chocolate/10 bg-white p-4 shadow-card">
            <div className="flex-1 text-left">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-chocolate/40">
                Your order ID
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-wide text-chocolate">
                {order.order_number}
              </p>
            </div>
            <span className="rounded-full border border-gold-300 bg-gold-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-chocolate">
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-[10px] leading-4 text-chocolate/40">
            Save this order ID. You&apos;ll need it with your phone number to
            track your order on the My Orders page.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container-luxe grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-chocolate/10 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-chocolate">
                  Order details
                </h2>
                <span className="text-[10px] text-chocolate/40">
                  {formatDate(order.created_at, true)}
                </span>
              </div>

              <div className="mt-5 divide-y divide-chocolate/8">
                {items.map((item) => (
                  <div
                    key={item.id}
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

              <div className="mt-4 space-y-2 border-t border-chocolate/10 pt-4 text-sm">
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
                  <span className="font-semibold text-chocolate">Total payable</span>
                  <span className="font-display text-3xl font-semibold text-chocolate">
                    {formatPKR(order.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-chocolate/10 bg-white p-5">
                <div className="flex items-center gap-2">
                  {order.delivery_type === "delivery" ? (
                    <Truck className="size-4 text-gold-500" />
                  ) : (
                    <Package className="size-4 text-gold-500" />
                  )}
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                    {order.delivery_type === "delivery" ? "Delivery" : "Pickup"}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-chocolate">
                  {formatDate(order.required_date)} at {order.required_time}
                </p>
                {order.delivery_type === "delivery" ? (
                  <p className="mt-1 text-[11px] leading-5 text-chocolate/45">
                    {customer?.address ?? "Address confirmed by phone"}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] leading-5 text-chocolate/45">
                    <MapPin className="mr-1 inline size-3" />
                    {settings.address}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-chocolate/10 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-gold-500" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
                    Payment
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-chocolate">
                  {order.payment_method}
                </p>
                <p className="mt-1 text-[11px] capitalize text-chocolate/45">
                  Status: {order.payment_status}
                </p>
                <p className="mt-1 text-[11px] text-chocolate/45">
                  Contact: {customer?.phone}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[1.75rem] border border-chocolate/10 bg-chocolate-900 p-6 text-cream-50 shadow-soft sm:p-8">
              <span className="eyebrow text-gold-200">What happens next</span>
              <ol className="mt-5 space-y-4">
                {[
                  "Our team reviews your order and checks availability.",
                  "We contact you on WhatsApp or by phone to confirm.",
                  "Your cake is freshly prepared for your chosen date.",
                  "You collect it or we deliver it to your door.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-gold-300/30 text-[10px] font-bold text-gold-200">
                      {index + 1}
                    </span>
                    <span className="text-[12px] leading-5 text-cream-100/65">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-7 space-y-2">
                <WhatsAppConfirmLink
                  token={token ?? ""}
                  href={buildWhatsAppLink(settings.whatsapp, whatsappMessage)}
                  className="btn-whatsapp w-full"
                >
                  <MessageCircle className="size-4" />
                  Confirm on WhatsApp
                </WhatsAppConfirmLink>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="btn border border-cream-50/20 text-cream-50 hover:bg-cream-50/10"
                >
                  <Phone className="size-4" />
                  Call the bakery
                </a>
              </div>
              <p className="mt-3 text-center text-[9px] leading-4 text-cream-100/35">
                Sending a WhatsApp message helps us find your order, but does not
                confirm it automatically. Confirmation is completed by our team.
              </p>
            </div>

            <div className="rounded-2xl border border-gold-300/40 bg-gold-100/50 p-5">
              <div className="flex items-center gap-2">
                <ReceiptText className="size-4 text-gold-500" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-chocolate/55">
                  Keep your order ID
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3">
                <p className="flex-1 font-display text-xl font-semibold tracking-wide text-chocolate">
                  {order.order_number}
                </p>
                <CopyOrderId value={order.order_number} />
              </div>
              <Link
                href="/my-orders"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600"
              >
                Track this order
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <Link href="/cakes" className="btn-outline w-full">
              Continue shopping
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
